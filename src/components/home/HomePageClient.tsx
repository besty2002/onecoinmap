"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import Image from "next/image";
import dynamic from "next/dynamic";
import { useInView } from "react-intersection-observer";
import { Search, MapPin, Home, Award, User, LocateFixed, LucideLoader2, Utensils, UtensilsCrossed, Flame, LayoutGrid, Croissant, Globe, Soup, Drumstick, Pizza, Beef, Box, Leaf, Coffee, CircleEllipsis } from "lucide-react";
import Link from "next/link";
import { UploadPlaceModal } from "@/components/places/UploadPlaceModal";
import { createClient } from "@/lib/supabase/client";
import PlaceFeedCard from "./PlaceFeedCard";

// 🚀 지도 컴포넌트 지연 로딩 (Lazy Loading)
const MapComponent = dynamic(() => import("@/components/map/MapComponent").then(mod => mod.MapComponent), {
  ssr: false,
  loading: () => <div className="w-full h-full bg-gray-100 animate-pulse flex items-center justify-center text-gray-400">Loading Map...</div>
});

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

export default function HomePageClient({ initialPlaces }: { initialPlaces: any[] }) {
  const [view, setView] = useState<"map" | "list">("list");
  const [places, setPlaces] = useState<any[]>(initialPlaces);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [likedPlaces, setLikedPlaces] = useState<Record<string, boolean>>({});
  const [bookmarkedPlaces, setBookmarkedPlaces] = useState<Record<string, boolean>>({});
  const [user, setUser] = useState<any>(null);
  const [userLoc, setUserLoc] = useState<{lat: number, lng: number} | null>(null);
  const [isNearMe, setIsNearMe] = useState(false);
  const [distRange, setDistRange] = useState<0.5 | 2.0>(0.5);

  const supabase = createClient();
  const { ref, inView } = useInView({ threshold: 0.1 });

  // 🚀 무한 스크롤 데이터 페칭
  const loadMorePlaces = useCallback(async () => {
    if (loading || !hasMore) return;
    setLoading(true);
    const from = page * 10;
    const to = from + 9;

    const { data: newPlaces, error } = await supabase
      .from("places")
      .select(`
        *,
        min_price,
        source_type,
        place_images(image_url),
        profiles(id, display_name, avatar_url)
      `)
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .range(from, to);

    if (error || !newPlaces || newPlaces.length < 10) setHasMore(false);
    if (newPlaces) setPlaces(prev => [...prev, ...newPlaces]);
    setPage(prev => prev + 1);
    setLoading(false);
  }, [page, loading, hasMore, supabase]);

  useEffect(() => {
    if (inView && hasMore) loadMorePlaces();
  }, [inView, hasMore, loadMorePlaces]);

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      if (session?.user) {
        const { data: b } = await supabase.from("bookmarks").select("place_id").eq("user_id", session.user.id);
        if (b) {
          const map: any = {}; b.forEach((x: any) => map[x.place_id] = true);
          setBookmarkedPlaces(map);
        }
      }
    };
    getSession();
  }, [supabase]);

  const handleNearMeToggle = useCallback(() => {
    if (!isNearMe) {
        navigator.geolocation.getCurrentPosition(
            (pos) => { setUserLoc({ lat: pos.coords.latitude, lng: pos.coords.longitude }); setIsNearMe(true); },
            (err) => alert("Error: " + err.message)
        );
    } else setIsNearMe(false);
  }, [isNearMe]);

  const toggleLike = useCallback((placeId: string) => {
    setLikedPlaces(p => ({ ...p, [placeId]: !p[placeId] }));
  }, []);

  const toggleBookmark = useCallback(async (placeId: string) => {
    if (!user) return;
    const isB = !!bookmarkedPlaces[placeId];
    setBookmarkedPlaces(p => ({ ...p, [placeId]: !isB }));
    
    if (isB) {
      await supabase.from('bookmarks').delete().eq('user_id', user.id).eq('place_id', placeId);
    } else {
      await supabase.from('bookmarks').insert({ user_id: user.id, place_id: placeId });
    }
  }, [user, bookmarkedPlaces, supabase]);

  const displayPlaces = useMemo(() => {
    let list = [...places];
    if (selectedCategory) list = list.filter(p => p.category === selectedCategory);
    if (userLoc) {
      list = list.map(p => ({ ...p, distance: calculateDistance(userLoc.lat, userLoc.lng, p.latitude, p.longitude) }));
      if (isNearMe) list = list.filter(p => p.distance <= (distRange || 0.5)).sort((a,b) => (a.distance || 0) - (b.distance || 0));
    }
    return list;
  }, [places, selectedCategory, userLoc, isNearMe, distRange]);

  const mapMarkers = useMemo(() => 
    displayPlaces.map(p => ({ 
      id: p.id, 
      name: p.name, 
      lat: p.latitude, 
      lng: p.longitude, 
      price: p.min_price?.toString() || p.price_label, 
      category: p.category, 
      address: p.address,
      source_type: p.source_type
    })), [displayPlaces]);
  
  const categories = [
    { name: "도시락", icon: <Box className="h-5 w-5" /> },
    { name: "면요리", icon: <Soup className="h-5 w-5" /> },
    { name: "일식", icon: <Utensils className="h-5 w-5" /> },
    { name: "중식", icon: <UtensilsCrossed className="h-5 w-5" /> },
    { name: "한식", icon: <Flame className="h-5 w-5" /> },
    { name: "양식", icon: <Croissant className="h-5 w-5" /> },
    { name: "버거", icon: <CircleEllipsis className="h-5 w-5" /> },
    { name: "치킨", icon: <Drumstick className="h-5 w-5" /> },
    { name: "피자", icon: <Pizza className="h-5 w-5" /> },
    { name: "고기/구이", icon: <Beef className="h-5 w-5" /> },
    { name: "찜/탕", icon: <Soup className="h-5 w-5" /> },
    { name: "샐러드", icon: <Leaf className="h-5 w-5" /> },
    { name: "카페", icon: <Coffee className="h-5 w-5" /> },
    { name: "아시안", icon: <Globe className="h-5 w-5" /> },
    { name: "한식뷔페", icon: <LayoutGrid className="h-5 w-5" /> },
  ];

  return (
    <div className="flex flex-col h-full w-full relative bg-white font-sans pb-20">
      <div className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b px-4 py-3 flex items-center justify-between">
        <h1 className="text-xl font-black bg-gradient-to-r from-orange-500 to-red-600 bg-clip-text text-transparent italic">OneCoinMap</h1>
        <div className="flex gap-4 items-center">
           <button onClick={handleNearMeToggle} className={`p-1.5 rounded-full ${isNearMe ? "bg-orange-500 text-white" : "bg-gray-100 text-gray-400"}`}><LocateFixed className="h-5 w-5" /></button>
           <Search className="h-6 w-6 text-gray-700" />
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden relative">
        {/* 🚀 지도 컨테이너 (모바일 가시성 확보) */}
        <div className={`flex-1 absolute md:static inset-0 transition-all duration-300 ${view === "map" ? "z-30 opacity-100 visible" : "-z-10 opacity-0 invisible md:visible md:opacity-100 md:z-0"}`}>
          <MapComponent places={mapMarkers} />
        </div>

        <div className={`w-full md:w-[420px] bg-white overflow-y-auto z-10 transition-all duration-300 ${view === "list" ? "translate-y-0" : "translate-y-full md:translate-y-0"}`}>
          {isNearMe && (
            <div className="bg-orange-50 px-4 py-2 flex items-center justify-between border-b sticky top-0 z-30">
              <span className="text-[10px] font-bold text-orange-700 italic">📍 周辺 {distRange}km モード</span>
              <div className="flex bg-white rounded p-0.5 border border-orange-200">
                <button onClick={() => setDistRange(0.5)} className={`px-2 py-0.5 rounded text-[10px] font-black ${distRange === 0.5 ? "bg-orange-500 text-white" : "text-gray-400"}`}>500m</button>
                <button onClick={() => setDistRange(2.0)} className={`px-2 py-0.5 rounded text-[10px] font-black ${distRange === 2.0 ? "bg-orange-500 text-white" : "text-gray-400"}`}>2km</button>
              </div>
            </div>
          )}

          <div className="flex overflow-x-auto p-4 gap-4 border-b no-scrollbar bg-white scroll-smooth">
            {categories.map(cat => (
              <button 
                key={cat.name} 
                onClick={() => setSelectedCategory(selectedCategory === cat.name ? null : cat.name)} 
                className="flex flex-col items-center gap-1.5 shrink-0"
              >
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-200 border-2 ${
                  selectedCategory === cat.name 
                    ? "bg-orange-500 border-orange-500 text-white shadow-lg shadow-orange-200 scale-110" 
                    : "bg-gray-50 border-gray-100 text-gray-400"
                }`}>
                  {cat.icon}
                </div>
                <span className={`text-[10px] font-black tracking-tighter ${selectedCategory === cat.name ? "text-orange-600" : "text-gray-400"}`}>
                  {cat.name}
                </span>
              </button>
            ))}
          </div>

          <div className="divide-y divide-gray-100">
            {displayPlaces.map(place => (
              <PlaceFeedCard 
                key={place.id} 
                place={place} 
                currentUser={user} 
                isLiked={!!likedPlaces[place.id]} 
                isBookmarked={!!bookmarkedPlaces[place.id]}
                onLike={() => toggleLike(place.id)}
                onBookmark={() => toggleBookmark(place.id)}
              />
            ))}
            
            {/* 🚀 무한 스크롤 트리거 & 로딩 바 */}
            <div ref={ref} className="p-10 flex justify-center">
              {loading && <LucideLoader2 className="h-6 w-6 text-primary animate-spin" />}
              {!hasMore && displayPlaces.length > 0 && <p className="text-xs text-gray-400 font-bold">東京のすべてのコスパ店をチェックしました！🍜</p>}
            </div>
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 h-16 bg-white border-t z-50 flex items-center justify-around">
        <button onClick={() => setView("list")}><Home className={`h-7 w-7 ${view === "list" ? "text-gray-900" : "text-gray-300"}`} /></button>
        <button onClick={() => setView("map")}><MapPin className={`h-7 w-7 ${view === "map" ? "text-gray-900" : "text-gray-300"}`} /></button>
        <UploadPlaceModal />
        <Link href="/ranking"><Award className="h-7 w-7 text-gray-300" /></Link>
        <Link href="/profile"><User className={`h-7 w-7 ${user ? "text-gray-900" : "text-gray-300"}`} /></Link>
      </div>
    </div>
  );
}


