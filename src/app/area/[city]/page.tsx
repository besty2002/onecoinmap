import { getPlacesByCity } from "@/lib/supabase/queries";
import HomePageClient from "@/components/home/HomePageClient";
import { Metadata } from "next";

interface AreaPageProps {
  params: Promise<{ city: string }>;
}

export async function generateMetadata({ params }: AreaPageProps): Promise<Metadata> {
  const { city } = await params; // 구조 분해 할당 사용
  const decodedCity = decodeURIComponent(city);
  return {
    title: `${decodedCity} 500円ランチ・ワンコイングルメ | ワンコインマップ`,
    description: `${decodedCity}エリア의 안 맛있고 싼 500엔 런치를 확인하세요!`,
  };
}

export default async function AreaPage({ params }: AreaPageProps) {
  const { city } = await params; // 구조 분해 할당 사용
  const decodedCity = decodeURIComponent(city);
  const places = await getPlacesByCity(decodedCity);

  return (
    <main className="h-screen flex flex-col">
      <HomePageClient initialPlaces={places} />
    </main>
  );
}
