"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Search, Navigation } from "lucide-react";
import Link from "next/link";
import { MapComponent } from "@/components/map/MapComponent";

export default function HomePageClient({ initialPlaces }: { initialPlaces: any[] }) {
  const [view, setView] = useState<"map" | "list">("map");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // 🚀 카테고리 필터링 로직
  const filteredPlaces = selectedCategory 
    ? initialPlaces.filter(p => p.category === selectedCategory)
    : initialPlaces;

  // DB 형식에서 MapComponent가 원하는 형태로 매핑
  const mapMarkers = filteredPlaces.map((p) => ({
    id: p.id,
    name: p.name,
    lat: p.latitude,
    lng: p.longitude,
    price: p.price_label,
    category: p.category,
    address: p.address,
  }));

  const categories = ["라멘", "카페\u00b7\ubca0\uc774\ucee4\ub9ac", "\uc2a4\uc2dc\u00b7\uc77c\uc2dd", "\ud328\uc2a4\ud2b8\ud478\ub4dc", "\uc774\uc790\uce74\uc57c\u00b7\uc220\uc9d1"];

  return (
    <div className="flex flex-col h-full w-full relative">
      <div className="p-4 bg-background/95 backdrop-blur z-10 space-y-3 shadow-sm border-b sticky top-0 md:static">
        <div className="flex gap-2 relative">
          <Input 
            placeholder="\uc5d0\ub9ac\uc5b4, \uc2dd\ub2f9\uba85, \uc694\ub9ac \uc774\ub984\uc73c\ub85c \uac80\uc0c9..." 
            className="w-full pl-9 rounded-full bg-muted border-none"
          />
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Button size="icon" variant="secondary" className="rounded-full shrink-0">
            <Navigation className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex flex-nowrap overflow-x-auto pb-1 gap-2 no-scrollbar hide-scrollbar">
          <Badge 
            variant={selectedCategory === null ? "secondary" : "outline"} 
            className="rounded-full px-4 py-1.5 whitespace-nowrap cursor-pointer"
            onClick={() => setSelectedCategory(null)}
          >
            \uc804\uccb4
          </Badge>
          {categories.map(cat => (
            <Badge 
              key={cat}
              variant={selectedCategory === cat ? "secondary" : "outline"} 
              className="rounded-full px-4 py-1.5 whitespace-nowrap cursor-pointer"
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </Badge>
          ))}
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden w-full relative">
        <div className={`flex-1 absolute md:static inset-0 bg-muted/30 transition-opacity ${view === "map" ? "z-0 opacity-100" : "-z-10 opacity-0 md:opacity-100 md:z-0"}`}>
          <MapComponent 
            places={mapMarkers} 
            onMarkerClick={(id) => {
              console.log("Marker clicked:", id);
            }} 
          />
        </div>

        <div className={`w-full md:w-[400px] border-l bg-background z-10 overflow-y-auto transition-transform ${view === "list" ? "translate-y-0" : "translate-y-full md:translate-y-0"}`}>
          <div className="p-4 space-y-4">
            <h2 className="font-semibold px-1">\uc8fc\ubcc0\uc758 \ucc3e\uc740 \uc2dd\ub2f9 ({filteredPlaces.length})</h2>
            {filteredPlaces.map((place) => {
              const imageUrl = place.place_images?.[0]?.image_url || "https://images.unsplash.com/photo-1542284992-cb31a89c4568?q=80&w=600&auto=format&fit=crop";

              return (
                <Link href={`/place/${place.id}`} key={place.id} className="block group">
                  <Card className="overflow-hidden border-none shadow-sm group-hover:shadow-md transition-shadow bg-card">
                    <div className="flex h-28">
                      <div className="w-28 h-28 flex-shrink-0 bg-muted overflow-hidden">
                        <img 
                          src={imageUrl} 
                          alt={place.name} 
                          className="w-full h-full object-cover"
                          loading="lazy"
                          referrerPolicy="no-referrer"
                          crossOrigin="anonymous"
                        />
                      </div>
                      <div className="p-3 flex flex-col justify-between flex-1 min-w-0">
                        <div>
                          <div className="flex justify-between items-start mb-1">
                            <h3 className="font-medium text-sm truncate pr-2 leading-tight">{place.name}</h3>
                            <Badge variant="default" className="text-[10px] px-1.5 py-0 h-4 bg-primary/10 text-primary border-none">{place.price_label}</Badge>
                          </div>
                          <p className="text-xs text-muted-foreground truncate flex items-center gap-1 mt-1">
                            <MapPin className="h-3 w-3 inline" /> {place.address}
                          </p>
                        </div>
                        <div className="flex items-center text-xs text-muted-foreground gap-2">
                          <span className="bg-muted px-1.5 py-0.5 rounded text-[10px]">{place.category}</span>
                          <span>⭐ 4.5</span>
                        </div>
                      </div>
                    </div>
                  </Card>
                </Link>
              );
            })}
            
            {filteredPlaces.length === 0 && (
              <div className="py-12 text-center text-muted-foreground">
                <p>登録されたお店がありません。</p>
                <Link href="/add">
                  <Button variant="outline" className="mt-4">最初のお店を登録する</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="md:hidden fixed bottom-20 left-1/2 -translate-x-1/2 z-50 shadow-lg rounded-full">
        <Button 
          className="rounded-full px-6 bg-primary font-bold shadow-md h-12"
          onClick={() => setView(view === "map" ? "list" : "map")}
        >
          {view === "map" ? "リストを表示" : "地図を表示"}
        </Button>
      </div>
    </div>
  );
}
