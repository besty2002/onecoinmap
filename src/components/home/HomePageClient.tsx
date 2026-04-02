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

  // 🚀 カテゴリフィルタリングロジック
  const filteredPlaces = selectedCategory 
    ? initialPlaces.filter(p => p.category === selectedCategory)
    : initialPlaces;

  // DB形式からMapComponentが求める形にマッピング
  const mapMarkers = filteredPlaces.map((p) => ({
    id: p.id,
    name: p.name,
    lat: p.latitude,
    lng: p.longitude,
    price: p.price_label,
    category: p.category,
    address: p.address,
  }));

  const categories = ["ラーメン", "カフェ・ベーカリー", "寿司・和食", "ファストフード", "居酒屋・バー"];

  return (
    <div className="flex flex-col h-full w-full relative font-sans">
      {/* Search Header */}
      <div className="p-4 bg-white/95 backdrop-blur-md z-10 space-y-4 shadow-sm border-b sticky top-0 md:static">
        <div className="flex gap-2 relative">
          <Input 
            placeholder="エリア、店名、料理などで検索..." 
            className="w-full pl-10 rounded-2xl bg-gray-100 border-none h-12 text-sm focus-visible:ring-2 focus-visible:ring-primary/20 transition-all"
          />
          <Search className="absolute left-3.5 top-4 h-4 w-4 text-gray-400" />
          <Button size="icon" variant="secondary" className="rounded-2xl shrink-0 h-12 w-12 shadow-sm bg-gray-100 hover:bg-gray-200 border-none">
            <Navigation className="h-4 w-4 text-gray-600" />
          </Button>
        </div>
        
        {/* Category Filters */}
        <div className="flex flex-nowrap overflow-x-auto pb-1 gap-2 no-scrollbar">
          <Badge 
            variant={selectedCategory === null ? "secondary" : "outline"} 
            className={`rounded-full px-5 py-2.5 whitespace-nowrap cursor-pointer transition-all border-none ${selectedCategory === null ? "bg-black text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
            onClick={() => setSelectedCategory(null)}
          >
            すべて
          </Badge>
          {categories.map(cat => (
            <Badge 
              key={cat}
              variant={selectedCategory === cat ? "secondary" : "outline"} 
              className={`rounded-full px-5 py-2.5 whitespace-nowrap cursor-pointer transition-all border-none ${selectedCategory === cat ? "bg-black text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </Badge>
          ))}
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden w-full relative bg-gray-50/50">
        {/* Map View */}
        <div className={`flex-1 absolute md:static inset-0 transition-opacity duration-300 ${view === "map" ? "z-0 opacity-100" : "-z-10 opacity-0 md:opacity-100 md:z-0"}`}>
          <MapComponent 
            places={mapMarkers} 
            onMarkerClick={(id) => {
              console.log("Marker clicked:", id);
            }} 
          />
        </div>

        {/* List View */}
        <div className={`w-full md:w-[420px] border-l bg-white z-10 overflow-y-auto transition-all duration-500 shadow-2xl md:shadow-none ${view === "list" ? "translate-y-0" : "translate-y-full md:translate-y-0"}`}>
          <div className="p-5 space-y-6">
            <div className="flex items-center justify-between px-1">
              <h2 className="font-bold text-xl tracking-tight text-gray-900">周辺の飲食店</h2>
              <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-lg">{filteredPlaces.length}件</span>
            </div>
            
            <div className="grid gap-4">
              {filteredPlaces.map((place) => {
                const imageUrl = place.place_images?.[0]?.image_url || "https://images.unsplash.com/photo-1542284992-cb31a89c4568?q=80&w=600&auto=format&fit=crop";

                return (
                  <Link href={`/place/${place.id}`} key={place.id} className="block group">
                    <Card className="overflow-hidden border-none shadow-sm hover:shadow-xl transition-all duration-300 bg-white rounded-[24px]">
                      <div className="flex h-32">
                        <div className="w-32 h-32 flex-shrink-0 relative overflow-hidden">
                          <img 
                            src={imageUrl} 
                            alt={place.name} 
                            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                            loading="lazy"
                            referrerPolicy="no-referrer"
                            crossOrigin="anonymous"
                          />
                        </div>
                        <div className="p-4 flex flex-col justify-between flex-1 min-w-0">
                          <div>
                            <div className="flex justify-between items-start mb-1.5">
                              <h3 className="font-bold text-base truncate pr-2 leading-tight text-gray-900 group-hover:text-primary transition-colors">{place.name}</h3>
                              <Badge variant="default" className="text-[10px] px-2 py-0.5 h-5 bg-orange-100 text-orange-600 border-none font-bold shrink-0">{place.price_label}</Badge>
                            </div>
                            <p className="text-[11px] text-gray-500 truncate flex items-center gap-1 mt-1 font-medium italic">
                              <MapPin className="h-3 w-3 inline text-orange-400" /> {place.address}
                            </p>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="bg-gray-100 px-3 py-1 rounded-full text-[10px] font-bold text-gray-600">{place.category}</span>
                            <span className="flex items-center gap-0.5 font-bold text-amber-500 text-sm">⭐ {place.rating || "4.5"}</span>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </Link>
                );
              })}
            </div>
            
            {filteredPlaces.length === 0 && (
              <div className="py-24 text-center text-gray-400 bg-gray-50 rounded-[32px] border border-dashed border-gray-200 mx-1">
                <p className="font-medium text-sm">該当するお店が見つかりませんでした。</p>
                <Button variant="outline" className="mt-5 rounded-full px-8 border-gray-200 text-gray-500 hover:bg-white" onClick={() => setSelectedCategory(null)}>
                  すべてのカテゴリーを表示
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Floating Toggle Button (Mobile) */}
      <div className="md:hidden fixed bottom-8 left-1/2 -translate-x-1/2 z-50">
        <Button 
          className="rounded-full px-8 bg-black text-white hover:bg-black/90 font-bold shadow-2xl h-14 border-none flex items-center gap-3 group transition-all active:scale-95"
          onClick={() => setView(view === "map" ? "list" : "map")}
        >
          {view === "map" ? (
            <>
              <Search className="h-5 w-5" />
              <span>リストを表示</span>
            </>
          ) : (
            <>
              <MapPin className="h-5 w-5" />
              <span>地図を表示</span>
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
