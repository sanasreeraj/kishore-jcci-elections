import { CampaignSite } from "@/components/campaign-site";
import { candidateProfile, electionInfo, loadMemberRecords, supporters } from "@/lib/site-data";

export default async function Home() {
  const memberRecords = await loadMemberRecords();

  return (
    <CampaignSite
      candidate={candidateProfile}
      election={electionInfo}
      supporters={supporters}
      memberRecords={memberRecords}
    />
  );
}