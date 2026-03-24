import React, { useState } from "react";
// Asumsi library icon yang kamu pakai adalah Lucide
import { SquarePen, ChevronDown, Rocket, Archive, Circle } from "lucide-react";

const EventStatusDropdown = ({ isInsideEvent }) => {
    const [status, setStatus] = useState("Draft");

    // Map configuration for each status
    const statusConfigs = {
        Draft: {
            label: "Draft",
            icon: <SquarePen size={16} />,
            color: "#A6784D", // Brownish
            bg: "#FFF9F2",
        },
        Published: {
            label: "Published",
            icon: <Rocket size={16} />,
            color: "#10b981", // Emerald Green
            bg: "#ecfdf5",
        },
        Archived: {
            label: "Archived",
            icon: <Archive size={16} />,
            color: "#ef4444", // Red
            bg: "#fef2f2",
        },
    };

    const current = statusConfigs[status];

    if (!isInsideEvent) return null;

    return (
        <>
            {/* Status Event */}
            <div className="dropdown">
                <div
                    className="event-status d-flex gap-2 align-items-center p-2 rounded-3 border"
                    style={{
                        cursor: "pointer",
                    }}
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                >
                    <SquarePen size={18} color="#A6784D" />
                    <p className="fw-semibold mb-0 fs-sm">{status}</p>
                    <ChevronDown className="ms-1" size={16} />
                </div>

                {/* Menu Dropdown */}
                <ul className="dropdown-menu dropdown-menu-end shadow-sm border-0 mt-2 pop-down">
                    <li>
                        <h6 className="dropdown-header text-uppercase fs-xs fw-semibold opacity-50 mb-1">
                            Change Status
                        </h6>
                    </li>

                    <li>
                        <button
                            className="dropdown-item d-flex align-items-center gap-2 py-2 text-primary"
                            onClick={() => setStatus("Draft")}
                        >
                            <SquarePen size={16} /> Draft
                        </button>
                    </li>
                    <li>
                        <button
                            className="dropdown-item d-flex align-items-center gap-2 py-2 text-primary"
                            onClick={() => setStatus("Published")}
                        >
                            <Rocket size={16} /> Publish
                        </button>
                    </li>

                    <li>
                        <button
                            className="dropdown-item d-flex align-items-center gap-2 py-2 text-danger"
                            onClick={() => setStatus("Archived")}
                        >
                            <Archive size={16} /> Archive
                        </button>
                    </li>
                </ul>
            </div>
        </>
    );
};

export default EventStatusDropdown;
