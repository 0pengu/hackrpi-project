import { useEffect } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";

const Route = ({ source, destination }) => {
  const map = useMap();

  console.log("Route SRC: ", source, " DESTINATION:", destination);
  const routeConfig = {
    color: "blue",
    weight: 3,
    opacity: 0.5,
    smoothFactor: 1,
  };

  useEffect(() => {
    const fetchRoute = async () => {
      const response = await fetch(
        `https://router.project-osrm.org/route/v1/driving/${source[1]},${source[0]};${destination[1]},${destination[0]}?overview=full`
      );
      const data = await response.json();
      const coordinates = data.waypoints?.map((waypoint) => [
        waypoint.location[1],
        waypoint.location[0],
      ]);
      console.log("coordinates", coordinates);

      if (!L) {
        console.log("lskfjs");
      } else {
        L.polyline(coordinates, routeConfig).addTo(map);
      }
    };

    fetchRoute();
  }, [source, destination, map]);

  return null;
};

export default Route;
