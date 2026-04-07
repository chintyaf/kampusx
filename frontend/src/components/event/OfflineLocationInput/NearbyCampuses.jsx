// NearbyCampuses.jsx
import React, { useState, useEffect } from "react";
import { ListGroup, Alert, Badge, Button, Collapse } from "react-bootstrap";
import { GraduationCap, ChevronDown, ChevronUp } from "lucide-react";
import { getDistance } from "./geoUtils";

// Sesuaikan path import ini sesuai struktur aslimu
import CAMPUS_DATA from "../../../assets/data/campus_data.json";

const NearbyCampuses = ({ locationData, isLocationSelected }) => {
    const [nearbyCampuses, setNearbyCampuses] = useState([]);
    const [showCampuses, setShowCampuses] = useState(false);

    useEffect(() => {
        if (!isLocationSelected) return setNearbyCampuses([]);
        const calculated = CAMPUS_DATA.map((campus) => ({
            ...campus,
            distance: getDistance(
                locationData.latitude,
                locationData.longitude,
                campus.lat,
                campus.lng,
            ),
        }))
            .filter((c) => c.distance <= 5)
            .sort((a, b) => a.distance - b.distance);

        setNearbyCampuses(calculated);
        setShowCampuses(false);
    }, [locationData.latitude, locationData.longitude, isLocationSelected]);

    if (!isLocationSelected) return null;

    return (
        <div className="mb-3">
            <div className="d-flex align-items-center justify-content-between mb-2">
                <span
                    style={{
                        fontSize: "var(--font-sm)",
                        color: "var(--color-text-muted)",
                    }}
                >
                    {nearbyCampuses.length > 0
                        ? `Terdeteksi ${nearbyCampuses.length} kampus dalam radius 5km.`
                        : "Tidak ada kampus terdekat terdeteksi."}
                </span>
                {nearbyCampuses.length > 0 && (
                    <Button
                        variant="light"
                        size="sm"
                        onClick={() => setShowCampuses(!showCampuses)}
                        className="d-flex align-items-center gap-1 rounded-pill px-3 shadow-sm"
                        style={{
                            color: "var(--color-primary)",
                            border: `1px solid var(--color-border)`,
                            fontSize: "var(--font-sm)",
                            backgroundColor: "var(--color-white)",
                        }}
                    >
                        <GraduationCap size={16} />{" "}
                        {showCampuses ? "Sembunyikan" : "Lihat Kampus"}{" "}
                        {showCampuses ? (
                            <ChevronUp size={16} />
                        ) : (
                            <ChevronDown size={16} />
                        )}
                    </Button>
                )}
            </div>
            <Collapse in={showCampuses}>
                <div>
                    <Alert
                        className="mb-0 shadow-sm mt-2"
                        style={{
                            backgroundColor: "var(--bahama-blue-50)",
                            border: `1px solid var(--bahama-blue-200)`,
                        }}
                    >
                        <ListGroup variant="flush" className="bg-transparent">
                            {nearbyCampuses.map((campus) => (
                                <ListGroup.Item
                                    key={campus.id}
                                    className="bg-transparent border-0 px-0 py-1 d-flex align-items-center justify-content-between"
                                >
                                    <span
                                        style={{
                                            fontSize: "var(--font-sm)",
                                            color: "var(--color-text)",
                                            fontWeight: "500",
                                        }}
                                    >
                                        {campus.name}
                                    </span>
                                    <Badge
                                        pill
                                        style={{
                                            backgroundColor:
                                                "var(--bahama-blue-500)",
                                            fontWeight: "normal",
                                            fontSize: "var(--font-xs)",
                                        }}
                                    >
                                        {campus.distance.toFixed(2)} km
                                    </Badge>
                                </ListGroup.Item>
                            ))}
                        </ListGroup>
                    </Alert>
                </div>
            </Collapse>
        </div>
    );
};

export default NearbyCampuses;
