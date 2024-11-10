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

  const allPoints = [];

  useEffect(() => {
    const fetchNYCData = async () => {
      const fetchOptions = {
        method: "GET",
        headers: {
          "X-App-Token": import.meta.env.NYCOPENDATA_APP_TOKEN || "",
        },
      };

      // const query = "?$where=cmplnt_fr_dt >= '2024-09-29T00:00:00'";
      // const response = await fetch(
      //   `https://data.cityofnewyork.us/resource/5jvd-shfj.json${query}`,
      //   fetchOptions
      // );

      const fetchURLs = [
        'https://data.cityofnewyork.us/resource/bryy-vqd9.json', // protected intersxns
        'https://data.cityofnewyork.us/resource/k5k6-6jex.json', // pedestrian plazas
      ]

      const dataJsons = [];

      for (const url in fetchURLs){
        const res = await fetch(url, fetchOptions);
        if (!res.ok ) throw new Error("fetch failed");
        const data = await res.json();

        dataJsons.push(data);
      }

      for (const point of dataJsons[0]) {
        // console.log("Point:" , point.the_geom.coordinates[0]);
        // console.log("..", [point.the_geom.coordinates[0][0], point.the_geom.coordinates[0][1], 0.7]);
        // allPoints.push([point.latitude, point.longitude, 0.7]);

        // store as [lat, long, intensity]
        // except retrieve it as [long, lat]
        allPoints.push([point.the_geom.coordinates[0][1], point.the_geom.coordinates[0][0], 0.7])
      }
    };
    fetchNYCData();
  }, []);

  return (
    <>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Heatmap allPoints={allPoints} />
    </>
  );
}
