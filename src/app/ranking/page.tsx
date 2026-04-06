import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Award, TrendingUp, Heart, ChevronRight, Flame, ImageIcon } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export const dynamic = "force-dynamic";

export default async function RankingPage() {
  const supabase = await createClient();
  
  // 🚀 SQL 랭킹 전용 RPC 함수 호출
  const { data: rankedPlaces, error } = await supabase.rpc("get_ranked_places");

  let placesWithImages = rankedPlaces || [];
  
  // 🚀 썸네일 사진 가져오기 (각 맛집의 대표 사진)
  if (rankedPlaces && rankedPlaces.length > 0) {
    const placeIds = rankedPlaces.map((p: any) => p.id);
    const { data: images } = await supabase
      .from("place_images")
      .select("place_id, source_url")
      .in("place_id", placeIds);
      
    // place_id 별로 첫 번째 사진 매핑
    const imgMap = new Map();
    if (images) {
      images.forEach((img) => {
        if (!imgMap.has(img.place_id)) {
           imgMap.set(img.place_id, img.source_url);
        }
      });
    }

    placesWithImages = rankedPlaces.map((p: any) => ({
      ...p,
      image_url: imgMap.get(p.id) || null
    }));
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#FBFBFA]">
      {/* 글로벌 헤더 영역 */}
      <div className="px-6 py-10 space-y-3 bg-gradient-to-b from-orange-50 to-[#FBFBFA]">
        <div className="flex items-center gap-2 text-orange-600">
          <TrendingUp className="h-5 w-5" />
          <span className="text-sm font-black uppercase tracking-wider">Tokyo Real-time</span>
        </div>
        <h1 className="text-4xl font-black text-gray-900 leading-tight tracking-tighter">
          OneCoin <br />
          <span className="bg-gradient-to-r from-orange-500 to-red-600 bg-clip-text text-transparent">
            Ranking TOP 20
          </span>
        </h1>
        <p className="text-sm text-gray-500 font-bold max-w-[280px]">
          ユーザーの「いいね」と評価で選ばれた本日のコスパ最強人気店🔥
        </p>
      </div>

      <div className="flex-1 px-4 pb-24 -mt-2">
        <div className="space-y-4">
          {placesWithImages?.map((place: any, index: number) => {
            const isTop3 = index < 3;
            const is1st = index === 0;
            const is2nd = index === 1;
            const is3rd = index === 2;

            // 👑 메달 그라데이션 시스템
            const medalColor = is1st ? "bg-gradient-to-br from-yellow-300 via-yellow-400 to-yellow-600 text-white shadow-yellow-400/40" 
                             : is2nd ? "bg-gradient-to-br from-slate-200 via-slate-300 to-slate-400 text-white shadow-slate-300/40"
                             : is3rd ? "bg-gradient-to-br from-orange-300 via-orange-400 to-orange-700 text-white shadow-orange-500/30"
                             : "bg-gray-100 text-gray-400 border-2 border-gray-200";
            
            // 프리미엄 테두리 & 스케일 아웃 효과
            const cardBg = isTop3 ? "bg-white" : "bg-white/80";
            const scaleEffect = is1st ? "scale-[1.02] transform my-2" : "";

            return (
              <Link href={`/place/${place.id}`} key={place.id} className={`block group ${scaleEffect}`}>
                <Card className={`relative overflow-hidden transition-all duration-300 border-none rounded-[24px] flex items-stretch gap-3 ${cardBg} ${isTop3 ? 'shadow-md group-hover:shadow-xl p-4' : 'shadow-sm group-hover:shadow-md p-3'}`}>
                  
                  {isTop3 && (
                    <div className={`absolute top-0 right-0 w-24 h-24 blur-3xl opacity-20 -z-10 ${is1st ? 'bg-yellow-400' : is2nd ? 'bg-gray-400' : 'bg-orange-500'}`} />
                  )}

                  {/* 좌측 순위 뱃지 및 이미지 영역 */}
                  <div className="relative shrink-0 flex flex-col items-center gap-2">
                    <div className={`w-14 h-14 ${isTop3 ? 'w-16 h-16' : ''} rounded-2xl flex items-center justify-center shrink-0 relative overflow-hidden bg-gray-100 shadow-inner`}>
                      {place.image_url ? (
                        <Image src={place.image_url} alt={place.name} fill className="object-cover" />
                      ) : (
                        <ImageIcon className="h-6 w-6 text-gray-300" />
                      )}
                      
                      {/* 카드 내 반투명 딤 처리 - 이미지 가독성 */}
                      <div className="absolute inset-0 bg-black/5" />
                    </div>

                    <div className={`absolute -top-3 -left-3 ${isTop3 ? 'w-8 h-8' : 'w-7 h-7'} rounded-full flex items-center justify-center shadow-lg font-black z-10 ${medalColor}`}>
                      {index + 1}
                    </div>
                  </div>
                  
                  {/* 중앙 정보 텍스트 */}
                  <div className="flex-1 min-w-0 flex flex-col justify-center py-1">
                    <h3 className={`font-black text-gray-900 truncate group-hover:text-orange-600 transition-colors ${isTop3 ? 'text-lg' : 'text-base'}`}>
                      {place.name}
                    </h3>
                    <div className="flex items-center gap-2 mt-1.5 line-clamp-1">
                      <Badge variant="outline" className={`text-[10px] border-none font-bold px-2 py-0.5 whitespace-nowrap ${isTop3 ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-600'}`}>
                         {place.category}
                      </Badge>
                      <span className="text-[11px] text-gray-500 font-bold truncate">{place.price_label}</span>
                    </div>
                  </div>

                  {/* 우측 랭킹 스코어 및 팁 */}
                  <div className="flex flex-col items-end justify-center shrink-0 gap-1.5 pl-2">
                    <div className="flex items-center gap-1.5 bg-red-50 text-red-600 px-2 py-1 rounded-full">
                      <Heart className="h-3 w-3 fill-red-500" />
                      <span className="text-xs font-black">{place.likes_count || 0}</span>
                    </div>
                    {isTop3 ? (
                      <div className="flex items-center gap-1 text-[10px] font-black text-orange-500">
                        <Flame className="h-3 w-3" />
                        <span>{Math.round(place.rank_score)}</span>
                      </div>
                    ) : (
                      <span className="text-[10px] font-bold text-gray-400">
                        {Math.round(place.rank_score)}p
                      </span>
                    )}
                    
                    {/* 바로가기 화살표 애니메이션 */}
                    <ChevronRight className="h-5 w-5 text-gray-300 absolute right-4 top-1/2 -translate-y-1/2 opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                  </div>
                </Card>
              </Link>
            );
          })}

          {(!placesWithImages || placesWithImages.length === 0) && (
            <div className="py-24 flex flex-col items-center justify-center space-y-4 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                 <Award className="h-8 w-8 text-gray-300" />
              </div>
              <p className="text-sm font-bold text-gray-400">集計中のため、ランキングデータがありません 🥲</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
