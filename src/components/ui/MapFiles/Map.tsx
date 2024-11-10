"use client";

import Heatmap from "@/components/ui/MapFiles/Heatmap";
import L, { LatLngTuple } from "leaflet";
import "leaflet-control-geocoder";
import "leaflet-routing-machine";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";
import "@/lib/lrm-graphhopper";
import { useEffect, useState } from "react";
import { MapContainer, TileLayer, useMap } from "react-leaflet";

export default function Map() {
  const center: LatLngTuple = [40.71, -74.006];
  const zoom = 13;

  return (
    <MapContainer center={center} zoom={zoom} scrollWheelZoom>
      <MapChild />
    </MapContainer>
  );
}

function MapChild() {
  const map = useMap();
  const [allCrimePoints, setAllCrimePoints] = useState<L.HeatLatLngTuple[]>([]);
  const [dataLoaded, setDataLoaded] = useState(false);

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
        if (crime.latitude && crime.longitude) {
          setAllCrimePoints((prev) => [
            ...prev,
            [Number(crime.latitude), Number(crime.longitude), 0.7],
          ]);
        }
      }

      setDataLoaded(true);
    };

    fetchNYCCrime();
  }, []);

  useEffect(() => {
    if (!map && !dataLoaded) return;

    // @ts-expect-error - No typings for this
    const graphHopper = new L.Routing.graphHopper(
      import.meta.env.VITE_GRAPH_HOPPER_API_KEY || "",
      {
        avoid: allCrimePoints,
      }
    );

    const control = L.Routing.control({
      routeWhileDragging: false,
      showAlternatives: true,
      router: graphHopper,
      // @ts-expect-error - No typings for this
      geocoder: new L.Control.Geocoder.nominatim(),
    });

    control.addTo(map);

    return () => {
      map.removeControl(control);
    };
  }, [map, allCrimePoints, dataLoaded]);

  return (
    <>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {/* <Marker position={markerPos}>
        <Popup>This is a popup</Popup>
        </Marker> */}
      <Heatmap allPoints={allCrimePoints} />
    </>
  );
}
