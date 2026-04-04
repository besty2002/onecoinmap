"use client";

import React, { useState } from "react";
import Image from "next/image";
import { MapPin, Heart, Share2, Bookmark, MessageCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import useEmblaCarousel from "embla-carousel-react";
import Link from "next/link";

interface PlaceFeedCardProps {
  place: any;
  currentUser: any;
  isLiked: boolean;
  isBookmarked: boolean;
  onLike: () => void;
  onBookmark: () => void;
}

const PlaceFeedCard = React.memo(({ place, currentUser, isLiked, isBookmarked, onLike, onBookmark }: PlaceFeedCardProps) => {
  // 상위에서 조인된 데이터 사용 (profiles -> author, comments -> comments)
  const author = place.profiles;
  const comments = place.comments || [];
  
  const getCategoryFallback = (cat: string) => {
    switch (cat) {
      case "お弁当":
      case "도시락": return "https://images.unsplash.com/photo-1547584370-2cc98b8b8dc8?q=80&w=500";
      case "ラーメン・麺":
      case "면요리": return "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?q=80&w=500";
      case "牛丼・カレー":
      case "카레": return "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?q=80&w=500";
      case "定食・和食":
      case "일식": return "https://images.unsplash.com/photo-1583202683969-9134ba972e39?q=80&w=500";
      case "中華料理":
      case "중식": return "https://images.unsplash.com/photo-1525755662778-989d0524087e?q=80&w=500";
      case "韓国料理":
      case "한식": return "https://images.unsplash.com/photo-1498654896293-37aacf113fd9?q=80&w=500";
      case "洋食・パスタ":
      case "양식": return "https://images.unsplash.com/photo-1473093295043-cdd812d0e601?q=80&w=500";
      default: return "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=500";
    }
  };

  const images = place.place_images?.length > 0 
    ? place.place_images.map((i: any) => i.image_url) 
    : [getCategoryFallback(place.category)];
    
  const [emblaRef] = useEmblaCarousel({ loop: true });

  return (
    <div className="bg-white pb-6 touch-manipulation">
      <div className="flex items-center px-4 py-3 gap-3">
        <div className="w-9 h-9 rounded-full bg-gray-100 overflow-hidden relative">
            <Image 
                src={author?.avatar_url || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=100"} 
                alt="avatar" fill className="object-cover" 
            />
        </div>
        <div className="flex flex-col flex-1">
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-sm">{author?.display_name || "OCM Voyager"}</span>
            <span className="text-[9px] bg-gray-100 px-1 rounded font-black text-gray-400">Lv.1</span>
          </div>
          <div className="flex items-center text-[10px] text-gray-400 gap-1 italic">
            <MapPin className="h-2 w-2" /> {place.address?.slice(0, 15)}...
          </div>
        </div>
        <Badge variant="outline" className="text-[10px] font-black bg-gray-50 uppercase">{place.price_label}</Badge>
      </div>

      <Link href={`/place/${place.id}`} className="block relative h-[400px] bg-gray-50 overflow-hidden" ref={emblaRef}>
        <div className="flex h-full">
            {images.map((src: string, i: number) => (
                <div key={i} className="flex-[0_0_100%] h-full relative">
                    <Image 
                        src={src} alt={place.name} fill 
                        className="object-cover" 
                        sizes="(max-width: 768px) 100vw, 420px"
                        priority={i === 0} 
                    />
                </div>
            ))}
        </div>
      </Link>

      <div className="px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-5">
          <button onClick={onLike} className="transition-transform active:scale-90">
            <Heart className={`h-6 w-6 ${isLiked ? "fill-red-500 text-red-500" : ""}`} />
          </button>
          <MessageCircle className="h-6 w-6" />
          <Share2 className="h-6 w-6" />
        </div>
        <button onClick={onBookmark} className="transition-transform active:scale-90">
          <Bookmark className={`h-6 w-6 ${isBookmarked ? "fill-gray-900 text-gray-900" : ""}`} />
        </button>
      </div>
      <div className="px-4 space-y-2 pb-2">
        <p className="text-[13px] leading-relaxed">
          <span className="font-bold mr-2 text-gray-900">{author?.display_name || "OCM"}</span>
          ワンコインマップ 東京のコスパ最強{place.category}探索成功！
          <Link href={`/place/${place.id}`} className="font-bold text-orange-600 hover:underline ml-1">
            {place.name}
          </Link> おすすめです。 ✨
        </p>
      </div>
    </div>
  );
});

PlaceFeedCard.displayName = "PlaceFeedCard";

export default PlaceFeedCard;
