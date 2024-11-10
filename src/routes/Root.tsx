import { LatLng } from "leaflet";
import Map from "../components/ui/MapFiles/Map";
import "./Root.css";

export default function RootPage() {
  return (
    <div>
      <Map
        start={new LatLng(40.847718, -73.821848)}
        end={new LatLng(40.844323, -73.821781)}
      />
    </div>
  );
}
