import { useEffect } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet.heat";

const Heatmap = ({
  allPoints,
}: {
  allPoints: Array<L.LatLng | L.HeatLatLngTuple>;
}) => {
  const map = useMap();

  const heatLayerConfig = {
    radius: 15,
    blur: 15,
    maxZoom: 10,
    max: 1.0,
    gradient: {
      0.4: "blue",
      0.6: "lime",
      0.8: "yellow",
      1.0: "red",
    },
  };
  useEffect(() => {
    L.heatLayer(allPoints, heatLayerConfig).addTo(map);
  }, []);

  return null;
};

export default Heatmap;
