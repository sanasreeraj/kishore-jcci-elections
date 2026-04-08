import type { MemberRecord } from "./site-data";

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

export function searchMembers(records: MemberRecord[], query: string, mode: string) {
  const normalizedQuery = normalizeText(query);
  const phoneQuery = normalizePhone(query);

  if (!normalizedQuery && !phoneQuery) {
    return [] as MemberRecord[];
  }

  const scoredRecords = records
    .map((record) => {
      const nameKey = normalizeText(record.name);
      const businessKey = normalizeText(record.business);
      const addressKey = normalizeText(record.address);
      const phoneKey = normalizePhone(record.phone);

      let score = 0;

      if (mode === "phone" || mode === "all") {
        if (phoneKey === phoneQuery) score += 100;
        else if (phoneKey.includes(phoneQuery)) score += 60;
      }

      if (mode === "name" || mode === "all") {
        if (nameKey === normalizedQuery) score += 90;
        else if (nameKey.includes(normalizedQuery)) score += 55;
      }

      if (mode === "business" || mode === "all") {
        if (businessKey === normalizedQuery) score += 90;
        else if (businessKey.includes(normalizedQuery)) score += 55;
      }

      if (mode === "address" || mode === "all") {
        if (addressKey === normalizedQuery) score += 75;
        else if (addressKey.includes(normalizedQuery)) score += 45;
      }

      if (record.searchKey.includes(normalizedQuery)) {
        score += 20;
      }

      return { record, score };
    })
    .filter(({ score }) => score > 0)
    .sort((left, right) => right.score - left.score);

  return scoredRecords.map(({ record }) => record);
}