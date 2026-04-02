import { getPlacesByCity } from "@/lib/supabase/queries";
import HomePageClient from "@/components/home/HomePageClient";
import { Metadata } from "next";

interface AreaPageProps {
  params: Promise<{ city: string }>; // Promise로 타입 변경
}

// SEO 메타데이터 자동 생성
export async function generateMetadata({ params }: AreaPageProps): Promise<Metadata> {
  const resolvedParams = await params; // params를 기다려야 합니다.
  const city = decodeURIComponent(resolvedParams.city);
  return {
    title: `${city} 500円ランチ・ワンコイングルメ | ワンコインマップ`,
    description: `${city}エリアの安くて美味しい500円ランチ、ワンコイングルメ 정보를まとめて체크！`,
  };
}

export default async function AreaPage({ params }: AreaPageProps) {
  const resolvedParams = await params; // params를 기다려야 합니다.
  const city = decodeURIComponent(resolvedParams.city);
  const places = await getPlacesByCity(city);

  return (
    <main className="h-screen flex flex-col">
      <HomePageClient initialPlaces={places} />
    </main>
  );
}
