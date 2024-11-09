"use client";

import React, { useEffect } from "react";

/**
 * No types available for the MapQuest API
 */
declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    L: any;
  }
}

type GeoPoint = {
  lat: number;
  lng: number;
};

const API_MAPQUEST_KEY = process.env.NEXT_PUBLIC_MAPQUEST_API_KEY;
export default function MapQuestDirections({
  zoom,
  from,
  to,
}: {
  zoom: number;
  from: GeoPoint;
  to: GeoPoint;
}) {
  useEffect(() => {
    const css = document.createElement("link");

    css.rel = "stylesheet";

    css.href = "https://api.mqcdn.com/sdk/mapquest-js/v1.3.2/mapquest.css";

    document.body.appendChild(css);

    const script = document.createElement("script");

    script.src = "https://api.mqcdn.com/sdk/mapquest-js/v1.3.2/mapquest.js";
    script.addEventListener("load", () => {
      const leaftef = window.L;
      leaftef.mapquest.key = API_MAPQUEST_KEY;
      let baseLayer = leaftef.mapquest.tileLayer("map");
      let map = leaftef.mapquest.map("map", {
        center: [from.lat, from.lng],
        layers: baseLayer,
        zoom: zoom,
      });

      leaftef.mapquest.directions().route({
        start: [from.lat, from.lng],
        end: [to.lat, to.lng],
      });
    });

    document.body.appendChild(script);
  }, [from.lat, from.lng, to.lat, to.lng, zoom]);

  return (
    <div
      id="map"
      style={{ flex: 1, borderRadius: "16px", border: "1px solid #c4c4c4" }}
    ></div>
  );
}
