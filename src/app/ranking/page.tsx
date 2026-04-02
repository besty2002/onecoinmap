import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Award, TrendingUp, Heart } from "lucide-react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";

export const dynamic = "force-dynamic";

export default async function RankingPage() {
  const supabase = await createClient();
  
  // 🚀 SQL에서 만든 랭킹 전용 RPC 함수 호출
  const { data: rankedPlaces, error } = await supabase.rpc("get_ranked_places");

  return (
    <div className="flex flex-col min-h-screen bg-[#FBFBFA]">
      <div className="p-6 pt-10 space-y-2">
        <div className="flex items-center gap-2 text-primary">
          <TrendingUp className="h-5 w-5" />
          <span className="text-sm font-bold uppercase tracking-wider">Tokyo Real-time</span>
        </div>
        <h1 className="text-3xl font-black text-gray-900 leading-tight">
          OneCoin <br />
          <span className="text-orange-500">Ranking TOP 20</span>
        </h1>
        <p className="text-sm text-gray-500 font-medium">유저들의 좋아요와 평점으로 선정한 오늘의 인기 맛집</p>
      </div>

      <div className="flex-1 px-4 pb-24">
        <div className="space-y-4">
          {rankedPlaces?.map((place: any, index: number) => (
            <Link href={`/place/${place.id}`} key={place.id} className="block group">
              <Card className="p-4 border-none shadow-sm group-hover:shadow-md transition-all rounded-[24px] bg-white flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center shrink-0 relative">
                  {index < 3 ? (
                    <div className={`absolute -top-2 -left-2 w-7 h-7 rounded-full flex items-center justify-center text-white shadow-lg ${
                      index === 0 ? "bg-yellow-400" : index === 1 ? "bg-gray-300" : "bg-orange-400"
                    }`}>
                      <Award className="h-4 w-4" />
                    </div>
                  ) : null}
                  <span className={`text-xl font-black ${index < 3 ? "text-gray-900" : "text-gray-300"}`}>
                    {index + 1}
                  </span>
                </div>
                
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-gray-900 truncate group-hover:text-primary transition-colors">{place.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-[10px] border-none bg-orange-50 text-orange-600 font-bold px-2 py-0.5 whitespace-nowrap">
                       {place.category}
                    </Badge>
                    <span className="text-xs text-gray-400 font-medium">{place.price_label}</span>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="flex items-center gap-1 text-red-500 font-bold text-sm">
                    <Heart className="h-4 w-4 fill-red-500" />
                    <span>{place.likes_count || 0}</span>
                  </div>
                  <p className="text-[10px] text-gray-400 font-bold mt-1">SCORE: {Math.round(place.rank_score)}</p>
                </div>
              </Card>
            </Link>
          ))}

          {(!rankedPlaces || rankedPlaces.length === 0) && (
            <div className="py-20 text-center text-gray-400">
               데이터를 집계 중입니다...
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
