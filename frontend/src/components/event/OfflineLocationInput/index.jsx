// index.jsx
import React, { useState, useEffect } from "react";
import { Form, Button, Alert } from "react-bootstrap";
import { MapPin, Edit3, Search, Info } from "lucide-react";

// Import sub-komponen
import LocationSearch from "./LocationSearch";
import ManualLocationForm from "./ManualLocationForm";
import MapVisualizer from "./MapVisualizer";
import LocationSummary from "./LocationSummary";
import NearbyCampuses from "./NearbyCampuses";

const OfflineLocationInput = ({ data }) => {
    const [isManualMode, setIsManualMode] = useState(false);
    const [locationData, setLocationData] = useState({
        location_name: "",
        address_detail: "",
        country: "",
        province: "",
        city: "",
        district: "",
        latitude: null,
        longitude: null,
    });

    useEffect(() => {
        if (data) {
            setLocationData({
                location_name: data.location_name,
                address_detail: data.address_detail,
                country: data.country,
                province: data.province,
                city: data.city,
                district: data.district,
                latitude: data.latitude,
                longitude: data.longitude,
            });
        }
    }, [data]);
    const isLocationSelected =
        locationData.latitude !== null && locationData.longitude !== null;

    return (
        <div className="mb-4">
            {/* Header & Toggle Mode */}
            <div className="d-flex justify-content-between align-items-center mb-3">
                <Form.Label className="d-flex align-items-center gap-2 mb-0 fw-bold">
                    Tentukan Titik Lokasi Peta
                </Form.Label>
                <Button
                    variant="link"
                    className="p-0 text-decoration-none d-flex align-items-center gap-1"
                    onClick={() => setIsManualMode(!isManualMode)}
                    style={{
                        fontSize: "var(--font-sm)",
                        color: "var(--color-primary)",
                        fontWeight: "500",
                    }}
                >
                    {isManualMode ? (
                        <>
                            <Search size={16} /> Kembali ke Pencarian
                        </>
                    ) : (
                        <>
                            <Edit3 size={16} /> Tidak ketemu? Isi Manual
                        </>
                    )}
                </Button>
            </div>

            {/* Input Section (Auto / Manual) */}
            {!isManualMode ? (
                // Jika data sudah ada (Edit Mode)
                <LocationSearch
                    setLocationData={setLocationData}
                    initialValue={locationData.address_detail}
                />
            ) : (
                <ManualLocationForm
                    locationData={locationData}
                    setLocationData={setLocationData}
                />
            )}

            {/* Map Section */}
            <MapVisualizer
                locationData={locationData}
                setLocationData={setLocationData}
                isManualMode={isManualMode}
                isLocationSelected={isLocationSelected}
            />

            {/* Result Display Section */}
            {!isLocationSelected ? (
                <Alert
                    className="mb-3 d-flex align-items-center gap-3 bg-transparent"
                    style={{ border: `1px dashed var(--color-secondary)` }}
                >
                    <Info
                        size={24}
                        style={{ color: "var(--color-secondary)" }}
                        className="flex-shrink-0"
                    />
                    <div>
                        <h6
                            className="mb-1 fw-bold"
                            style={{
                                fontSize: "var(--font-md)",
                                color: "var(--color-text)",
                            }}
                        >
                            Belum ada lokasi yang dipilih
                        </h6>
                        <span
                            style={{
                                fontSize: "var(--font-sm)",
                                color: "var(--color-text-muted)",
                            }}
                        >
                            Silakan cari lokasi menggunakan kolom pencarian di
                            atas, atau aktifkan fitur{" "}
                            <strong style={{ color: "var(--color-text)" }}>
                                Isi Manual
                            </strong>{" "}
                            untuk menandai titik di peta.
                        </span>
                    </div>
                </Alert>
            ) : (
                <>
                    <LocationSummary locationData={locationData} />
                    <NearbyCampuses
                        locationData={locationData}
                        isLocationSelected={isLocationSelected}
                    />
                </>
            )}
        </div>
    );
};

export default OfflineLocationInput;
