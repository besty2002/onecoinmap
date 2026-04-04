"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PlaceImageCarouselProps {
  images: string[];
  name: string;
}

export function PlaceImageCarousel({ images, name }: PlaceImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextSlide = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  return (
    <div className="relative w-full aspect-square bg-gray-100 overflow-hidden group">
      <div 
        className="flex h-full transition-transform duration-500 ease-out" 
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {images.map((url, idx) => (
          <div key={idx} className="w-full h-full flex-shrink-0 relative">
            <Image 
              src={url} 
              alt={`${name} - ${idx + 1}`} 
              fill 
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 600px"
              priority={idx === 0}
              onError={(e) => {
                // Fallback for broken images
                (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1542284992-cb31a89c4568?q=80&w=800";
              }}
            />
          </div>
        ))}
      </div>

      {images.length > 1 && (
        <>
          <button 
            onClick={prevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/20 backdrop-blur-md text-white opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button 
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/20 backdrop-blur-md text-white opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <ChevronRight className="h-6 w-6" />
          </button>

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
            {images.map((_, idx) => (
              <div 
                key={idx} 
                className={`h-1.5 w-1.5 rounded-full transition-all ${
                  idx === currentIndex ? "bg-white w-3" : "bg-white/50"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
