import { CampaignSite } from "@/components/campaign-site";
import { candidateProfile, electionInfo, loadDirectorProfiles, loadMemberRecords, supporters } from "@/lib/site-data";

export default async function Home() {
  const memberRecords = await loadMemberRecords();
  const directorProfiles = await loadDirectorProfiles();

  return (
    <CampaignSite
      candidate={candidateProfile}
      election={electionInfo}
      supporters={supporters}
      memberRecords={memberRecords}
      directorProfiles={directorProfiles}
    />
  );
}