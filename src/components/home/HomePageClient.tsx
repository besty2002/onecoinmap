"use client";

import { useState, useCallback, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Search, Navigation, Heart, Share2, Bookmark, PlusSquare, Home, Award, User, ChevronLeft, ChevronRight, LocateFixed, Zap } from "lucide-react";
import Link from "next/link";
import { MapComponent } from "@/components/map/MapComponent";
import useEmblaCarousel from "embla-carousel-react";
import { UploadPlaceModal } from "@/components/places/UploadPlaceModal";
import { createClient } from "@/lib/supabase/client";

// 🚀 하버사인 거리 계산기 (단위: km)
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // 지구 반지름
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export default function HomePageClient({ initialPlaces }: { initialPlaces: any[] }) {
  const [view, setView] = useState<"map" | "list">("list");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [likedPlaces, setLikedPlaces] = useState<Record<string, boolean>>({});
  const [bookmarkedPlaces, setBookmarkedPlaces] = useState<Record<string, boolean>>({});
  const [user, setUser] = useState<any>(null);

  // 🚀 Geolocation 상태
  const [userLoc, setUserLoc] = useState<{lat: number, lng: number} | null>(null);
  const [isNearMe, setIsNearMe] = useState(false);
  const [distRange, setDistRange] = useState<0.5 | 2.0>(0.5);

  const supabase = createClient();

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);

      if (session?.user) {
        const { data: bookmarks } = await supabase.from("bookmarks").select("place_id").eq("user_id", session.user.id);
        if (bookmarks) {
          const bookmarkMap: Record<string, boolean> = {};
          bookmarks.forEach(b => bookmarkMap[b.place_id] = true);
          setBookmarkedPlaces(bookmarkMap);
        }
      }
    };
    getSession();
  }, []);

  const handleNearMeToggle = () => {
    if (!isNearMe) {
      if (!navigator.geolocation) {
        alert("이 브라우저는 위치 정보를 지원하지 않습니다.");
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLoc({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          setIsNearMe(true);
        },
        (err) => {
          alert("위치 정보를 가져오는데 실패했습니다: " + err.message);
        }
      );
    } else {
      setIsNearMe(false);
    }
  };

  // 🚀 필터링 및 거리순 정렬 로직
  let filteredPlaces = [...initialPlaces];
  
  if (selectedCategory) {
    filteredPlaces = filteredPlaces.filter(p => p.category === selectedCategory);
  }

  if (isNearMe && userLoc) {
    filteredPlaces = filteredPlaces
      .map(p => ({
        ...p,
        distance: calculateDistance(userLoc.lat, userLoc.lng, p.latitude, p.longitude)
      }))
      .filter(p => p.distance <= distRange)
      .sort((a, b) => a.distance - b.distance);
  } else if (userLoc) {
    // 위치는 있지만 필터링은 안 하는 경우, 전체 목록에 거리 정보만 주입
    filteredPlaces = filteredPlaces.map(p => ({
      ...p,
      distance: calculateDistance(userLoc.lat, userLoc.lng, p.latitude, p.longitude)
    }));
  }

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

  const toggleLike = (id: string) => setLikedPlaces(prev => ({ ...prev, [id]: !prev[id] }));

  const toggleBookmark = async (placeId: string) => {
    if (!user) { alert("로그인이 필요합니다!"); return; }
    const isBookmarked = bookmarkedPlaces[placeId];
    setBookmarkedPlaces(prev => ({ ...prev, [placeId]: !isBookmarked }));
    if (isBookmarked) { await supabase.from("bookmarks").delete().eq("user_id", user.id).eq("place_id", placeId); } 
    else { await supabase.from("bookmarks").insert({ user_id: user.id, place_id: placeId }); }
  };

  return (
    <div className="flex flex-col h-full w-full relative bg-[#FBFBFA] font-sans pb-20">
      <div className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b px-4 py-3 flex items-center justify-between shadow-sm">
        <h1 className="text-xl font-black bg-gradient-to-r from-orange-500 to-red-600 bg-clip-text text-transparent italic">OneCoinMap</h1>
        <div className="flex gap-4 text-gray-700">
           {/* 내 주변 필터 버튼 (Instagram Search Style) */}
           <button 
             onClick={handleNearMeToggle}
             className={`p-1.5 rounded-full transition-all ${isNearMe ? "bg-orange-500 text-white shadow-lg scale-110" : "bg-gray-100 text-gray-500"}`}
           >
             <LocateFixed className="h-5 w-5" />
           </button>
           <Search className="h-6 w-6 cursor-pointer" />
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden w-full relative">
        <div className={`flex-1 absolute md:static inset-0 transition-all duration-300 ${view === "map" ? "z-30 opacity-100 visible" : "-z-10 opacity-0 invisible md:visible md:opacity-100 md:z-0"}`}>
          <MapComponent 
            places={mapMarkers} 
            onMarkerClick={(id) => { console.log("Marker clicked:", id); }} 
          />
        </div>

        <div className={`w-full md:w-[420px] bg-white z-10 overflow-y-auto transition-all duration-300 ${view === "list" ? "translate-y-0" : "translate-y-full md:translate-y-0"}`}>
          
          {/* Geolocation Range Toggle (Sticky) */}
          {isNearMe && (
            <div className="bg-orange-50 px-4 py-2.5 flex items-center justify-between border-b border-orange-100 sticky top-0 z-30">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-orange-500 fill-orange-500" />
                <span className="text-xs font-bold text-orange-700">📍 현재 내 주변 {distRange === 0.5 ? "500m" : "2km"} 탐색 중</span>
              </div>
              <div className="flex bg-white rounded-lg p-0.5 shadow-sm border border-orange-200">
                <button 
                  onClick={() => setDistRange(0.5)}
                  className={`px-3 py-1 rounded-md text-[10px] font-black transition-all ${distRange === 0.5 ? "bg-orange-500 text-white shadow-sm" : "text-gray-400"}`}
                >
                  500m
                </button>
                <button 
                  onClick={() => setDistRange(2.0)}
                  className={`px-3 py-1 rounded-md text-[10px] font-black transition-all ${distRange === 2.0 ? "bg-orange-500 text-white shadow-sm" : "text-gray-400"}`}
                >
                  2km
                </button>
              </div>
            </div>
          )}

          <div className="flex flex-nowrap overflow-x-auto py-4 px-4 gap-3 no-scrollbar border-b bg-white">
            {categories.map(cat => (
              <button 
                key={cat}
                onClick={() => setSelectedCategory(selectedCategory === cat ? null : cat)}
                className="flex flex-col items-center gap-1.5 shrink-0 transition-transform active:scale-90"
              >
                <div className={`w-14 h-14 rounded-full p-[2px] ${selectedCategory === cat ? "bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600" : "bg-gray-200"}`}>
                  <div className="w-full h-full rounded-full bg-white p-0.5">
                    <div className="w-full h-full rounded-full bg-gray-50 flex items-center justify-center text-lg font-bold">
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
                <p className="font-bold text-sm">該当するお店が見つかりませんでした。</p>
                <p className="text-xs mt-1">탐색 영역을 넓히거나 필터를 조정해 보세요.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-gray-100 z-50 flex items-center justify-around px-4">
        <button onClick={() => setView("list")}>
          <Home className={`h-7 w-7 ${view === "list" ? "text-gray-900" : "text-gray-400"}`} />
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
            <div className="w-full h-full rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold uppercase tracking-tight">OCM</div>
          </div>
        </div>
        <div className="flex flex-col flex-1 min-w-0">
          <Link href={`/place/${place.id}`} className="font-bold text-[15px] truncate hover:underline text-gray-900 leading-none mb-1">{place.name}</Link>
          <div className="flex items-center text-[10px] text-gray-400 gap-1 font-medium italic">
            <MapPin className="h-2.5 w-2.5" /> 
            {place.address?.split(' ').slice(0, 3).join(' ')}
            {place.distance !== undefined && (
              <span className="text-primary font-black ml-1 text-[9px] not-italic">
                • {place.distance < 1 ? `${Math.round(place.distance * 1000)}m` : `${place.distance.toFixed(1)}km`}
              </span>
            )}
          </div>
        </div>
        <Badge variant="outline" className="text-[10px] bg-gray-50 border-none font-black text-gray-700 px-2.5 py-1 uppercase">{place.price_label}</Badge>
      </div>

      <div className="relative group touch-pan-y h-[400px]">
        <div className="overflow-hidden bg-gray-100 h-full" ref={emblaRef}>
          <div className="flex h-full">
            {images.map((src: string, i: number) => (
              <div className="flex-[0_0_100%] min-w-0 h-full relative" key={i}>
                <img src={src} alt={place.name} className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        </div>
        {images.length > 1 && (
          <>
            <button onClick={scrollPrev} className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/60 backdrop-blur-md rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity"><ChevronLeft className="h-4 w-4" /></button>
            <button onClick={scrollNext} className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/60 backdrop-blur-md rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity"><ChevronRight className="h-4 w-4" /></button>
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
               {images.map((_: any, i: number) => (
                 <div key={i} className="w-1.5 h-1.5 rounded-full bg-white/50"></div>
               ))}
            </div>
          </>
        )}
      </div>

      <div className="px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-5">
          <Heart onClick={onLike} className={`h-6 w-6 cursor-pointer transition-all active:scale-150 ${isLiked ? "fill-red-500 text-red-500" : "text-gray-900"}`} />
          <Share2 className="h-6 w-6 text-gray-900 cursor-pointer" />
        </div>
        <Bookmark 
          onClick={onBookmark}
          className={`h-6 w-6 cursor-pointer transition-all active:scale-150 ${isBookmarked ? "fill-gray-900 text-gray-900" : "text-gray-900"}`} 
        />
      </div>

      <div className="px-4 space-y-1 text-sm">
        <div className="flex items-center gap-2">
          <span className="font-black text-gray-900 leading-none">OneCoinMap</span>
          <span className="text-[10px] text-gray-400 font-bold bg-gray-50 px-1.5 py-0.5 rounded leading-none">#{place.category}</span>
        </div>
        <p className="text-[13px] text-gray-600 leading-[1.4] line-clamp-2">
          도쿄 최고의 500엔 맛집! 평점 {place.rating || "4.5"}점의 검증된 가성비 식당 {place.name}을(를) 확인해 보세요.
        </p>
      </div>
    </div>
  );
}
