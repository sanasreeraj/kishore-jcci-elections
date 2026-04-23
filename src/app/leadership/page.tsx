import { LeadershipClient } from "@/components/leadership-client";
import { loadDirectorProfiles } from "@/lib/site-data";

export default async function LeadershipPage() {
  const directorProfiles = await loadDirectorProfiles();

  return <LeadershipClient initialDirectors={directorProfiles} />;
}
