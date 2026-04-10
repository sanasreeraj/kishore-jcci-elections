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

const SLOT_COUNTS_KEY = "kishore:campaign:slot-counts";

function buildSlotKeys() {
  const keys: string[] = [];
  const start = 9 * 60;
  const end = 15 * 60;

  for (let current = start; current < end; current += 15) {
    const next = current + 15;
    const startHour = Math.floor(current / 60);
    const startMinute = current % 60;
    const endHour = Math.floor(next / 60);
    const endMinute = next % 60;
    keys.push(
      `${startHour.toString().padStart(2, "0")}:${startMinute
        .toString()
        .padStart(2, "0")}-${endHour.toString().padStart(2, "0")}:${endMinute
        .toString()
        .padStart(2, "0")}`,
    );
  }

  return keys;
}

const SLOT_KEYS = buildSlotKeys();
const SLOT_TABLE_NAME = "slot_counts";

const memoryCounts: Record<string, number> = Object.fromEntries(
  SLOT_KEYS.map((slot) => [slot, 0]),
);

async function getCountsFromSupabase() {
  if (!hasSupabaseConfig || !supabaseServer) {
    return null;
  }

  const { data, error } = await supabaseServer
    .from(SLOT_TABLE_NAME)
    .select("slot_key,count");

  if (error || !data) {
    return null;
  }

  const counts = Object.fromEntries(SLOT_KEYS.map((slot) => [slot, 0])) as Record<string, number>;

  for (const row of data) {
    if (row.slot_key in counts) {
      const parsed = typeof row.count === "number" ? row.count : Number(row.count);
      counts[row.slot_key] = Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
    }
  }

  return counts;
}

async function saveCountsToSupabase(counts: Record<string, number>) {
  if (!hasSupabaseConfig || !supabaseServer) {
    return;
  }

  const payload = SLOT_KEYS.map((slot) => ({ slot_key: slot, count: counts[slot] ?? 0 }));
  const { error } = await supabaseServer.from(SLOT_TABLE_NAME).upsert(payload, { onConflict: "slot_key" });

  if (error) {
    throw new Error(error.message);
  }
}

async function applySlotDeltaInSupabase(previousSlot: string | null, nextSlot: string | null) {
  if (!hasSupabaseConfig || !supabaseServer) {
    return null;
  }

  const { data, error } = await supabaseServer.rpc("apply_slot_delta", {
    previous_slot: previousSlot,
    next_slot: nextSlot,
  });

  if (error || !data) {
    return null;
  }

  return normalizeCounts(data);
}

async function applySlotDeltaWithCompareAndSwap(previousSlot: string | null, nextSlot: string | null) {
  if (!hasSupabaseConfig || !supabaseServer) {
    return null;
  }

  const touchedSlots = Array.from(new Set([previousSlot, nextSlot].filter(Boolean))) as string[];
  if (!touchedSlots.length) {
    return getCountsFromSupabase();
  }

  await supabaseServer
    .from(SLOT_TABLE_NAME)
    .upsert(touchedSlots.map((slot) => ({ slot_key: slot, count: 0 })), { onConflict: "slot_key" });

  for (let attempt = 0; attempt < 5; attempt += 1) {
    if (attempt > 0) {
      await new Promise((resolve) => setTimeout(resolve, Math.min(100 * Math.pow(1.5, attempt), 500)));
    }
    if (attempt > 0) {
      await new Promise((resolve) => setTimeout(resolve, Math.min(100 * Math.pow(1.5, attempt), 500)));
    }
    const { data: rows, error: readError } = await supabaseServer
      .from(SLOT_TABLE_NAME)
      .select("slot_key,count")
      .in("slot_key", touchedSlots);

    if (readError || !rows) {
      return null;
    }

    const currentBySlot = new Map<string, number>();
    for (const row of rows) {
      const parsed = typeof row.count === "number" ? row.count : Number(row.count);
      currentBySlot.set(row.slot_key, Number.isFinite(parsed) && parsed >= 0 ? parsed : 0);
    }

    const updates: Array<{ slot: string; previousCount: number; nextCount: number }> = [];

    if (previousSlot) {
      const current = currentBySlot.get(previousSlot) ?? 0;
      if (current > 0) {
        updates.push({ slot: previousSlot, previousCount: current, nextCount: current - 1 });
      }
    }

    if (nextSlot) {
      const current = currentBySlot.get(nextSlot) ?? 0;
      updates.push({ slot: nextSlot, previousCount: current, nextCount: current + 1 });
    }

    let allUpdated = true;

    for (const update of updates) {
      const { data: updatedRow, error: updateError } = await supabaseServer
        .from(SLOT_TABLE_NAME)
        .update({ count: update.nextCount })
        .eq("slot_key", update.slot)
        .eq("count", update.previousCount)
        .select("slot_key")
        .maybeSingle();

      if (updateError || !updatedRow) {
        allUpdated = false;
        break;
      }
    }

    if (allUpdated) {
      return getCountsFromSupabase();
    }
  }

  return null;
}

function normalizeCounts(input: unknown) {
  const source = input && typeof input === "object" ? (input as Record<string, unknown>) : {};
  return Object.fromEntries(
    SLOT_KEYS.map((slot) => {
      const value = source[slot];
      const parsed =
        typeof value === "number"
          ? value
          : typeof value === "string"
            ? Number.parseInt(value, 10)
            : 0;
      return [slot, Number.isFinite(parsed) && parsed > 0 ? parsed : 0];
    }),
  ) as Record<string, number>;
}

async function getCounts() {
  const supabaseCounts = await getCountsFromSupabase();

  if (supabaseCounts) {
    return supabaseCounts;
  }

  try {
    const value = await kv.get(SLOT_COUNTS_KEY);
    return normalizeCounts(value);
  } catch {
    return { ...memoryCounts };
  }
}

async function saveCounts(counts: Record<string, number>) {
  try {
    await saveCountsToSupabase(counts);
    return;
  } catch {
    // Fall back to existing storage.
  }

  try {
    await kv.set(SLOT_COUNTS_KEY, counts);
  } catch {
    Object.assign(memoryCounts, counts);
  }
}

function isValidSlot(slot: string | null | undefined): slot is string {
  return Boolean(slot && SLOT_KEYS.includes(slot));
}

type SlotPayload = {
  previousSlot?: string | null;
  nextSlot?: string | null;
};

export async function GET() {
  const counts = await getCounts();
  return NextResponse.json({ counts });
}

export async function POST(request: Request) {
  let payload: SlotPayload;

  try {
    payload = (await request.json()) as SlotPayload;
  } catch {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const previousSlot = payload.previousSlot ?? null;
  const nextSlot = payload.nextSlot ?? null;

  if (previousSlot && !isValidSlot(previousSlot)) {
    return NextResponse.json({ error: "Invalid previous slot" }, { status: 400 });
  }

  if (nextSlot && !isValidSlot(nextSlot)) {
    return NextResponse.json({ error: "Invalid next slot" }, { status: 400 });
  }

  if (hasSupabaseConfig && supabaseServer) {
    const updatedCounts = await applySlotDeltaInSupabase(previousSlot, nextSlot);
    if (updatedCounts) {
      return NextResponse.json({ counts: updatedCounts });
    }

    const fallbackCounts = await applySlotDeltaWithCompareAndSwap(previousSlot, nextSlot);
    if (fallbackCounts) {
      return NextResponse.json({ counts: fallbackCounts });
    }

    return NextResponse.json(
      { error: "Unable to update slot count right now. Please retry." },
      { status: 503 },
    );
  }

  const counts = await getCounts();

  if (previousSlot && counts[previousSlot] > 0) {
    counts[previousSlot] -= 1;
  }

  if (nextSlot) {
    counts[nextSlot] += 1;
  }

  await saveCounts(counts);

  return NextResponse.json({ counts });
}
