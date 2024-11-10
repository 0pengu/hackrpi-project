"use client";

import { LatLngTuple } from "leaflet";
import { ReactNode } from "react";
import { MapContainer } from "react-leaflet";

export default function MapProvider({
  children,
  center,
  zoom,
}: {
  children: ReactNode;
  center: LatLngTuple;
  zoom: number;
}) {
  return (
    <MapContainer center={center} zoom={zoom} scrollWheelZoom>
      {children}
    </MapContainer>
  );
}
