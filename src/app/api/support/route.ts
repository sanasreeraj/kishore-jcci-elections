import { NextResponse } from "next/server";
let kv: any = null;
try {
  const kvModule = require("@vercel/kv");
  kv = kvModule.kv;
} catch (e) {
  // @vercel/kv not available in dev environment
}

import { hasSupabaseConfig, supabaseServer } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

const SUPPORT_COUNTER_KEY = "kishore:campaign:support-count";
const SUPPORT_ROW_KEY = "support_count";
let memorySupportCounter = 121;

async function getSupportCountFromSupabase() {
  if (!hasSupabaseConfig || !supabaseServer) {
    return null;
  }

  const { data, error } = await supabaseServer
    .from("support_counter")
    .select("count")
    .eq("key", SUPPORT_ROW_KEY)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return typeof data.count === "number" ? data.count : Number(data.count);
}

async function setSupportCountInSupabase(count: number) {
  if (!hasSupabaseConfig || !supabaseServer) {
    return;
  }

  const { error } = await supabaseServer
    .from("support_counter")
    .upsert({ key: SUPPORT_ROW_KEY, count }, { onConflict: "key" });

  if (error) {
    throw new Error(error.message);
  }
}

async function incrementSupportCountInSupabase() {
  if (!hasSupabaseConfig || !supabaseServer) {
    return null;
  }

  const { data, error } = await supabaseServer.rpc("increment_support_counter");

  if (error) {
    return null;
  }

  const nextCount = typeof data === "number" ? data : Number(data);
  return Number.isFinite(nextCount) && nextCount >= 0 ? nextCount : null;
}

async function incrementSupportCountWithCompareAndSwap() {
  if (!hasSupabaseConfig || !supabaseServer) {
    return null;
  }

  await supabaseServer
    .from("support_counter")
    .upsert({ key: SUPPORT_ROW_KEY, count: 0 }, { onConflict: "key", ignoreDuplicates: true });

  for (let attempt = 0; attempt < 5; attempt += 1) {
    if (attempt > 0) {
      await new Promise((resolve) => setTimeout(resolve, Math.min(100 * Math.pow(1.5, attempt), 500)));
    }
    const { data: currentRow, error: readError } = await supabaseServer
      .from("support_counter")
      .select("count")
      .eq("key", SUPPORT_ROW_KEY)
      .maybeSingle();

    if (readError || !currentRow) {
      return null;
    }

    const currentCount =
      typeof currentRow.count === "number" ? currentRow.count : Number(currentRow.count);
    const safeCurrent = Number.isFinite(currentCount) && currentCount >= 0 ? currentCount : 0;
    const nextCount = safeCurrent + 1;

    const { data: updatedRow, error: updateError } = await supabaseServer
      .from("support_counter")
      .update({ count: nextCount })
      .eq("key", SUPPORT_ROW_KEY)
      .eq("count", safeCurrent)
      .select("count")
      .maybeSingle();

    if (!updateError && updatedRow) {
      const updatedCount =
        typeof updatedRow.count === "number" ? updatedRow.count : Number(updatedRow.count);
      return Number.isFinite(updatedCount) && updatedCount >= 0 ? updatedCount : nextCount;
    }
  }

  return null;
}

async function getSupportCount() {
  const supabaseCount = await getSupportCountFromSupabase();

  if (typeof supabaseCount === "number" && Number.isFinite(supabaseCount)) {
    return supabaseCount;
  }

  try {
    const value = await kv.get(SUPPORT_COUNTER_KEY);

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

  return memorySupportCounter;
}

async function incrementSupportCount() {
  if (hasSupabaseConfig && supabaseServer) {
    const supabaseNext = await incrementSupportCountInSupabase();
    if (typeof supabaseNext === "number") {
      return supabaseNext;
    }

    const fallbackNext = await incrementSupportCountWithCompareAndSwap();
    if (typeof fallbackNext === "number") {
      return fallbackNext;
    }

    throw new Error("Failed to increment support counter in Supabase");
  }

  const currentCount = await getSupportCount();
  const nextCount = currentCount + 1;

  try {
    await setSupportCountInSupabase(nextCount);
    return nextCount;
  } catch {
    // Fall through to existing fallback stores.
  }

  try {
    return await kv.incr(SUPPORT_COUNTER_KEY);
  } catch {
    memorySupportCounter = nextCount;
    return memorySupportCounter;
  }
}

export async function GET() {
  const count = await getSupportCount();
  return NextResponse.json({ count });
}

export async function POST() {
  try {
    const count = await incrementSupportCount();
    return NextResponse.json({ count });
  } catch {
    return NextResponse.json({ error: "Unable to update support count. Please retry." }, { status: 503 });
  }
}
