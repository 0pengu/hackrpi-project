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
  const [allPoints, setAllPoints] = useState<L.HeatLatLngTuple[]>([]);
  const [dataLoaded, setDataLoaded] = useState(false);

  // /**
  //  * Manhattan, mainly
  //  */
  // useEffect(() => {
  //   const fetchHighData = async () => {
  //     const response = await fetch(
  //       "https://data.cityofnewyork.us/resource/bryy-vqd9.json"
  //     );

  //     if (!response.ok) {
  //       console.error("Failed to fetch data");
  //       return;
  //     }

  //     /**
  //      * Typed what is needed from the response
  //      */
  //     const data = (await response.json()) as {
  //       the_geom: { coordinates: number[][] };
  //     }[];

  //     data.forEach((point) => {
  //       setAllPoints((prev) => [
  //         ...prev,
  //         [
  //           point.the_geom.coordinates[0][1],
  //           point.the_geom.coordinates[0][0],
  //           0.7,
  //         ],
  //       ]);
  //     });
  //   };

  //   fetchHighData();
  // }, []);

  // useEffect(() => {
  //   const fetchMediumData = async () => {
  //     const response = await fetch(
  //       "https://data.cityofnewyork.us/resource/k5k6-6jex.json"
  //     );

  //     if (!response.ok) {
  //       console.error("Failed to fetch data");
  //       return;
  //     }

  //     const data = (await response.json()) as {
  //       the_geom: { coordinates: number[][][][] };
  //     }[];

  //     data.forEach((outerArray) => {
  //       const flattenedPoints = outerArray.the_geom.coordinates
  //         .flat(2) // Flatten up to 4 levels
  //         .map((point) => [point[1], point[0], 0.7]);

  //       flattenedPoints.forEach((point) => {
  //         setAllPoints((prev) => [...prev, [point[0], point[1], 0.4]]);
  //       });
  //     });
  //   };

  //   fetchMediumData();
  // }, []);

  useEffect(() => {
    const fetchLowData = async () => {
      const response = await fetch("/api/locations");

      if (!response.ok) {
        console.error("Failed to fetch data");
        return;
      }

      const data = (await response.json()) as {
        features: { geometry: { coordinates: number[] } }[];
      };

      data.features.forEach((point) => {
        setAllPoints((prev) => [
          ...prev,
          [point.geometry.coordinates[1], point.geometry.coordinates[0], 0.7],
        ]);
      });
    };
    fetchLowData();
    setDataLoaded(true);
  }, []);

  useEffect(() => {
    if (!map && !dataLoaded) return;

    // @ts-expect-error - No typings for this
    const graphHopper = new L.Routing.graphHopper(
      import.meta.env.VITE_GRAPH_HOPPER_API_KEY || "",
      {
        avoid: allPoints,
      }
    );

    const control = L.Routing.control({
      routeWhileDragging: false,
      showAlternatives: true,
      alternativeClassName: "opacity-50",
      router: graphHopper,
      altLineOptions: {
        extendToWaypoints: false,
        styles: [{ color: "red", opacity: 0.5, weight: 4 }],
        missingRouteTolerance: 10,
      },
      fitSelectedRoutes: true,
      lineOptions: {
        addWaypoints: false,
        extendToWaypoints: true,
        missingRouteTolerance: 10,
      },
      // @ts-expect-error - No typings for this
      geocoder: new L.Control.Geocoder.nominatim(),
    });

    control.addTo(map);

    return () => {
      map.removeControl(control);
    };
  }, [map, allPoints, dataLoaded]);

  return (
    <>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {/* <Marker position={markerPos}>
        <Popup>This is a popup</Popup>
        </Marker> */}
      <Heatmap allPoints={allPoints} />
    </>
  );
}
