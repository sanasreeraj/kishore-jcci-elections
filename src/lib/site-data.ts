import { hasSupabaseConfig, supabaseServer } from "./supabase-server";

export type MemberRecord = {
  slNo: string;
  name: string;
  business: string;
  phone: string;
  address: string;
  searchKey: string;
};

export type Supporter = {
  name: string;
  business: string;
  location: string;
  phone: string;
  image: string;
};

export type DirectorProfile = {
  id: string;
  name: string;
  businessName: string;
  businessAddress: string;
  residenceAddress: string;
  photoUrl: string;
  contactNumber: string;
  whatsappNumber: string;
  email: string;
  experienceExpertise: string;
  createdAt: string;
};

export type CandidateProfile = {
  name: string;
  position: string;
  ballotNumber: string;
  organization: string;
  background: string;
  electionDate: string;
  electionTime: string;
  venue: string;
  whatsapp: string;
  email: string;
  traits: string[];
  expertise: string[];
};

export type ElectionInfo = {
  title: string;
  date: string;
  time: string;
  venue: string;
  rules: Array<{ text: string; highlights?: string[] }>;
  timeline: Array<{
    label: string;
    date: string;
    detail: string;
    status: "done" | "upcoming";
  }>;
};

export const candidateProfile: CandidateProfile = {
  name: "Ch Kishore Kumar",
  position: "Director",
  ballotNumber: "8",
  organization: "Jeypore Chamber of Commerce & Industry (JCCI)",
  background:
    "Indian Air Force veteran, Business portfolio overseer, and Joint Secretary of JCMA with a practical understanding of trade, compliance, and member leadership.",
  electionDate: "12 April 2026",
  electionTime: "9:00 AM to 3:00 PM",
  venue: "Vedika, Nehru Nagar, Jeypore (K) - 764001, Odisha",
  whatsapp: "+91 8800547855",
  email: "kishore070707@gmail.com",
  traits: [
    "Social activities",
    "Public relations",
    "Educational tours",
    "Career counselling",
    "Community building",
  ],
  expertise: [
    "Tax laws",
    "Labour laws",
    "Banking norms",
    "Subsidy schemes",
    "Regulatory compliances",
  ],
};

export const supporters: Supporter[] = [
  {
    name: "Ch Chandra Rao",
    business: "Shiv Shankar Traders",
    location: "Daily Market, Jeypore",
    phone: "+91 9437693955",
    image: "/assets/chandrarao.png",
  },
  {
    name: "Ch Kiran Kumar",
    business: "Sri Maa Bankeswari Industries",
    location: "Jamunda",
    phone: "+91 9938002342",
    image: "/assets/kiran.png",
  },
  {
    name: "Sana Srinu",
    business: "Sri Sai Surya Chandra Industries",
    location: "Boipariguda",
    phone: "+91 9438544088",
    image: "/assets/srinu.png",
  },
  {
    name: "Kota Ramu",
    business: "Sai Sampath Medicals",
    location: "Main Road, Jeypore",
    phone: "+91 9040693465",
    image: "/assets/ramu.png",
  },
];

export const electionInfo: ElectionInfo = {
  title: "Election 2026-27",
  date: "12 April 2026 (Sunday)",
  time: "9:00 AM to 3:00 PM",
  venue: "VEDIKA, Nehru Nagar, Jeypore (K), Odisha",
  rules: [
    {
      text: "Members must choose exactly 21 Directors, not more or less, to keep the ballot valid.",
      highlights: ["exactly 21 Directors"],
    },
    {
      text: "Proxy Voting is not allowed.",
      highlights: ["Proxy Voting"],
    },
    {
      text: "Membership enrollment deadline was 15.03.2026 up to 5:00 PM.",
      highlights: ["15.03.2026", "5:00 PM"],
    },
    {
      text: "Only traders who paid membership fee for 2025-2026 (Rs. 500/- per establishment) can vote.",
      highlights: ["2025-2026", "Rs. 500/-"],
    },
    {
      text: "Final voter list publication: 06.04.2026.",
      highlights: ["06.04.2026"],
    },
    {
      text: "Candidate eligibility: any one Proprietor, Director, or Partner of a firm/company.",
      highlights: ["Proprietor", "Director", "Partner"],
    },
    {
      text: "Voting right: any one Proprietor, Director, or Partner can cast the vote.",
      highlights: ["Voting right", "Proprietor", "Director", "Partner"],
    },
  ],
  timeline: [
    {
      label: "Nomination filing",
      date: "30 Mar - 01 Apr",
      detail: "30.03.2026 to 01.04.2026",
      status: "done",
    },
    {
      label: "Scrutiny & finalisation",
      date: "02 Apr",
      detail: "02.04.2026",
      status: "done",
    },
    {
      label: "Withdrawal deadline",
      date: "03 Apr",
      detail: "03.04.2026 up to 5:00 PM",
      status: "done",
    },
    {
      label: "Final candidate list",
      date: "04 Apr",
      detail: "04.04.2026",
      status: "done",
    },
    {
      label: "Voting",
      date: "12 Apr",
      detail: "12.04.2026, 9:00 AM to 3:00 PM",
      status: "upcoming",
    },
    {
      label: "Counting",
      date: "12 Apr",
      detail: "12.04.2026 after 3:30 PM",
      status: "upcoming",
    },
  ],
};

function normalizeText(value: string) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizePhone(value: string) {
  return value.replace(/\D/g, "");
}

function toMemberRecord(row: {
  slNo?: string | null;
  sl_no?: string | null;
  address?: string | null;
  business?: string | null;
  establishment?: string | null;
  phone?: string | null;
  cell_no?: string | null;
}): MemberRecord {
  const slNo = (row.slNo ?? row.sl_no ?? "").trim();
  const address = (row.address ?? "").trim();
  const business = (row.business ?? row.establishment ?? "").trim();
  const phone = (row.phone ?? row.cell_no ?? "").trim();
  const searchKey = normalizeText([slNo, address, business, phone].join(" "));

  return {
    slNo,
    name: business,
    business,
    phone,
    address,
    searchKey,
  };
}

export async function loadMemberRecordsFromSupabase(): Promise<MemberRecord[]> {
  if (!hasSupabaseConfig || !supabaseServer) {
    return [];
  }

  const { data, error } = await supabaseServer
    .from("member_records")
    .select("sl_no,address,establishment,cell_no")
    .order("sl_no", { ascending: true });

  if (error || !data) {
    return [];
  }

  return data.map((row) =>
    toMemberRecord({
      sl_no: row.sl_no,
      address: row.address,
      establishment: row.establishment,
      cell_no: row.cell_no,
    }),
  );
}

export async function loadMemberRecords(): Promise<MemberRecord[]> {
  return await loadMemberRecordsFromSupabase();
}

export async function upsertMemberRecordInSupabase(input: {
  slNo: string;
  address: string;
  establishment: string;
  cellNo: string;
}) {
  if (!hasSupabaseConfig || !supabaseServer) {
    return {
      slNo: input.slNo,
      address: input.address,
      establishment: input.establishment,
      cellNo: input.cellNo,
    };
  }

  const searchKey = normalizeText([input.slNo, input.address, input.establishment, input.cellNo].join(" "));

  const { data, error } = await supabaseServer
    .from("member_records")
    .upsert(
      {
        sl_no: input.slNo,
        address: input.address,
        establishment: input.establishment,
        cell_no: input.cellNo,
        search_key: searchKey,
      },
      { onConflict: "sl_no" },
    )
    .select("sl_no,address,establishment,cell_no")
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "Unable to save member record");
  }

  return toMemberRecord({
    sl_no: data.sl_no,
    address: data.address,
    establishment: data.establishment,
    cell_no: data.cell_no,
  });
}

export async function deleteMemberRecordInSupabase(slNo: string) {
  if (!hasSupabaseConfig || !supabaseServer || !slNo) {
    return;
  }

  const { error } = await supabaseServer.from("member_records").delete().eq("sl_no", slNo);

  if (error) {
    throw new Error(error.message);
  }
}

const directorFallbackStore: DirectorProfile[] = [];

function toDirectorProfile(row: {
  id?: string | null;
  full_name?: string | null;
  business_name?: string | null;
  business_address?: string | null;
  residence_address?: string | null;
  photo_url?: string | null;
  contact_number?: string | null;
  whatsapp_number?: string | null;
  email?: string | null;
  experience_expertise?: string | null;
  created_at?: string | null;
}): DirectorProfile {
  return {
    id: (row.id ?? "").trim(),
    name: (row.full_name ?? "").trim(),
    businessName: (row.business_name ?? "").trim(),
    businessAddress: (row.business_address ?? "").trim(),
    residenceAddress: (row.residence_address ?? "").trim(),
    photoUrl: (row.photo_url ?? "").trim(),
    contactNumber: (row.contact_number ?? "").trim(),
    whatsappNumber: (row.whatsapp_number ?? "").trim(),
    email: (row.email ?? "").trim(),
    experienceExpertise: (row.experience_expertise ?? "").trim(),
    createdAt: (row.created_at ?? new Date().toISOString()).trim(),
  };
}

export async function loadDirectorProfilesFromSupabase(): Promise<DirectorProfile[]> {
  if (!hasSupabaseConfig || !supabaseServer) {
    return [...directorFallbackStore];
  }

  const { data, error } = await supabaseServer
    .from("jcci_directors")
    .select(
      "id,full_name,business_name,business_address,residence_address,photo_url,contact_number,whatsapp_number,email,experience_expertise,created_at",
    )
    .order("created_at", { ascending: false });

  if (error || !data) {
    return [];
  }

  return data.map((row) =>
    toDirectorProfile({
      id: row.id,
      full_name: row.full_name,
      business_name: row.business_name,
      business_address: row.business_address,
      residence_address: row.residence_address,
      photo_url: row.photo_url,
      contact_number: row.contact_number,
      whatsapp_number: row.whatsapp_number,
      email: row.email,
      experience_expertise: row.experience_expertise,
      created_at: row.created_at,
    }),
  );
}

export async function loadDirectorProfiles(): Promise<DirectorProfile[]> {
  return await loadDirectorProfilesFromSupabase();
}

export async function createDirectorProfileInSupabase(input: {
  name: string;
  businessName: string;
  businessAddress: string;
  residenceAddress: string;
  photoUrl: string;
  contactNumber: string;
  whatsappNumber: string;
  email: string;
  experienceExpertise: string;
}): Promise<DirectorProfile> {
  if (!hasSupabaseConfig || !supabaseServer) {
    const id = globalThis.crypto?.randomUUID?.() ?? `local-${Date.now().toString(36)}`;
    const record: DirectorProfile = {
      id,
      name: input.name,
      businessName: input.businessName,
      businessAddress: input.businessAddress,
      residenceAddress: input.residenceAddress,
      photoUrl: input.photoUrl,
      contactNumber: input.contactNumber,
      whatsappNumber: input.whatsappNumber,
      email: input.email,
      experienceExpertise: input.experienceExpertise,
      createdAt: new Date().toISOString(),
    };

    directorFallbackStore.unshift(record);
    return record;
  }

  const { data, error } = await supabaseServer
    .from("jcci_directors")
    .insert({
      full_name: input.name,
      business_name: input.businessName,
      business_address: input.businessAddress,
      residence_address: input.residenceAddress,
      photo_url: input.photoUrl,
      contact_number: input.contactNumber,
      whatsapp_number: input.whatsappNumber,
      email: input.email,
      experience_expertise: input.experienceExpertise,
    })
    .select(
      "id,full_name,business_name,business_address,residence_address,photo_url,contact_number,whatsapp_number,email,experience_expertise,created_at",
    )
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "Unable to create director profile");
  }

  return toDirectorProfile({
    id: data.id,
    full_name: data.full_name,
    business_name: data.business_name,
    business_address: data.business_address,
    residence_address: data.residence_address,
    photo_url: data.photo_url,
    contact_number: data.contact_number,
    whatsapp_number: data.whatsapp_number,
    email: data.email,
    experience_expertise: data.experience_expertise,
    created_at: data.created_at,
  });
}