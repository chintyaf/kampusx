import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import L from "leaflet";

import CAMPUS_DATA from "../../../../assets/data/campus_data.json"; // Simulasi data kampus dari file JSON lokal
// Perbaikan bug ikon marker Leaflet yang sering tidak muncul di React
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
let DefaultIcon = L.icon({
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

// 2. Fungsi Haversine untuk hitung jarak
const getDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius bumi dalam KM
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * (Math.PI / 180)) *
            Math.cos(lat2 * (Math.PI / 180)) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Hasil dalam KM
};

// Komponen bantuan untuk memindahkan posisi peta secara otomatis
function RecenterMap({ lat, lng }) {
    const map = useMap();
    useEffect(() => {
        if (lat && lng) {
            map.setView([lat, lng], 16); // Zoom level 16
        }
    }, [lat, lng, map]);
    return null;
}

const EventLocationTest = () => {
    const [searchQuery, setSearchQuery] = useState("");
    const [suggestions, setSuggestions] = useState([]);
    const [isTyping, setIsTyping] = useState(false);
    const [nearbyCampuses, setNearbyCampuses] = useState([]);

    // State utama koordinat (Default: Maranatha)
    const [locationData, setLocationData] = useState({
        location_name: "Universitas Kristen Maranatha",
        country: "Indonesia",
        province: "Jawa Barat",
        city: "Bandung",
        district: "Sukajadi",
        latitude: -6.887,
        longitude: 107.581,
    });

    // 3. Efek untuk menghitung kampus terdekat setiap kali koordinat berubah
    useEffect(() => {
        if (locationData.latitude && locationData.longitude) {
            const calculated = CAMPUS_DATA.map((campus) => {
                return {
                    ...campus,
                    distance: getDistance(
                        locationData.latitude,
                        locationData.longitude,
                        campus.lat,
                        campus.lng,
                    ),
                };
            })
                // Filter hanya yang radiusnya < 5km dan urutkan dari yang terdekat
                .filter((campus) => campus.distance <= 5)
                .sort((a, b) => a.distance - b.distance);

            setNearbyCampuses(calculated);
        }
    }, [locationData.latitude, locationData.longitude]);

    // Logika Debounce Pencarian
    useEffect(() => {
        if (searchQuery.length < 3) {
            setSuggestions([]);
            return;
        }
        setIsTyping(true);
        const delayDebounceFn = setTimeout(async () => {
            try {
                const response = await fetch(
                    `https://nominatim.openstreetmap.org/search?format=json&q=${searchQuery}&addressdetails=1&limit=5`,
                );
                const data = await response.json();
                setSuggestions(data);
            } catch (error) {
                console.error(error);
            } finally {
                setIsTyping(false);
            }
        }, 500);
        return () => clearTimeout(delayDebounceFn);
    }, [searchQuery]);

    const handleSelectSuggestion = (place) => {
        const addr = place.address;
        setLocationData({
            location_name: place.name || searchQuery,
            country: addr.country || "Indonesia",
            province: addr.state || "",
            city: addr.city || addr.regency || addr.town || "",
            district: addr.suburb || addr.village || "",
            latitude: parseFloat(place.lat),
            longitude: parseFloat(place.lon),
        });
        setSearchQuery(place.display_name);
        setSuggestions([]);
    };

    return (
        <div
            style={{
                padding: "20px",
                maxWidth: "800px",
                margin: "0 auto",
                fontFamily: "sans-serif",
            }}
        >
            <h2>Set Lokasi Event KampusX</h2>

            {/* Search Input */}
            <div style={{ position: "relative", marginBottom: "10px" }}>
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Cari tempat (Cth: Paris Van Java)"
                    style={{
                        width: "100%",
                        padding: "12px",
                        borderRadius: "5px",
                        border: "1px solid #ccc",
                    }}
                />
                {isTyping && <small>Mencari...</small>}

                {/* Suggestion Dropdown */}
                {suggestions.length > 0 && (
                    <ul
                        style={{
                            position: "absolute",
                            zIndex: 1000,
                            background: "white",
                            width: "100%",
                            border: "1px solid #ddd",
                            listStyle: "none",
                            padding: 0,
                        }}
                    >
                        {suggestions.map((p, i) => (
                            <li
                                key={i}
                                onClick={() => handleSelectSuggestion(p)}
                                style={{
                                    padding: "10px",
                                    cursor: "pointer",
                                    borderBottom: "1px solid #eee",
                                }}
                            >
                                {p.display_name}
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {/* 🗺️ PETA VISUAL 🗺️ */}
            <div
                style={{
                    height: "400px",
                    width: "100%",
                    marginBottom: "20px",
                    borderRadius: "10px",
                    overflow: "hidden",
                    border: "2px solid #eee",
                }}
            >
                <MapContainer
                    center={[locationData.latitude, locationData.longitude]}
                    zoom={16}
                    style={{ height: "100%", width: "100%" }}
                >
                    <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution="&copy; OpenStreetMap contributors"
                    />
                    {/* Komponen untuk pindah fokus peta */}
                    <RecenterMap
                        lat={locationData.latitude}
                        lng={locationData.longitude}
                    />

                    <Marker
                        position={[
                            locationData.latitude,
                            locationData.longitude,
                        ]}
                    ></Marker>
                </MapContainer>
            </div>

            {/* Info Panel untuk dikirim ke Laravel */}
            <div
                style={{
                    background: "#f4f4f4",
                    padding: "15px",
                    borderRadius: "8px",
                }}
            >
                <h4>Detail Lokasi Terpilih:</h4>
                <p>
                    📍 {locationData.location_name} ({locationData.district},{" "}
                    {locationData.city})
                </p>
                <p>
                    🌏 {locationData.country}, {locationData.province}
                </p>
                <code>
                    Lat: {locationData.latitude}, Lng: {locationData.longitude}
                </code>
            </div>

            {/* 🏫 LIST KAMPUS TERDEKAT 🏫 */}
            <div
                style={{
                    marginTop: "20px",
                    padding: "15px",
                    border: "1px solid #4CAF50",
                    borderRadius: "8px",
                    background: "#e8f5e9",
                }}
            >
                <h4 style={{ marginTop: 0, color: "#2e7d32" }}>
                    🎓 Terdeteksi Dekat Kampus:
                </h4>
                {nearbyCampuses.length > 0 ? (
                    <ul style={{ paddingLeft: "20px" }}>
                        {nearbyCampuses.map((campus) => (
                            <li key={campus.id} style={{ marginBottom: "5px" }}>
                                <strong>{campus.name}</strong>
                                <span
                                    style={{ color: "#666", fontSize: "0.9em" }}
                                >
                                    ({campus.distance.toFixed(2)} km dari
                                    lokasi)
                                </span>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p style={{ color: "#666", fontSize: "0.9em" }}>
                        Tidak ada kampus dalam radius 5km.
                    </p>
                )}
                <small>
                    *Event ini akan otomatis muncul di feed mahasiswa kampus di
                    atas.
                </small>
            </div>
        </div>
    );
};

export default EventLocationTest;
