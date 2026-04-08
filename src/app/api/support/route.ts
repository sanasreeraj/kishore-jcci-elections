import { NextResponse } from "next/server";
import { kv } from "@vercel/kv";

export const dynamic = "force-dynamic";

const SUPPORT_COUNTER_KEY = "kishore:campaign:support-count";
let memorySupportCounter = 121;

async function getSupportCount() {
  try {
    const value = await kv.get<number | string>(SUPPORT_COUNTER_KEY);

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
  try {
    return await kv.incr(SUPPORT_COUNTER_KEY);
  } catch {
    memorySupportCounter += 1;
    return memorySupportCounter;
  }
}

export async function GET() {
  const count = await getSupportCount();
  return NextResponse.json({ count });
}

export async function POST() {
  const count = await incrementSupportCount();
  return NextResponse.json({ count });
}
