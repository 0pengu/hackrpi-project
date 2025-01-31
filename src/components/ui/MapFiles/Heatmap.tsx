import { useEffect } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet.heat";

const heatLayerConfig = {
  radius: 15,
  blur: 15,
  maxZoom: 10,
  max: 1.0,
  gradient: {
    0.4: "rgb(60, 140, 255)", // More Defined Blue
    0.6: "rgb(90, 255, 90)", // More Defined Lime
    0.8: "rgb(255, 240, 70)", // More Defined Yellow
    1.0: "rgb(255, 80, 90)", // More Defined Red
  },
};

const Heatmap = ({ allPoints }: { allPoints: Array<L.HeatLatLngTuple> }) => {
  const map = useMap();

  useEffect(() => {
    L.heatLayer(allPoints, heatLayerConfig).addTo(map);
  }, [allPoints, map]);

  return null;
};

export default Heatmap;
