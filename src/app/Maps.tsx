"use client"

import React from "react";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import {LatLngTuple} from "leaflet"
import Route from "./Route";

export default function Map() {

    const center:LatLngTuple = [40.71, -74.006];
    const zoom = 13
    const markerPos:LatLngTuple = center;

    const start = [40.684, -74.2];
    const end = [40.71, -74.006];





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
            <Route source={start} destination={end} />
        </MapContainer>
    );
}