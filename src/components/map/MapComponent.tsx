"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
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

  const handleGetCurrentLocation = useCallback(() => {
    if (userLocation) {
      setCenter(userLocation);
    } else {
      alert("현재 위치를 가져올 수 없습니다. 브라우저 설정을 확인해주세요.");
    }
  }, [userLocation]);

  const handleMarkerClick = useCallback((place: PlaceMarker) => {
    setSelectedPlace(place);
    if (onMarkerClick) onMarkerClick(place.id);
  }, [onMarkerClick]);

  const handleMapCenterChange = useCallback((ev: any) => {
    setCenter(ev.detail.center);
  }, []);

  // 마커 데이터 메모이제이션 (Math.random 루프 방지)
  const markersWithCoords = useMemo(() => {
    return places.map((p) => ({
      ...p,
      lat: p.lat || DEFAULT_CENTER.lat + (Math.random() - 0.5) * 0.01,
      lng: p.lng || DEFAULT_CENTER.lng + (Math.random() - 0.5) * 0.01,
    }));
  }, [places]);

  if (!apiKey) {
    return (
      <div className="flex flex-col items-center justify-center p-6 text-center h-full w-full bg-muted/30">
        <p className="text-muted-foreground mb-4">Google Maps API キー가 설정되어 있지 않습니다</p>
        <p className="text-sm text-muted-foreground">.env.local 파일을 확인해주세요</p>
      </div>
    );
  }

  return (
    <APIProvider apiKey={apiKey}>
      <div className="relative w-full h-full">
        <Map
          style={{ width: '100%', height: '100%' }}
          center={center}
          zoom={15}
          mapId="DEMO_MAP_ID"
          disableDefaultUI={true}
          gestureHandling="greedy"
          onCenterChanged={handleMapCenterChange}
        >
          {userLocation && (
            <AdvancedMarker position={userLocation}>
              <div className="w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-md animate-pulse" />
            </AdvancedMarker>
          )}

          {markersWithCoords.map((place) => (
            <AdvancedMarker
              key={place.id}
              position={{ lat: place.lat!, lng: place.lng! }}
              onClick={() => handleMarkerClick(place)}
            >
              <Pin 
                background={selectedPlace?.id === place.id ? "#f97316" : "#fbbf24"}
                borderColor={"#b45309"}
                glyphColor={"#fff"}
              />
            </AdvancedMarker>
          ))}

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
          className="absolute bottom-6 right-6 z-10 rounded-full shadow-lg border bg-background transition-transform active:scale-95 touch-manipulation"
          onClick={handleGetCurrentLocation}
        >
          <Navigation className="h-5 w-5 text-primary" />
        </Button>
      </div>
    </APIProvider>
  );
}
