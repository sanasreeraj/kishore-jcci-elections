import { NextResponse } from "next/server";

import { loadMemberRecordsFromSupabase, upsertMemberRecordInSupabase, deleteMemberRecordInSupabase } from "@/lib/site-data";

export const dynamic = "force-dynamic";

export async function GET() {
  const records = await loadMemberRecordsFromSupabase();
  return NextResponse.json({ records });
}

type MemberPayload = {
  slNo?: string;
  address?: string;
  establishment?: string;
  cellNo?: string;
};

function normalizePayload(payload: MemberPayload) {
  return {
    slNo: (payload.slNo ?? "").trim(),
    address: (payload.address ?? "").trim(),
    establishment: (payload.establishment ?? "").trim(),
    cellNo: (payload.cellNo ?? "").trim(),
  };
}

export async function POST(request: Request) {
  try {
    const payload = normalizePayload((await request.json()) as MemberPayload);

    if (!payload.slNo) {
      return NextResponse.json({ error: "slNo is required" }, { status: 400 });
    }

    const record = await upsertMemberRecordInSupabase(payload);
    return NextResponse.json({ record });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to create member";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const payload = normalizePayload((await request.json()) as MemberPayload);

    if (!payload.slNo) {
      return NextResponse.json({ error: "slNo is required" }, { status: 400 });
    }

    const record = await upsertMemberRecordInSupabase(payload);
    return NextResponse.json({ record });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to update member";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const payload = normalizePayload((await request.json()) as MemberPayload);

    if (!payload.slNo) {
      return NextResponse.json({ error: "slNo is required" }, { status: 400 });
    }

    await deleteMemberRecordInSupabase(payload.slNo);
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to delete member";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
