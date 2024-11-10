"use client"

import React , {useEffect}from "react";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import {LatLngTuple} from "leaflet"
import Route from "./Route";
import Heatmap from './Heatmap'
import {addressPoints } from './addressPoints'

export default function Map() {

    const allCrimePoints = [];


    const center:LatLngTuple = [40.71, -74.006];
    const zoom = 13
    const markerPos:LatLngTuple = center;

    const start = center;

    useEffect(() => {
        const fetchNYCCrime = async () => {
            const fetchOptions = {
                method: 'GET',
                headers: {
                    'X-App-Token': process.env.NYCOPENDATA_APP_TOKEN || "",
                },
            }

            const query = "?$where=cmplnt_fr_dt >= '2024-09-29T00:00:00'"
            const response = await fetch(
                `https://data.cityofnewyork.us/resource/5jvd-shfj.json${query}`,
                fetchOptions
            );

            if (!response.ok ) throw new Error("fetch failed");
            const data = await response.json();

            for (const crime of data){
                allCrimePoints.push([crime.latitude, crime.longitude, 0.7]);
            }
        }
        fetchNYCCrime();
    }, [])

    return (
        <MapContainer center={center} zoom={zoom} scrollWheelZoom>
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={markerPos}>
                <Popup>
                    This is a popup
                </Popup>
            </Marker>
            {/* for some reason cannot make a route to any point in allCrimePoints, reading undefined ? */}
            {/*<Route source={start} destination={allCrimePoints[5]?.slice(0,2)} />*/}
            {/*{allCrimePoints.map((point, index) => (<Route key={index} source={start} destination={point.slice(0,2)} />))}*/}
            <Heatmap allPoints={allCrimePoints}/>
        </MapContainer>
    );
}