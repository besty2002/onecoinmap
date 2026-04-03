"use client";

import { APIProvider, Map, AdvancedMarker, Pin } from "@vis.gl/react-google-maps";
import { useMemo } from "react";

interface SinglePlaceMapProps {
  lat: number;
  lng: number;
  name: string;
}

export function SinglePlaceMap({ lat, lng, name }: SinglePlaceMapProps) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";
  const center = useMemo(() => ({ lat, lng }), [lat, lng]);

  if (!apiKey) return <div className="w-full h-full bg-muted flex items-center justify-center text-xs text-muted-foreground">API Key Missing</div>;

  return (
    <APIProvider apiKey={apiKey}>
      <div className="w-full h-full rounded-xl overflow-hidden border border-gray-100 shadow-sm">
        <Map
          defaultCenter={center}
          defaultZoom={15}
          gestureHandling={'cooperative'}
          disableDefaultUI={true}
          mapId="DEMO_MAP_ID"
        >
          <AdvancedMarker position={center} title={name}>
            <Pin 
              background={"#f97316"}
              borderColor={"#b45309"}
              glyphColor={"#fff"}
            />
          </AdvancedMarker>
        </Map>
      </div>
    </APIProvider>
  );
}
