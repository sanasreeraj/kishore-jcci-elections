import { NextResponse } from "next/server";

import { createDirectorProfileInSupabase, loadDirectorProfilesFromSupabase } from "@/lib/site-data";

export const dynamic = "force-dynamic";

type DirectorPayload = {
  name?: string;
  businessName?: string;
  businessAddress?: string;
  residenceAddress?: string;
  photoUrl?: string;
  contactNumber?: string;
  whatsappNumber?: string;
  email?: string;
  experienceExpertise?: string;
};

function normalizePhone(input: string) {
  const digits = input.replace(/\D/g, "");

  if (digits.length === 10) {
    return `+91${digits}`;
  }

  return "";
}

function isValidIndianPhone(value: string) {
  return /^\+91[6-9]\d{9}$/.test(value);
}

function normalizePayload(payload: DirectorPayload) {
  return {
    name: titleCaseWords(sanitizeTextOnly(payload.name ?? "")),
    businessName: titleCaseWords(sanitizeTextOnly(payload.businessName ?? "")),
    businessAddress: sanitizeAlphaNumeric(payload.businessAddress ?? ""),
    residenceAddress: sanitizeAlphaNumeric(payload.residenceAddress ?? ""),
    photoUrl: (payload.photoUrl ?? "").trim(),
    contactNumber: normalizePhone(payload.contactNumber ?? ""),
    whatsappNumber: normalizePhone(payload.whatsappNumber ?? ""),
    email: (payload.email ?? "").trim().toLowerCase(),
    experienceExpertise: sanitizeAlphaNumeric(payload.experienceExpertise ?? ""),
  };
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function isAcceptedPhoto(value: string) {
  return value.startsWith("data:image/") || /^https?:\/\//.test(value);
}

function sanitizeTextOnly(value: string) {
  return value.replace(/[^A-Za-z\s.'-]/g, "").trim();
}

function sanitizeAlphaNumeric(value: string) {
  return value.replace(/[^A-Za-z0-9\s.,'()\-/#&:]/g, "").trim();
}

function titleCaseWords(value: string) {
  return value
    .toLowerCase()
    .replace(/\b[a-z]/g, (character) => character.toUpperCase())
    .replace(/\s+/g, " ")
    .trim();
}

function canonicalizeDirectorName(value: string) {
  return value
    .toLowerCase()
    .replace(/\([^)]*\)/g, " ")
    .replace(/[^a-z\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const eligibleDirectorNames = [
  "Sanjay Kumar Jain",
  "Nemani Chaitanya",
  "K Dillip Reddy",
  "Dinesh Sunkari",
  "K Rama Krishna",
  "Satish Kumar Patro (Nilu)",
  "A Srinivasa Rao (Arugula)",
  "V Prabhakar",
  "D Madhav",
  "B Satish Kumar",
  "Gembali Vasanta Rao",
  "Ch Kishore Kumar",
  "Kella Iswar Rao",
  "Loknath Patro",
  "Ankur Soni",
  "Manoj Kumar Shah",
  "Bibhu Dutta Padhi (Luna)",
  "Chandresh Rathod",
  "Barun Kumar Jain",
  "Surya Narayana Patnaik",
];

const eligibleDirectorNameSet = new Set(
  eligibleDirectorNames.flatMap((name) => {
    const exact = canonicalizeDirectorName(name);
    const withoutBracket = canonicalizeDirectorName(name.replace(/\([^)]*\)/g, " "));
    return [exact, withoutBracket].filter(Boolean);
  }),
);

export async function GET() {
  const directors = await loadDirectorProfilesFromSupabase();
  return NextResponse.json({ directors });
}

export async function POST(request: Request) {
  try {
    const payload = normalizePayload((await request.json()) as DirectorPayload);

    if (
      !payload.name ||
      !payload.businessName ||
      !payload.businessAddress ||
      !payload.residenceAddress ||
      !payload.photoUrl ||
      !payload.contactNumber ||
      !payload.whatsappNumber ||
      !payload.email ||
      !payload.experienceExpertise
    ) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    if (!eligibleDirectorNameSet.has(canonicalizeDirectorName(payload.name))) {
      return NextResponse.json(
        { error: "Only the announced 21 JCCI Directors can submit this form" },
        { status: 403 },
      );
    }

    if (!isValidIndianPhone(payload.contactNumber) || !isValidIndianPhone(payload.whatsappNumber)) {
      return NextResponse.json(
        { error: "Contact and WhatsApp numbers must be exactly 10 digits and valid Indian numbers" },
        { status: 400 },
      );
    }

    if (!isValidEmail(payload.email)) {
      return NextResponse.json({ error: "Please provide a valid email address" }, { status: 400 });
    }

    if (!isAcceptedPhoto(payload.photoUrl)) {
      return NextResponse.json({ error: "Photo must be uploaded as an image" }, { status: 400 });
    }

    const director = await createDirectorProfileInSupabase(payload);
    return NextResponse.json({ director });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to create director profile";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
