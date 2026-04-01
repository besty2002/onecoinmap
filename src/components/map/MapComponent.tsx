"use client";

import { useEffect, useState } from "react";
import { APIProvider, Map, AdvancedMarker, Pin, InfoWindow } from "@vis.gl/react-google-maps";
import { Button } from "@/components/ui/button";
import { Navigation } from "lucide-react";

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
};

interface MapComponentProps {
  places: PlaceMarker[];
  onMarkerClick?: (placeId: string) => void;
}

export function MapComponent({ places, onMarkerClick }: MapComponentProps) {
  const [center, setCenter] = useState(DEFAULT_CENTER);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [selectedPlace, setSelectedPlace] = useState<PlaceMarker | null>(null);

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";

  useEffect(() => {
    // 1. 현재 위치 가져오기 시도
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const pos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setUserLocation(pos);
          setCenter(pos);
        },
        () => {
          console.log("Error getting location. Using default center.");
        }
      );
    }
  }, []);

  const handleGetCurrentLocation = () => {
    if (userLocation) {
      setCenter(userLocation);
    } else {
      alert("현재 위치를 가져올 수 없습니다. 브라우저 설정을 확인해주세요.");
    }
  };

  if (!apiKey) {
    return (
      <div className="flex flex-col items-center justify-center p-6 text-center h-full w-full bg-muted/30">
        <p className="text-muted-foreground mb-4">Google Maps API キーが設定されていません</p>
        <p className="text-sm text-muted-foreground">.env.local を確認してください</p>
      </div>
    );
  }

  // 임시: places에 좌표가 없는 경우(mock 데이터) 더미 위경도 부여
  const markersWithCoords = places.map((p, i) => ({
    ...p,
    lat: p.lat || DEFAULT_CENTER.lat + (Math.random() - 0.5) * 0.01,
    lng: p.lng || DEFAULT_CENTER.lng + (Math.random() - 0.5) * 0.01,
  }));

  return (
    <APIProvider apiKey={apiKey}>
      <div className="relative w-full h-full">
        <Map
          style={{ width: '100%', height: '100%' }}
          center={center}
          zoom={15}
          mapId="DEMO_MAP_ID" // Advanced markers require a valid Map ID or a demo ID
          disableDefaultUI={true} // Clean UI
          gestureHandling="greedy"
          onCenterChanged={(ev) => setCenter(ev.detail.center)}
        >
          {/* 사용자 현재 위치 마커 (파란 점) */}
          {userLocation && (
            <AdvancedMarker position={userLocation}>
              <div className="w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-md animate-pulse" />
            </AdvancedMarker>
          )}

          {/* 식당 마커 찍기 */}
          {markersWithCoords.map((place) => (
            <AdvancedMarker
              key={place.id}
              position={{ lat: place.lat, lng: place.lng }}
              onClick={() => {
                setSelectedPlace(place);
                if (onMarkerClick) onMarkerClick(place.id);
              }}
            >
              <Pin 
                background={selectedPlace?.id === place.id ? "#f97316" : "#fbbf24"} // 주황-노랑
                borderColor={"#b45309"}
                glyphColor={"#fff"}
              />
            </AdvancedMarker>
          ))}

          {/* 선택한 마커의 InfoWindow */}
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

        {/* 현재 위치로 돌아가는 플로팅 버튼 */}
        <Button 
          variant="secondary" 
          size="icon" 
          className="absolute bottom-6 right-6 z-10 rounded-full shadow-lg border bg-background"
          onClick={handleGetCurrentLocation}
        >
          <Navigation className="h-5 w-5 text-primary" />
        </Button>
      </div>
    </APIProvider>
  );
}
