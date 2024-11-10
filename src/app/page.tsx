"use client";

import "./styles.css";
import Map from "./Maps";
import MapProvider from "@/components/map/map-provider";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { LatLng } from "leaflet";

export default function App() {
  const [start, setStart] = useState<LatLng>(new LatLng(40.847718, -73.821848));
  const [end, setEnd] = useState<LatLng>(new LatLng(40.844323, -73.821781));
  return (
    <div className="App">
      <MapProvider zoom={13} center={[40.71, -74.006]}>
        <Map start={start} end={end} />
      </MapProvider>
      <Button
        onClick={() =>
          setStart(
            new LatLng(
              40.684 + Math.random() * 0.01,
              -74.2 + Math.random() * 0.01
            )
          )
        }
      >
        Set Start
      </Button>
    </div>
  );
}
