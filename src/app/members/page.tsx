import { MembersClient } from "@/components/members-client";
import { loadMemberRecords } from "@/lib/site-data";

export default async function MembersPage() {
  const memberRecords = await loadMemberRecords();

  return <MembersClient records={memberRecords} />;
}
