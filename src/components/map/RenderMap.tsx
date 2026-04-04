"use client";

import dynamic from "next/dynamic";

const SinglePlaceMap = dynamic(() => import("./SinglePlaceMap").then(mod => mod.SinglePlaceMap), {
  ssr: false,
  loading: () => <div className="w-full h-full bg-gray-100 animate-pulse flex items-center justify-center text-gray-400">Loading Map...</div>,
});

interface RenderMapProps {
  lat: number;
  lng: number;
  name: string;
}

export function RenderMap({ lat, lng, name }: RenderMapProps) {
  return <SinglePlaceMap lat={lat} lng={lng} name={name} />;
}
