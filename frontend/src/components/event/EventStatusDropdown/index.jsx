import React, { useState } from "react";
import PublishModal from "./PublishModal";
import ConfirmationModal from "./ConfirmationModal";
import StatusDropdown from "./StatusDropdown";
import "./modal.css";

const EventStatusDropdown = ({ isInsideEvent }) => {
    const [status, setStatus] = useState("Draft");

    const [showPublishModal, setShowPublishModal] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);

    const [pendingStatus, setPendingStatus] = useState("");
    const [slug, setSlug] = useState("");

    // contoh data sessions
    const sessions = [
        { name: "Sesi A", speaker: "" },
        { name: "Sesi B", speaker: "John Doe" },
    ];

    if (!isInsideEvent) return null;

    const handleSelectStatus = (newStatus) => {
        setPendingStatus(newStatus);

        if (newStatus === "Published") {
            setShowPublishModal(true);
        } else {
            setShowConfirmModal(true);
        }
    };

    const handleConfirmStatus = () => {
        setStatus(pendingStatus);
        setShowConfirmModal(false);
    };

    const handlePublish = () => {
        setStatus("Published");
        setShowPublishModal(false);
    };

    return (
        <>
            <StatusDropdown
                status={status}
                handleSelectStatus={handleSelectStatus}
            />

            <ConfirmationModal
                show={showConfirmModal}
                onClose={() => setShowConfirmModal(false)}
                onConfirm={handleConfirmStatus}
                pendingStatus={pendingStatus}
            />

            <PublishModal
                show={showPublishModal}
                onClose={() => setShowPublishModal(false)}
                onConfirm={handlePublish}
                slug={slug}
                setSlug={setSlug}
                sessions={sessions}
            />
        </>
    );
};

export default EventStatusDropdown;
