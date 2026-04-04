// LocationSummary.jsx
import React from "react";
import { Card } from "react-bootstrap";
import { MapPin } from "lucide-react";

const LocationSummary = ({ locationData }) => (
    <Card
        className="border-0 mb-3 shadow-sm"
        style={{
            backgroundColor: "var(--color-white)",
            borderLeft: `4px solid var(--color-primary)`,
        }}
    >
        <Card.Body className="p-3">
            <h6
                className="mb-2 fw-bold d-flex align-items-center gap-2"
                style={{
                    color: "var(--color-primary)",
                    fontSize: "var(--font-md)",
                }}
            >
                <MapPin size={18} /> Lokasi Telah Diset:
            </h6>
            <p
                className="mb-1"
                style={{
                    fontSize: "var(--font-md)",
                    color: "var(--color-text)",
                }}
            >
                <strong>
                    {locationData.location_name || "(Tanpa Nama Lokasi)"}
                </strong>
            </p>
            <p
                className="mb-1"
                style={{
                    fontSize: "var(--font-sm)",
                    color: "var(--color-text-muted)",
                }}
            >
                {[
                    locationData.address_detail,
                    locationData.district,
                    locationData.city,
                ]
                    .filter(Boolean)
                    .join(", ")}
            </p>
            <p
                className="mb-2"
                style={{
                    fontSize: "var(--font-sm)",
                    color: "var(--color-text-muted)",
                }}
            >
                {locationData.province}, {locationData.country}
            </p>
            <div
                className="p-2 rounded font-monospace d-inline-block"
                style={{
                    fontSize: "var(--font-xs)",
                    backgroundColor: "var(--color-bg)",
                    border: `1px solid var(--color-border-mid)`,
                    color: "var(--color-secondary)",
                }}
            >
                Lat: {locationData.latitude} | Lng: {locationData.longitude}
            </div>
        </Card.Body>
    </Card>
);

export default LocationSummary;
