import { CampaignSite } from "@/components/campaign-site";
import { candidateProfile, electionInfo, loadMemberRecords, supporters } from "@/lib/site-data";

export default function Home() {
  const memberRecords = loadMemberRecords();

  return (
    <CampaignSite
      candidate={candidateProfile}
      election={electionInfo}
      supporters={supporters}
      memberRecords={memberRecords}
    />
  );
}