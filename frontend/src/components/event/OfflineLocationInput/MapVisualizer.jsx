// MapVisualizer.jsx
import React, { useEffect, useRef, useMemo } from "react";
import {
    MapContainer,
    TileLayer,
    Marker,
    useMap,
    useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

// Setup default Leaflet icon
let DefaultIcon = L.icon({
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

const MapVisualizer = ({
    locationData,
    setLocationData,
    isManualMode,
    isLocationSelected,
}) => {
    const defaultCenter = [-6.914744, 107.60981];
    const markerRef = useRef(null);

    const MapEvents = () => {
        const map = useMap();
        useEffect(() => {
            if (isLocationSelected)
                map.flyTo([locationData.latitude, locationData.longitude], 16);
        }, [locationData.latitude, locationData.longitude, map]);

        useMapEvents({
            click(e) {
                if (isManualMode) {
                    setLocationData((prev) => ({
                        ...prev,
                        latitude: parseFloat(e.latlng.lat.toFixed(6)),
                        longitude: parseFloat(e.latlng.lng.toFixed(6)),
                    }));
                }
            },
        });
        return null;
    };

    const dragHandlers = useMemo(
        () => ({
            dragend() {
                const marker = markerRef.current;
                if (marker) {
                    const pos = marker.getLatLng();
                    setLocationData((prev) => ({
                        ...prev,
                        latitude: parseFloat(pos.lat.toFixed(6)),
                        longitude: parseFloat(pos.lng.toFixed(6)),
                    }));
                }
            },
        }),
        [setLocationData],
    );

    return (
        <div
            className={`rounded-3 overflow-hidden mb-3 ${isManualMode ? "shadow" : "shadow-sm"}`}
            style={{
                height: "400px",
                zIndex: 0,
                border: `2px solid ${isManualMode ? "var(--color-primary)" : "var(--color-border)"}`,
            }}
        >
            <MapContainer
                center={
                    isLocationSelected
                        ? [locationData.latitude, locationData.longitude]
                        : defaultCenter
                }
                zoom={isLocationSelected ? 16 : 13}
                style={{
                    height: "100%",
                    width: "100%",
                    zIndex: 1,
                    cursor: isManualMode ? "crosshair" : "grab",
                }}
            >
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution="&copy; OpenStreetMap"
                />
                <MapEvents />
                {isLocationSelected && (
                    <Marker
                        draggable={isManualMode}
                        eventHandlers={dragHandlers}
                        position={[
                            locationData.latitude,
                            locationData.longitude,
                        ]}
                        ref={markerRef}
                    />
                )}
            </MapContainer>
        </div>
    );
};

export default MapVisualizer;
