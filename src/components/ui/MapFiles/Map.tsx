"use client";

import L, { LatLng, LatLngTuple } from "leaflet";
import "leaflet-routing-machine";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";
import "@/lib/lrm-graphhopper";
import { useEffect } from "react";
import { MapContainer, TileLayer, useMap } from "react-leaflet";
import Heatmap from "@/components/ui/MapFiles/Heatmap";
import Route from "@/components/ui/MapFiles/Route";

export default function Map({ start, end }: { start: LatLng; end: LatLng }) {
  const center: LatLngTuple = [40.71, -74.006];
  const zoom = 13;

  return (
    <MapContainer center={center} zoom={zoom} scrollWheelZoom>
      <MapChild start={start} end={end} />
    </MapContainer>
  );
}

function MapChild({ start, end }: { start: LatLng; end: LatLng }) {
  const map = useMap();

  useEffect(() => {
    if (!map) return;

    L.Routing.control({
      waypoints: [start, end],
      routeWhileDragging: false,
      showAlternatives: false,
      // @ts-expect-error - No types for graphHopper
      router: new L.Routing.graphHopper(
        import.meta.env.VITE_GRAPH_HOPPER_API_KEY || ""
      ),
    }).addTo(map);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  let allCrimePoints = [];

  useEffect(() => {
    const fetchNYCCrime = async () => {
      const fetchOptions = {
        method: "GET",
        headers: {
          "X-App-Token": import.meta.env.NYCOPENDATA_APP_TOKEN || "",
        },
      };

      const query = "?$where=cmplnt_fr_dt >= '2024-09-29T00:00:00'";
      const response = await fetch(
        `https://data.cityofnewyork.us/resource/5jvd-shfj.json${query}`,
        fetchOptions
      );

      if (!response.ok) throw new Error("fetch failed");
      const data = await response.json();

      for (const crime of data) {
        allCrimePoints.push([crime.latitude, crime.longitude, 0.7]);
      }
    };
    fetchNYCCrime();
  }, []);

  return (
    <>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {/* <Marker position={markerPos}>
        <Popup>This is a popup</Popup>
        </Marker> */}
      {allCrimePoints.map((point, index) => (
        <Route key={index} source={start} destination={point.slice(0, 2)} />
      ))}
      <Heatmap allPoints={allCrimePoints} />
    </>
  );
}
