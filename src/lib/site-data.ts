import fs from "node:fs";
import path from "node:path";

import Papa from "papaparse";

export type MemberRecord = {
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

function getDataFilePath() {
  const candidates = [
    path.resolve(
      process.cwd(),
      "..",
      "Data",
      "JCCI - Members List FY 2026-2027  - Master Sheet.csv",
    ),
    path.resolve(
      process.cwd(),
      "public",
      "data",
      "members.csv",
    ),
  ];

  return candidates.find((candidatePath) => fs.existsSync(candidatePath));
}

export function loadMemberRecords(): MemberRecord[] {
  const csvPath = getDataFilePath();

  if (!csvPath) {
    return [];
  }

  const csvText = fs.readFileSync(csvPath, "utf8");
  const parsed = Papa.parse<Record<string, string>>(csvText, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (header) => header.trim(),
  });

  return parsed.data
    .map((row) => {
      const address = (row.Address ?? "").trim();
      const business = (row.Name ?? "").trim();
      const phone = (row["Phone Number"] ?? "").trim();
      const searchKey = normalizeText([address, business, phone].join(" "));

      return {
        name: business,
        business,
        phone,
        address,
        searchKey,
      } satisfies MemberRecord;
    })
    .filter((record) => record.name || record.business || record.phone || record.address);
}