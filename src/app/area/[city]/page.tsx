import { getPlacesByCity } from "@/lib/supabase/queries";
import HomePageClient from "@/components/home/HomePageClient";
import { Metadata } from "next";

interface AreaPageProps {
  params: { city: string };
}

// SEO 메타데이터 자동 생성
export async function generateMetadata({ params }: AreaPageProps): Promise<Metadata> {
  const city = decodeURIComponent(params.city);
  return {
    title: `${city} 500円ランチ・ワンコイングルメ | ワンコインマップ`,
    description: `${city}エリアの安くて美味しい500円ランチ、ワンコイングルメ情報をまとめてチェック！`,
  };
}

export default async function AreaPage({ params }: AreaPageProps) {
  const city = decodeURIComponent(params.city);
  const places = await getPlacesByCity(city);

  return (
    <main className="h-screen flex flex-col">
      <HomePageClient initialPlaces={places} />
    </main>
  );
}
