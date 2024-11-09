import MapQuestDirections from "@/components/map/mapquest";

export default function Home() {
  return (
    <div className="w-[70vw] h-[70vh] flex">
      <MapQuestDirections
        zoom={3}
        from={{ lat: 40.847409, lng: -73.82146 }}
        to={{ lat: 40.829942, lng: -73.862229 }}
      />
    </div>
  );
}
