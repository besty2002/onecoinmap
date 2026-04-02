"use client";

import { useState, useCallback, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Search, Navigation, Heart, Share2, Bookmark, PlusSquare, Home, Award, User, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { MapComponent } from "@/components/map/MapComponent";
import useEmblaCarousel from "embla-carousel-react";
import { UploadPlaceModal } from "@/components/places/UploadPlaceModal";
import { createClient } from "@/lib/supabase/client";

export default function HomePageClient({ initialPlaces }: { initialPlaces: any[] }) {
  const [view, setView] = useState<"map" | "list">("list");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [likedPlaces, setLikedPlaces] = useState<Record<string, boolean>>({});
  const [bookmarkedPlaces, setBookmarkedPlaces] = useState<Record<string, boolean>>({});
  const [user, setUser] = useState<any>(null);

  const supabase = createClient();

  // 🚀 유저 세션 및 초기 북마크 데이터 로드
  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);

      if (session?.user) {
        const { data: bookmarks } = await supabase
          .from("bookmarks")
          .select("place_id")
          .eq("user_id", session.user.id);
        
        if (bookmarks) {
          const bookmarkMap: Record<string, boolean> = {};
          bookmarks.forEach(b => bookmarkMap[b.place_id] = true);
          setBookmarkedPlaces(bookmarkMap);
        }
      }
    };
    getSession();
  }, []);

  // 🚀 카테고리 필터링
  const filteredPlaces = selectedCategory 
    ? initialPlaces.filter(p => p.category === selectedCategory)
    : initialPlaces;

  // 지도 마커 매핑
  const mapMarkers = filteredPlaces.map((p) => ({
    id: p.id,
    name: p.name,
    lat: p.latitude,
    lng: p.longitude,
    price: p.price_label,
    category: p.category,
    address: p.address,
  }));

  const categories = ["ラーメン", "カフェ・ベーカリー", "寿司・和食", "ファ스트フード", "居酒屋・バー"];

  const toggleLike = (id: string) => {
    setLikedPlaces(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // 🚀 북마크 토글 로직
  const toggleBookmark = async (placeId: string) => {
    if (!user) {
      alert("북마크를 하려면 로그인이 필요합니다!");
      return;
    }

    const isBookmarked = bookmarkedPlaces[placeId];
    
    // 1. UI 즉시 반영 (Optimistic Update)
    setBookmarkedPlaces(prev => ({ ...prev, [placeId]: !isBookmarked }));

    if (isBookmarked) {
      await supabase.from("bookmarks").delete().eq("user_id", user.id).eq("place_id", placeId);
    } else {
      await supabase.from("bookmarks").insert({ user_id: user.id, place_id: placeId });
    }
  };

  return (
    <div className="flex flex-col h-full w-full relative bg-[#FBFBFA] font-sans pb-20">
      <div className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b px-4 py-3 flex items-center justify-between shadow-sm">
        <h1 className="text-xl font-black bg-gradient-to-r from-orange-500 to-red-600 bg-clip-text text-transparent italic">OneCoinMap</h1>
        <div className="flex gap-4 text-gray-700">
          <Heart className="h-6 w-6 cursor-pointer hover:text-red-500 transition-colors" />
          <Search className="h-6 w-6 cursor-pointer" />
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden w-full relative">
        <div className={`flex-1 absolute md:static inset-0 transition-all duration-300 ${view === "map" ? "z-30 opacity-100 visible" : "-z-10 opacity-0 invisible md:visible md:opacity-100 md:z-0"}`}>
          <MapComponent 
            places={mapMarkers} 
            onMarkerClick={(id) => {
              console.log("Marker clicked:", id);
            }} 
          />
        </div>

        <div className={`w-full md:w-[420px] bg-white z-10 overflow-y-auto transition-all duration-300 ${view === "list" ? "translate-y-0" : "translate-y-full md:translate-y-0"}`}>
          <div className="flex flex-nowrap overflow-x-auto py-4 px-4 gap-3 no-scrollbar sticky top-0 bg-white z-20 border-b">
            {categories.map(cat => (
              <button 
                key={cat}
                onClick={() => setSelectedCategory(selectedCategory === cat ? null : cat)}
                className="flex flex-col items-center gap-1.5 shrink-0 transition-transform active:scale-90"
              >
                <div className={`w-16 h-16 rounded-full p-[2px] ${selectedCategory === cat ? "bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600" : "bg-gray-200"}`}>
                  <div className="w-full h-full rounded-full bg-white flex items-center justify-center p-0.5">
                    <div className="w-full h-full rounded-full bg-gray-50 flex items-center justify-center text-xl font-bold">
                      {cat.charAt(0)}
                    </div>
                  </div>
                </div>
                <span className={`text-[10px] font-bold ${selectedCategory === cat ? "text-gray-900" : "text-gray-400"}`}>{cat}</span>
              </button>
            ))}
          </div>

          <div className="divide-y divide-gray-100">
            {filteredPlaces.map((place) => (
              <PlaceFeedCard 
                key={place.id} 
                place={place} 
                isLiked={!!likedPlaces[place.id]} 
                isBookmarked={!!bookmarkedPlaces[place.id]}
                onLike={() => toggleLike(place.id)}
                onBookmark={() => toggleBookmark(place.id)}
              />
            ))}
            
            {filteredPlaces.length === 0 && (
              <div className="py-24 text-center text-gray-400">
                <p>該当하는 식당을 찾을 수 없습니다.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-gray-100 z-50 flex items-center justify-around px-4">
        <button onClick={() => setView("list")}>
          <Home className={`h-7 w-7 ${view === "list" ? "text-primary flex items-center px-0.5" : "text-gray-400"}`} />
        </button>
        <button onClick={() => setView(view === "map" ? "list" : "map")}>
          <MapPin className={`h-7 w-7 ${view === "map" ? "text-primary font-bold" : "text-gray-400"}`} />
        </button>
        <UploadPlaceModal />
        <Link href="/ranking">
          <Award className="h-7 w-7 text-gray-400 cursor-pointer" />
        </Link>
        <Link href="/profile">
           <User className={`h-7 w-7 ${user ? "text-gray-900" : "text-gray-400"}`} />
        </Link>
      </div>
    </div>
  );
}

function PlaceFeedCard({ place, isLiked, isBookmarked, onLike, onBookmark }: { 
  place: any, isLiked: boolean, isBookmarked: boolean, onLike: () => void, onBookmark: () => void 
}) {
  const images = place.place_images && place.place_images.length > 0
    ? place.place_images.map((img: any) => img.image_url)
    : ["https://images.unsplash.com/photo-1542284992-cb31a89c4568?q=80&w=800&auto=format&fit=crop"];

  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });

  const scrollPrev = useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi]);

  return (
    <div className="bg-white pb-3">
      <div className="flex items-center px-4 py-3 gap-3">
        <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-yellow-400 to-purple-600 p-[2px]">
          <div className="w-full h-full rounded-full bg-white p-0.5">
            <div className="w-full h-full rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold">OC</div>
          </div>
        </div>
        <div className="flex flex-col flex-1 min-w-0">
          <Link href={`/place/${place.id}`} className="font-bold text-sm truncate hover:underline">{place.name}</Link>
          <div className="flex items-center text-[10px] text-gray-500 gap-1 font-medium italic">
            <MapPin className="h-2.5 w-2.5 text-orange-400" /> {place.address?.split(' ').slice(0, 3).join(' ')}
          </div>
        </div>
        <Badge variant="outline" className="text-[10px] bg-orange-100 border-none font-bold text-orange-600 px-2 py-0.5">{place.price_label}</Badge>
      </div>

      <div className="relative group touch-pan-y">
        <div className="overflow-hidden bg-gray-100 aspect-square" ref={emblaRef}>
          <div className="flex">
            {images.map((src: string, i: number) => (
              <div className="flex-[0_0_100%] min-w-0 relative h-[400px]" key={i}>
                <img src={src} alt={place.name} className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        </div>
        {images.length > 1 && (
          <>
            <button onClick={scrollPrev} className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/70 rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"><ChevronLeft className="h-4 w-4" /></button>
            <button onClick={scrollNext} className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/70 rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"><ChevronRight className="h-4 w-4" /></button>
          </>
        )}
      </div>

      <div className="px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Heart onClick={onLike} className={`h-7 w-7 cursor-pointer transition-all active:scale-125 ${isLiked ? "fill-red-500 text-red-500" : "text-gray-800"}`} />
          <Share2 className="h-6 w-6 text-gray-800 cursor-pointer" />
        </div>
        <Bookmark 
          onClick={onBookmark}
          className={`h-7 w-7 cursor-pointer transition-all ${isBookmarked ? "fill-gray-900 text-gray-900" : "text-gray-800"}`} 
        />
      </div>

      <div className="px-4 space-y-1.5">
        <div className="text-sm font-bold truncate">
          <span className="text-orange-600 mr-2">⭐ {place.rating || "4.5"}</span>
          <span className="bg-gray-100 px-2 py-0.5 rounded-full text-[10px] text-gray-600">{place.category}</span>
        </div>
        <p className="text-xs text-gray-600 leading-relaxed line-clamp-2"><span className="font-bold text-gray-900 mr-2">OneCoinMap</span>이번 주 추천 맛집! 도쿄 중심에서 만나는 500엔의 행복, {place.name}입니다. #가성비맛집 #도쿄여행</p>
      </div>
    </div>
  );
}
