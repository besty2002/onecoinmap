"use client";

import React, { useState } from "react";
import Image from "next/image";
import { MapPin, Heart, Share2, Bookmark, MessageCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import useEmblaCarousel from "embla-carousel-react";

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
  
  const images = place.place_images?.length > 0 
    ? place.place_images.map((i: any) => i.image_url) 
    : ["https://images.unsplash.com/photo-1542284992-cb31a89c4568?q=80&w=800"];
    
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
            <span className="font-bold text-sm">{author?.nickname || "OCM Voyager"}</span>
            <span className="text-[9px] bg-gray-100 px-1 rounded font-black text-gray-400">Lv.{author?.level || 1}</span>
          </div>
          <div className="flex items-center text-[10px] text-gray-400 gap-1 italic">
            <MapPin className="h-2 w-2" /> {place.address?.slice(0, 15)}...
          </div>
        </div>
        <Badge variant="outline" className="text-[10px] font-black bg-gray-50 uppercase">{place.price_label}</Badge>
      </div>

      <div className="relative h-[400px] bg-gray-50 overflow-hidden" ref={emblaRef}>
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
      </div>

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

      <div className="px-4 space-y-2">
        <p className="text-[13px] leading-relaxed">
          <span className="font-bold mr-2 text-gray-900">{author?.nickname || "OCM"}</span>
          원코인맵 도쿄 가성비 {place.category} 탐험 성공! {place.name} 추천합니다. ✨
        </p>
        {comments.slice(0, 3).map((c: any, i: number) => (
            <div key={i} className="text-[12px] flex gap-2">
              <span className="font-bold">{c.profiles?.nickname}</span>
              <span className="text-gray-500 truncate">{c.content}</span>
            </div>
        ))}
      </div>
    </div>
  );
});

PlaceFeedCard.displayName = "PlaceFeedCard";

export default PlaceFeedCard;
