import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
// import { Form, InputGroup } from "react-bootstrap"; // Unused in this snippet
// import Select from "react-select"; // Unused in this snippet
import EventLayout from "../../../layouts/EventLayout";
import Step1_TypeSelection from "./sections/event-location/Step1_TypeSelection";
import Step2_DetailLocation from "./sections/event-location/Step2_DetailLocation";
import api from "../../../api/axios";
import { notify } from "../../../utils/notify";

const EventLocation = () => {
    const { eventId } = useParams();
    const [errors, setErrors] = useState({});
    const [selectedType, setSelectedType] = useState(null);

    const [formData, setFormData] = useState({
        type: "",
        platform: "",
        meeting_link: "",
        online_instruction: "",
        location: "",
        location_detail: "",
        maps_url: "",
        offline_instruction: "",
        is_online_quota_unlimited: false,
        is_offline_quota_unlimited: false,
        online_quota: 0,
        offline_quota: 0,
    });

    const hasFetched = useRef(false);

    useEffect(() => {
        if (hasFetched.current) return;

        const fetchLocationData = async () => {
            try {
                const response = await api.get(
                    `event-dashboard/${eventId}/info-utama/set-location`,
                );
                const result = response.data;

                if (result.status === "success" && result.data) {
                    const data = result.data;

                    setSelectedType(data.type);

                    // FIX: Ensure these keys match the formData state exactly!
                    setFormData({
                        type: data.type ?? "",
                        platform: data.platform ?? "",
                        meeting_link: data.meetingLink ?? "",
                        online_instruction: data.onlineInstruction ?? "",
                        location: data.location ?? "",
                        location_detail: data.locationDetail ?? "",
                        maps_url: data.mapsUrl ?? "",
                        offline_instruction: data.offlineInstruction ?? "",
                        is_online_quota_unlimited: data.onlineQuota === null,
                        is_offline_quota_unlimited: data.offlineQuota === null,
                        online_quota: data.onlineQuota ?? 0,
                        offline_quota: data.offlineQuota ?? 0,
                    });

                    hasFetched.current = true;
                }
            } catch (error) {
                console.error("Gagal mengambil data event:", error);
            }
        };

        if (eventId && !hasFetched.current) {
            fetchLocationData();
        }
    }, [eventId]);

    const handleChange = (e) => {
        const value =
            e.target.type === "checkbox" ? e.target.checked : e.target.value;
        const { name } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSave = async () => {
        setErrors({});

        // FIX: Cleaner payload mapping based on selectedType
        let payload = {
            type: selectedType,
            is_online_quota_unlimited: formData.is_online_quota_unlimited,
            is_offline_quota_unlimited: formData.is_offline_quota_unlimited,
            online_quota: formData.online_quota,
            offline_quota: formData.offline_quota,
        };

        if (selectedType === "online" || selectedType === "hybrid") {
            payload.platform = formData.platform;
            payload.meeting_link = formData.meeting_link;
            payload.online_instruction = formData.online_instruction;
        }

        if (selectedType === "offline" || selectedType === "hybrid") {
            payload.location = formData.location;
            payload.location_detail = formData.location_detail;
            payload.maps_url = formData.maps_url;
            payload.offline_instruction = formData.offline_instruction;
        }

        try {
            await api.post(
                `event-dashboard/${eventId}/info-utama/set-location`,
                payload,
                {
                    headers: {
                        "Content-Type": "application/json",
                        Accept: "application/json",
                    },
                },
            );

            notify(
                "success",
                "Berhasil!",
                "Perubahan informasi utama telah disimpan.",
            );
        } catch (error) {
            if (error.response && error.response.status === 422) {
                setErrors(error.response.data.errors);
            } else {
                const errorMsg = error.response?.data?.message || error.message;
                notify("error", "Sistem Error!", errorMsg);
            }
            throw error;
        }
    };

    return (
        <EventLayout
            heading="Konfigurasi Teknis & Jadwal Event"
            subheading="Atur mode kehadiran, lokasi, dan detail sesi acara dalam satu tempat."
            nextPath="sesi"
            prevPath="info"
            onSave={handleSave}
        >
            <Step1_TypeSelection
                selectedType={selectedType}
                onSelectType={setSelectedType}
            />

            {selectedType ? (
                <Step2_DetailLocation
                    selectedType={selectedType}
                    formData={formData}
                    onChange={handleChange}
                    errors={errors}
                />
            ) : (
                <div className="flex items-center justify-center min-h-[300px] w-full p-6">
                    <div
                        className="p-5 w-full max-w-4xl text-center"
                        style={{
                            border: "1.5px #d2d7df dashed",
                            backgroundColor: "#ffffff61",
                        }}
                    >
                        <h2 className="fs-5 font-medium text-gray-600">
                            Pilih tipe kehadiran di atas untuk melanjutkan
                        </h2>
                    </div>
                </div>
            )}
        </EventLayout>
    );
};

export default EventLocation;
