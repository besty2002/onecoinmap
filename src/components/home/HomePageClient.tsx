"use client";

import { useState, useCallback, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Search, Navigation, Heart, Share2, Bookmark, PlusSquare, Home, Award, User, ChevronLeft, ChevronRight, LocateFixed, Zap, Send, MessageCircle } from "lucide-react";
import Link from "next/link";
import { MapComponent } from "@/components/map/MapComponent";
import useEmblaCarousel from "embla-carousel-react";
import { UploadPlaceModal } from "@/components/places/UploadPlaceModal";
import { createClient } from "@/lib/supabase/client";

// 🚀 하버사인 거리 계산기 (단위: km)
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

export default function HomePageClient({ initialPlaces }: { initialPlaces: any[] }) {
  const [view, setView] = useState<"map" | "list">("list");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [likedPlaces, setLikedPlaces] = useState<Record<string, boolean>>({});
  const [bookmarkedPlaces, setBookmarkedPlaces] = useState<Record<string, boolean>>({});
  const [user, setUser] = useState<any>(null);

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
      if (!navigator.geolocation) { alert("위치 정보를 지원하지 않는 브라우저입니다."); return; }
      navigator.geolocation.getCurrentPosition(
        (pos) => { setUserLoc({ lat: pos.coords.latitude, lng: pos.coords.longitude }); setIsNearMe(true); },
        (err) => { alert("위치 정보 실패: " + err.message); }
      );
    } else { setIsNearMe(false); }
  };

  let filteredPlaces = [...initialPlaces];
  if (selectedCategory) { filteredPlaces = filteredPlaces.filter(p => p.category === selectedCategory); }
  if (userLoc) {
    filteredPlaces = filteredPlaces.map(p => ({ ...p, distance: calculateDistance(userLoc.lat, userLoc.lng, p.latitude, p.longitude) }));
    if (isNearMe) {
      filteredPlaces = filteredPlaces.filter(p => p.distance <= distRange).sort((a, b) => a.distance - b.distance);
    }
  }

  const mapMarkers = filteredPlaces.map((p) => ({ id: p.id, name: p.name, lat: p.latitude, lng: p.longitude, price: p.price_label, category: p.category, address: p.address }));
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
           <button onClick={handleNearMeToggle} className={`p-1.5 rounded-full transition-all ${isNearMe ? "bg-orange-500 text-white shadow-lg scale-110" : "bg-gray-100 text-gray-500"}`}><LocateFixed className="h-5 w-5" /></button>
           <Search className="h-6 w-6 cursor-pointer" />
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden w-full relative">
        <div className={`flex-1 absolute md:static inset-0 transition-all duration-300 ${view === "map" ? "z-30 opacity-100 visible" : "-z-10 opacity-0 invisible md:visible md:opacity-100 md:z-0"}`}>
          <MapComponent places={mapMarkers} onMarkerClick={(id) => {}} />
        </div>

        <div className={`w-full md:w-[420px] bg-white z-10 overflow-y-auto transition-all duration-300 ${view === "list" ? "translate-y-0" : "translate-y-full md:translate-y-0"}`}>
          {isNearMe && (
            <div className="bg-orange-50 px-4 py-2.5 flex items-center justify-between border-b border-orange-100 sticky top-0 z-30">
              <div className="flex items-center gap-2"><Zap className="h-4 w-4 text-orange-500 fill-orange-500" /><span className="text-xs font-bold text-orange-700">📍 현재 내 주변 {distRange === 0.5 ? "500m" : "2km"} 탐색 중</span></div>
              <div className="flex bg-white rounded-lg p-0.5 shadow-sm border border-orange-200">
                <button onClick={() => setDistRange(0.5)} className={`px-3 py-1 rounded-md text-[10px] font-black transition-all ${distRange === 0.5 ? "bg-orange-500 text-white shadow-sm" : "text-gray-400"}`}>500m</button>
                <button onClick={() => setDistRange(2.0)} className={`px-3 py-1 rounded-md text-[10px] font-black transition-all ${distRange === 2.0 ? "bg-orange-500 text-white shadow-sm" : "text-gray-400"}`}>2km</button>
              </div>
            </div>
          )}

          <div className="flex flex-nowrap overflow-x-auto py-4 px-4 gap-3 no-scrollbar border-b bg-white">
            {categories.map(cat => (
              <button key={cat} onClick={() => setSelectedCategory(selectedCategory === cat ? null : cat)} className="flex flex-col items-center gap-1.5 shrink-0 transition-transform active:scale-90">
                <div className={`w-14 h-14 rounded-full p-[2px] ${selectedCategory === cat ? "bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600" : "bg-gray-200"}`}><div className="w-full h-full rounded-full bg-white p-0.5"><div className="w-full h-full rounded-full bg-gray-50 flex items-center justify-center text-lg font-bold">{cat.charAt(0)}</div></div></div>
                <span className={`text-[10px] font-bold ${selectedCategory === cat ? "text-gray-900" : "text-gray-400"}`}>{cat}</span>
              </button>
            ))}
          </div>

          <div className="divide-y divide-gray-100">
            {filteredPlaces.map((place) => (
              <PlaceFeedCard key={place.id} place={place} currentUser={user} isLiked={!!likedPlaces[place.id]} isBookmarked={!!bookmarkedPlaces[place.id]} onLike={() => toggleLike(place.id)} onBookmark={() => toggleBookmark(place.id)} />
            ))}
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-gray-100 z-50 flex items-center justify-around px-4">
        <button onClick={() => setView("list")}><Home className={`h-7 w-7 ${view === "list" ? "text-gray-900" : "text-gray-400"}`} /></button>
        <button onClick={() => setView(view === "map" ? "list" : "map")}><MapPin className={`h-7 w-7 ${view === "map" ? "text-primary font-bold" : "text-gray-400"}`} /></button>
        <UploadPlaceModal />
        <Link href="/ranking"><Award className="h-7 w-7 text-gray-400" /></Link>
        <Link href="/profile"><User className={`h-7 w-7 ${user ? "text-gray-900" : "text-gray-400"}`} /></Link>
      </div>
    </div>
  );
}

function PlaceFeedCard({ place, currentUser, isLiked, isBookmarked, onLike, onBookmark }: { 
  place: any, currentUser: any, isLiked: boolean, isBookmarked: boolean, onLike: () => void, onBookmark: () => void 
}) {
  const [comments, setComments] = useState<any[]>([]);
  const [commentText, setCommentText] = useState("");
  const [authorProfile, setAuthorProfile] = useState<any>(null);
  const supabase = createClient();

  useEffect(() => {
    // 🚀 게시자 정보 및 댓글 로드
    const loadSocialData = async () => {
      // 1. 게시자(작성자) 프로필 (레벨/뱃지 포함)
      if (place.user_id) {
          const { data: profile } = await supabase.from("profiles").select("*").eq("id", place.user_id).single();
          setAuthorProfile(profile);
      }
      // 2. 댓글 목록 (작성자 프로필 조인)
      const { data: commentList } = await supabase
        .from("comments")
        .select("*, profiles(nickname, avatar_url, level)")
        .eq("place_id", place.id)
        .order("created_at", { ascending: true });
      setComments(commentList || []);
    };
    loadSocialData();
  }, [place.id, place.user_id]);

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) { alert("로그인이 필요합니다!"); return; }
    if (!commentText.trim()) return;

    const newComment = {
      place_id: place.id,
      user_id: currentUser.id,
      content: commentText,
      created_at: new Date().toISOString()
    };

    // Optimistic Update
    setComments(prev => [...prev, { ...newComment, profiles: { nickname: "You", level: 1 } }]);
    setCommentText("");

    const { error } = await supabase.from("comments").insert(newComment);
    if (error) console.error("Error saving comment:", error);
  };

  const images = place.place_images && place.place_images.length > 0 ? place.place_images.map((img: any) => img.image_url) : ["https://images.unsplash.com/photo-1542284992-cb31a89c4568?q=80&w=800&auto=format&fit=crop"];
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
  const scrollPrev = useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi]);

  return (
    <div className="bg-white pb-6">
      {/* Header with Level Badge */}
      <div className="flex items-center px-4 py-3 gap-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-yellow-400 to-purple-600 p-[2px]">
          <div className="w-full h-full rounded-full bg-white p-0.5">
            <img 
               src={authorProfile?.avatar_url || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=100"} 
               className="w-full h-full rounded-full object-cover" 
               alt="p" 
            />
          </div>
        </div>
        <div className="flex flex-col flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-[14px] text-gray-900">{authorProfile?.nickname || "OneCoin Voyager"}</span>
            <span className="bg-gray-100 text-[9px] font-black text-gray-400 px-1.5 py-0.5 rounded-full uppercase tracking-tighter">
                Lv.{authorProfile?.level || 1}
            </span>
          </div>
          <div className="flex items-center text-[10px] text-gray-400 gap-1 font-medium truncate italic">
            <MapPin className="h-2.5 w-2.5" /> {place.address?.split(' ').slice(0, 3).join(' ')}
            {place.distance !== undefined && <span className="text-secondary font-black ml-1 text-[9px] not-italic">• {place.distance < 1 ? `${Math.round(place.distance * 1000)}m` : `${place.distance.toFixed(1)}km`}</span>}
          </div>
        </div>
        <Badge className="text-[10px] bg-gray-50 border-none font-black text-gray-700 px-2 py-1 uppercase">{place.price_label}</Badge>
      </div>

      {/* Media Carousel */}
      <div className="relative group h-[400px]">
        <div className="overflow-hidden bg-gray-50 h-full" ref={emblaRef}>
          <div className="flex h-full">{images.map((src: string, i: number) => (<div className="flex-[0_0_100%] min-w-0 h-full relative" key={i}><img src={src} className="w-full h-full object-cover" alt="p" /></div>))}</div>
        </div>
        {images.length > 1 && (
            <>
                <button onClick={scrollPrev} className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/60 backdrop-blur-md rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity"><ChevronLeft className="h-4 w-4" /></button>
                <button onClick={scrollNext} className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/60 backdrop-blur-md rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity"><ChevronRight className="h-4 w-4" /></button>
            </>
        )}
      </div>

      {/* Social Actions */}
      <div className="px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-5 text-gray-900">
          <Heart onClick={onLike} className={`h-6 w-6 cursor-pointer transition-all active:scale-150 ${isLiked ? "fill-red-500 text-red-500" : ""}`} />
          <MessageCircle className="h-6 w-6 cursor-pointer" />
          <Share2 className="h-6 w-6 cursor-pointer" />
        </div>
        <Bookmark onClick={onBookmark} className={`h-6 w-6 cursor-pointer transition-all active:scale-150 ${isBookmarked ? "fill-gray-900 text-gray-900" : ""}`} />
      </div>

      {/* Caption & Comments */}
      <div className="px-4 space-y-3">
        <div className="text-[13.5px] leading-relaxed">
            <span className="font-bold mr-2">{authorProfile?.nickname || "OneCoinMap"}</span>
            <span className="text-gray-600">이번 도쿄 방문에서 찾은 진정한 원코인 파라다이스! {place.name}입니다. #가성비맛집 #도쿄라이프</span>
        </div>

        {/* Comment List (Instagram Style) */}
        {comments.length > 0 && (
          <div className="space-y-1.5 pt-1">
            {comments.slice(-3).map((c, i) => (
              <div key={i} className="text-[13px] flex items-start gap-2">
                <span className="font-bold shrink-0">{c.profiles?.nickname || "User"}</span>
                <span className="text-gray-600 line-clamp-1">{c.content}</span>
              </div>
            ))}
            {comments.length > 3 && (
              <button className="text-[12px] text-gray-400 font-medium">댓글 {comments.length}개 모두 보기</button>
            )}
          </div>
        )}

        {/* Comment Input */}
        <form onSubmit={handleCommentSubmit} className="flex items-center gap-2 pt-2 border-t border-gray-50">
          <Input 
             placeholder="댓글 달기..." 
             value={commentText} 
             onChange={(e) => setCommentText(e.target.value)} 
             className="border-none bg-transparent h-8 text-[13px] px-0 focus-visible:ring-0 placeholder:text-gray-300" 
          />
          <button type="submit" disabled={!commentText.trim()} className="text-primary font-black text-[13px] disabled:opacity-30">게시</button>
        </form>
      </div>
    </div>
  );
}
