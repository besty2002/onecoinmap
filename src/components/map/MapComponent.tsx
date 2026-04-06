"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { APIProvider, Map, AdvancedMarker, InfoWindow, useMap } from "@vis.gl/react-google-maps";
import { Button } from "@/components/ui/button";
import { Navigation, Utensils, UtensilsCrossed, Flame, LayoutGrid, Croissant, Globe, Soup, Drumstick, Pizza, Beef, Box, Leaf, Coffee, CircleEllipsis } from "lucide-react";

// 기본 도쿄/시부야 위치 (fallback)
const DEFAULT_CENTER = { lat: 35.6580, lng: 139.7016 };

type PlaceMarker = {
  id: string;
  name: string;
  lat?: number;
  lng?: number;
  price: string;
  category: string;
  address: string;
  source_type?: 'admin' | 'user';
};

interface MapComponentProps {
  places: PlaceMarker[];
  onMarkerClick?: (placeId: string) => void;
}

const getCategoryIcon = (category: string) => {
  switch (category) {
    case "お弁当":
    case "도시락": return <Box className="w-3 h-3" />;
    case "ラーメン・麺":
    case "면요리": return <Soup className="w-3 h-3" />;
    case "牛丼・カレー":
    case "카레": return <CircleEllipsis className="w-3 h-3" />;
    case "定食・和食":
    case "일식": return <Utensils className="w-3 h-3" />;
    case "中華料理":
    case "중식": return <UtensilsCrossed className="w-3 h-3" />;
    case "韓国料理":
    case "한식": return <Flame className="w-3 h-3" />;
    case "洋食・パスタ":
    case "양식": return <Croissant className="w-3 h-3" />;
    case "バーガー":
    case "버거": return <CircleEllipsis className="w-3 h-3" />;
    case "チキン":
    case "치킨": return <Drumstick className="w-3 h-3" />;
    case "ピザ":
    case "피자": return <Pizza className="w-3 h-3" />;
    case "焼肉・丼":
    case "고기/구이": return <Beef className="w-3 h-3" />;
    case "サラダ":
    case "샐러드": return <Leaf className="w-3 h-3" />;
    case "カフェ":
    case "카페": return <Coffee className="w-3 h-3" />;
    case "アジアン":
    case "아시안": return <Globe className="w-3 h-3" />;
    case "惣菜・パン":
    case "반찬": return <LayoutGrid className="w-3 h-3" />;
    default: return <Utensils className="w-3 h-3" />;
  }
};

function InnerMap({ places, onMarkerClick }: MapComponentProps) {
  const map = useMap();
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [selectedPlace, setSelectedPlace] = useState<PlaceMarker | null>(null);

  // 현재 위치 획득
  useEffect(() => {
    if (navigator.geolocation && !userLocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const pos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setUserLocation(pos);
          if (map) {
             map.panTo(pos);
          }
        },
        () => {
          console.log("Error getting location. Using default center.");
        }
      );
    }
  }, [map, userLocation]);

  const handleGetCurrentLocation = useCallback(() => {
    if (userLocation && map) {
      map.setZoom(15);
      map.panTo(userLocation);
    } else {
      alert("現在地を取得できません。ブラウザの設定を確認してください。");
    }
  }, [userLocation, map]);

  const handleMarkerClick = useCallback((place: PlaceMarker) => {
    setSelectedPlace(place);
    if (onMarkerClick) onMarkerClick(place.id);
  }, [onMarkerClick]);

  // 마커 데이터 메모이제이션 (Math.random 루프 방지 및 렌더링 떨림 해결)
  const markersWithCoords = useMemo(() => {
    return places.map((p) => {
      let hash = 0;
      if (p.id) {
        for (let i = 0; i < p.id.length; i++) {
          hash = p.id.charCodeAt(i) + ((hash << 5) - hash);
        }
      }
      // 같은 ID라면 항상 동일한 위치 보장 (0~1 사이)
      const pseudoRandom1 = Math.abs(Math.sin(hash)) || 0.5;
      const pseudoRandom2 = Math.abs(Math.cos(hash)) || 0.5;

      return {
        ...p,
        lat: p.lat || DEFAULT_CENTER.lat + (pseudoRandom1 - 0.5) * 0.01,
        lng: p.lng || DEFAULT_CENTER.lng + (pseudoRandom2 - 0.5) * 0.01,
      };
    });
  }, [places]);

  return (
    <div className="relative w-full h-full">
      <Map
        style={{ width: '100%', height: '100%' }}
        defaultCenter={DEFAULT_CENTER}
        defaultZoom={15}
        mapId="DEMO_MAP_ID"
        disableDefaultUI={true}
        gestureHandling="auto"
      >
        {userLocation && (
          <AdvancedMarker position={userLocation}>
            <div className="w-6 h-6 flex items-center justify-center bg-blue-500/20 rounded-full animate-pulse border border-blue-500/50">
              <div className="w-3 h-3 bg-blue-600 rounded-full border-2 border-white shadow-xl" />
            </div>
          </AdvancedMarker>
        )}

        {markersWithCoords.map((place) => {
          const hasPrice = place.price && place.price !== "null" && place.price !== "0" && place.price !== "";
          const displayPrice = hasPrice 
            ? (place.price.includes("円") ? place.price.replace("円", "") : place.price)
            : "情報なし";

          return (
            <AdvancedMarker
              key={place.id}
              position={{ lat: place.lat!, lng: place.lng! }}
              onClick={() => handleMarkerClick(place)}
            >
              <div className={`relative flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border-2 shadow-xl transition-all duration-200 hover:scale-110 active:scale-95 ${
                selectedPlace?.id === place.id 
                  ? "bg-black border-black text-white z-50 translate-y-[-4px]" 
                  : place.source_type === 'admin'
                    ? "bg-blue-600 border-blue-600 text-white"
                    : "bg-white border-orange-500 text-gray-900"
              }`}>
                <div className={`${selectedPlace?.id === place.id ? "text-orange-400" : place.source_type === 'admin' ? "text-white" : "text-orange-500"}`}>
                  {getCategoryIcon(place.category)}
                </div>
                <span className={`text-[11px] font-black whitespace-nowrap tracking-tighter ${!hasPrice ? "text-[9px] opacity-70" : ""}`}>
                  {displayPrice}{hasPrice ? "円" : ""}
                </span>
                
                {/* 🚀 말풍선 꼬리 */}
                <div className={`absolute bottom-[-6px] left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] ${
                  selectedPlace?.id === place.id ? "border-t-black" : place.source_type === 'admin' ? "border-t-blue-600" : "border-t-orange-500"
                }`} />
              </div>
            </AdvancedMarker>
          );
        })}

        {selectedPlace && selectedPlace.lat !== undefined && selectedPlace.lng !== undefined && (
          <InfoWindow
            position={{ lat: selectedPlace.lat, lng: selectedPlace.lng }}
            onCloseClick={() => setSelectedPlace(null)}
            headerContent={<strong className="pr-4">{selectedPlace.name}</strong>}
          >
            <div className="p-1 min-w-32">
              <p className="text-sm font-bold text-primary">{selectedPlace.price}</p>
              <p className="text-xs text-muted-foreground mt-1">{selectedPlace.category}</p>
            </div>
          </InfoWindow>
        )}
      </Map>

      <Button 
        variant="secondary" 
        size="icon" 
        className="absolute bottom-6 right-6 z-10 w-12 h-12 rounded-full shadow-lg border-2 border-white bg-white/90 backdrop-blur-md transition-transform active:scale-95 hover:bg-gray-50 flex items-center justify-center touch-manipulation"
        onClick={handleGetCurrentLocation}
        title="現在地を取得"
      >
        <Navigation className="h-6 w-6 text-blue-600" />
      </Button>
    </div>
  );
}

export function MapComponent({ places, onMarkerClick }: MapComponentProps) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";

  if (!apiKey) {
    return (
      <div className="flex flex-col items-center justify-center p-6 text-center h-full w-full bg-muted/30">
        <p className="text-muted-foreground mb-4">Google Maps API キーが設定されていません。</p>
        <p className="text-sm text-muted-foreground">.env.local ファイルを確認してください。</p>
      </div>
    );
  }

  return (
    <APIProvider apiKey={apiKey}>
      <InnerMap places={places} onMarkerClick={onMarkerClick} />
    </APIProvider>
  );
}
