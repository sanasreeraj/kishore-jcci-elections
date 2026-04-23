import { ElectionsClient } from "@/components/elections-client";
import { electionInfo, loadMemberRecords } from "@/lib/site-data";

export default async function ElectionsPage() {
  const memberRecords = await loadMemberRecords();

  return <ElectionsClient election={electionInfo} members={memberRecords} />;
}
