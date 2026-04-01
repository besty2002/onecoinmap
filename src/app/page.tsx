import { getPlaces } from "@/lib/supabase/queries";
import HomePageClient from "@/components/home/HomePageClient";

export const dynamic = 'force-dynamic'; // 항상 최신 DB 조회

export default async function Home() {
  const places = await getPlaces();
  
  return <HomePageClient initialPlaces={places || []} />;
}
