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

  // useEffect(() => {
  //   if (!map) return;
  //
  //   L.Routing.control({
  //     waypoints: [start, end],
  //     routeWhileDragging: false,
  //     showAlternatives: false,
  //     // @ts-expect-error - No types for graphHopper
  //     router: new L.Routing.graphHopper(
  //       import.meta.env.VITE_GRAPH_HOPPER_API_KEY || ""
  //     ),
  //   }).addTo(map);
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, []);

  const allPoints = []; // each element is [lat, long, intensity]
  // const allPolygons = []; // each element is a LatLngBound

  useEffect(() => {
    const fetchNYCData = async () => {
      const fetchOptions = {
        method: "GET",
        headers: {
          "X-App-Token": import.meta.env.NYCOPENDATA_APP_TOKEN || "",
        },
      };

      // Protected intersxns (high bias), return multipoint
      const response = await fetch('https://data.cityofnewyork.us/resource/bryy-vqd9.json', fetchOptions);

      if (!response.ok) throw new Error("fetch failed");
      const datum = await response.json();

      for (const point of datum) {
        // store as [lat, long, intensity]
        // except retrieve it as [long, lat]
        allPoints.push([point.the_geom.coordinates[0][1], point.the_geom.coordinates[0][0], 0.7])
      }

      // Plazas (medium bias), return multipoly
      const res = await fetch('https://data.cityofnewyork.us/resource/k5k6-6jex.json', fetchOptions);
      if (!res.ok) throw new Error("fetch failed");
      const data = await res.json();

      for (const f of data) {
        console.log("Point:" , f.the_geom.coordinates.flat(Infinity)); // lol
        // Now each f is an array of points, pairs of long and lat for a single point (retrieved long, lat)
        const bruh = f.the_geom.coordinates.flat(Infinity);
        for (let i = 0; i < bruh.length-1; i+=2){
          // console.log("Pushing this: ", [bruh[i+1], bruh[i], 0.1]);
          allPoints.push([bruh[i+1], bruh[i], 0.4]);
        }
      }

      // Points of interest (low bias), return singular point
      const RES = await fetch('https://data.cityofnewyork.us/resource/t95h-5fsr.json', fetchOptions);
      if (!RES.ok) throw new Error("fetched failed");
      const DATA = await RES.json();
      for (const POINT of DATA){
        console.log("POINT: ", POINT.the_geom.coordinates); // long, lat
        allPoints.push([POINT.the_geom.coordinates[1], POINT.the_geom.coordinates[0], 0.1]);
      }


    };
    fetchNYCData();
  }, []);

  // useEffect(() => {
  //   if (!map && !dataLoaded) return;
  //
  //   // @ts-expect-error - No typings for this
  //   const graphHopper = new L.Routing.graphHopper(
  //     import.meta.env.VITE_GRAPH_HOPPER_API_KEY || "",
  //     {
  //       avoid: allCrimePoints,
  //     }
  //   );
  //
  //   const control = L.Routing.control({
  //     routeWhileDragging: false,
  //     showAlternatives: true,
  //     router: graphHopper,
  //     // @ts-expect-error - No typings for this
  //     geocoder: new L.Control.Geocoder.nominatim(),
  //   });
  //
  //   control.addTo(map);
  //
  //   return () => {
  //     map.removeControl(control);
  //   };
  // }, [map, allCrimePoints, dataLoaded]);

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
