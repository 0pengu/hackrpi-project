"use client";

import L from "leaflet";
import "leaflet-routing-machine";
// import "@/lib/old-lrm-graphhopper";
import "@/lib/lrm-graphhopper";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";
import { useEffect } from "react";
import { Marker, Popup, TileLayer, useMap } from "react-leaflet";
import Route from "./Route";
import { LatLng } from "leaflet";

export default function Map({ start, end }: { start: LatLng; end: LatLng }) {
  const map = useMap();

  useEffect(() => {
    if (!map) return;

    const controls = L.Routing.control({
      waypoints: [start, end],
      routeWhileDragging: false,
      showAlternatives: false,
      // @ts-expect-error - GraphHopper is not in the typings
      router: L.Routing.graphHopper(
        process.env.NEXT_PUBLIC_GRAPH_HOPPER_API_KEY
      ),
    });

    controls.addTo(map);
  });
  const center = [40.71, -74.006];
  const markerPos = center;

  return (
    <>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={markerPos}>
        <Popup>This is a popup</Popup>
      </Marker>
      <Route source={start} destination={end} />
    </>
  );
}
