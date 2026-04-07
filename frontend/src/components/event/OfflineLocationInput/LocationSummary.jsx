// LocationSummary.jsx
import React from "react";
import { Card } from "react-bootstrap";
import { MapPin } from "lucide-react";

const LocationSummary = ({ locationData }) => (
    <Card
        className="mb-3 border-0" // Hapus border standar Bootstrap
        style={{
            backgroundColor: "var(--color-bg-2)",
            boxShadow: `0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)`,
            // 2. Border samping yang sangat kontras
            borderLeft: `12px solid var(--color-primary)`,
            // 3. Tambahkan border halus di sisi lain agar tetap terdefinisi
            outline: `1px solid var(--color-border)`,
            borderRadius: "16px",
            overflow: "hidden",
            transition: "transform 0.2s ease-in-out", // Efek saat hover
        }}
    >
        <Card.Body className="p-4">
            {" "}
            {/* Padding diperbesar agar tidak sesak */}
            <div className="d-flex justify-content-between align-items-start mb-3">
                <h6
                    className="mb-0 fw-bold d-flex align-items-center gap-2"
                    style={{
                        color: "var(--color-primary)",
                        fontSize: "var(--font-md)",
                        letterSpacing: "0.5px",
                        textTransform: "uppercase", // Membuat label lebih tegas
                    }}
                >
                    <MapPin size={20} weight="fill" /> Lokasi Terpilih
                </h6>

                {/* Badge Status (Opsional, untuk menambah estetika) */}
                <span
                    className="badge rounded-pill"
                    style={{
                        backgroundColor: "var(--color-primary)",
                        fontSize: "10px",
                        opacity: 0.8,
                    }}
                >
                    DATA VALID
                </span>
            </div>
            <div className="mb-3">
                <h5
                    className="mb-1 fw-bold"
                    style={{
                        fontSize: "1.2rem",
                        color: "var(--color-text)",
                    }}
                >
                    {locationData.location_name || "(Tanpa Nama Lokasi)"}
                </h5>
                <p
                    className="mb-0"
                    style={{
                        fontSize: "var(--font-sm)",
                        color: "var(--color-text-muted)",
                        lineHeight: "1.5",
                    }}
                >
                    {[
                        locationData.address_detail,
                        locationData.district,
                        locationData.city,
                    ]
                        .filter(Boolean)
                        .join(", ")}
                    <br />
                    <span className="fw-medium">
                        {locationData.province}, {locationData.country}
                    </span>
                </p>
            </div>
            <div
                className="p-2 px-3 rounded-3 d-flex align-items-center gap-2"
                style={{
                    fontSize: "var(--font-xs)",
                    backgroundColor: "rgba(var(--color-primary-rgb), 0.1)", // Background transparan dari warna primary
                    border: `1px dashed var(--color-primary)`,
                    color: "var(--color-primary)",
                    fontFamily: "monospace",
                }}
            >
                <div className="opacity-75">
                    <span className="fw-bold">LAT:</span>{" "}
                    {locationData.latitude}
                </div>
                <div className="vr mx-1"></div> {/* Garis vertikal pemisah */}
                <div className="opacity-75">
                    <span className="fw-bold">LNG:</span>{" "}
                    {locationData.longitude}
                </div>
            </div>
        </Card.Body>
    </Card>
);

export default LocationSummary;
