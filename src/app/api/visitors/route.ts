import { NextResponse } from "next/server";
let kv: any = null;
try {
  const kvModule = require("@vercel/kv");
  kv = kvModule.kv;
} catch {
  // @vercel/kv not available in dev environment
}

import { hasSupabaseConfig, supabaseServer } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

const VISITOR_COUNTER_KEY = "kishore:campaign:visitor-count";
const VISITOR_ROW_KEY = "visitor_count";
let memoryVisitorCounter = 0;

async function getVisitorCountFromSupabase() {
  if (!hasSupabaseConfig || !supabaseServer) {
    return null;
  }

  const { data, error } = await supabaseServer
    .from("support_counter")
    .select("count")
    .eq("key", VISITOR_ROW_KEY)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return typeof data.count === "number" ? data.count : Number(data.count);
}

async function incrementVisitorCountWithCompareAndSwap() {
  if (!hasSupabaseConfig || !supabaseServer) {
    return null;
  }

  await supabaseServer
    .from("support_counter")
    .upsert({ key: VISITOR_ROW_KEY, count: 0 }, { onConflict: "key", ignoreDuplicates: true });

  for (let attempt = 0; attempt < 5; attempt += 1) {
    if (attempt > 0) {
      await new Promise((resolve) => setTimeout(resolve, Math.min(100 * Math.pow(1.5, attempt), 500)));
    }

    const { data: currentRow, error: readError } = await supabaseServer
      .from("support_counter")
      .select("count")
      .eq("key", VISITOR_ROW_KEY)
      .maybeSingle();

    if (readError || !currentRow) {
      return null;
    }

    const currentCount = typeof currentRow.count === "number" ? currentRow.count : Number(currentRow.count);
    const safeCurrent = Number.isFinite(currentCount) && currentCount >= 0 ? currentCount : 0;
    const nextCount = safeCurrent + 1;

    const { data: updatedRow, error: updateError } = await supabaseServer
      .from("support_counter")
      .update({ count: nextCount })
      .eq("key", VISITOR_ROW_KEY)
      .eq("count", safeCurrent)
      .select("count")
      .maybeSingle();

    if (!updateError && updatedRow) {
      const updatedCount = typeof updatedRow.count === "number" ? updatedRow.count : Number(updatedRow.count);
      return Number.isFinite(updatedCount) && updatedCount >= 0 ? updatedCount : nextCount;
    }
  }

  return null;
}

async function getVisitorCount() {
  const supabaseCount = await getVisitorCountFromSupabase();

  if (typeof supabaseCount === "number" && Number.isFinite(supabaseCount)) {
    return supabaseCount;
  }

  try {
    const value = await kv.get(VISITOR_COUNTER_KEY);

    if (typeof value === "number") {
      return value;
    }

    if (typeof value === "string") {
      const parsed = Number(value);
      return Number.isFinite(parsed) ? parsed : 0;
    }
  } catch {
    // Fall back to in-memory counter when KV is not configured.
  }

  return memoryVisitorCounter;
}

async function incrementVisitorCount() {
  if (hasSupabaseConfig && supabaseServer) {
    const supabaseNext = await incrementVisitorCountWithCompareAndSwap();
    if (typeof supabaseNext === "number") {
      return supabaseNext;
    }

    throw new Error("Failed to increment visitor counter in Supabase");
  }

  const currentCount = await getVisitorCount();
  const nextCount = currentCount + 1;

  try {
    return await kv.incr(VISITOR_COUNTER_KEY);
  } catch {
    memoryVisitorCounter = nextCount;
    return memoryVisitorCounter;
  }
}

export async function GET() {
  const count = await getVisitorCount();
  return NextResponse.json({ count });
}

export async function POST() {
  try {
    const count = await incrementVisitorCount();
    return NextResponse.json({ count });
  } catch {
    return NextResponse.json({ error: "Unable to update visitor count. Please retry." }, { status: 503 });
  }
}