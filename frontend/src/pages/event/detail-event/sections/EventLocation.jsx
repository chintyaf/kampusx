import React from "react";
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Form, InputGroup } from "react-bootstrap";
import Select from "react-select";
import EventLayout from "../EventLayout";

import Step1_TypeSelection from "./schedule/Step1_TypeSelection"; // Level 1
import Step2_DetailLocation from "./schedule/Step2_DetailLocation"; // Level 2
import SchedulePlaceholder from "./schedule/SchedulePlaceholder";
import Step3_Schedule from "./schedule/Step3_Schedule";
import AlertMessage from "../../../../components/AlertMessage";

import api from "../../../../api/axios";
import { notify } from "../../../../utils/notify";

const EventLocation = () => {
    const { eventId } = useParams();

    const [selectedType, setSelectedType] = useState(null);

    const [formData, setFormData] = useState({
        type: "", // Nilainya: 'online', 'offline', atau 'hybrid'

        // Fields untuk Online
        platform: "",
        meeting_link: "", // Diubah dari 'link' agar sesuai DB
        onlineInstruction: "",

        // Fields untuk Offline
        location: "",
        locationDetail: "", // Diubah ke snake_case
        maps_url: "", // Sebaiknya diaktifkan karena ada di DB
        access_instruction: "", // Diubah ke snake_case

        // Pengaturan Kuota (Untuk Online, Offline, atau Hybrid)
        is_onlineQuotaUnlimited: false, // Diperbaiki penamaannya
        is_offllineQuoataUnlimited: false, // Diperbaiki typo: offllineQuoata
        onlineQuota: 0,
        offlineQuota: 0,
    });

    useEffect(() => {
        const fetchLocationData = async () => {
            try {
                const response = await api.get(
                    `event-dashboard/${eventId}/info-utama/set-location`,
                );

                const result = response.data;

                // Memastikan status sukses dan data tersedia
                if (result.status === "sucesss" && result.data) {
                    const data = result.data;

                    setSelectedType("online");
                    setFormData({
                        // Menggunakan ?? "" agar jika null/undefined, input tidak menjadi 'uncontrolled'
                        platform: data.platform ?? "",
                        link: data.meeting_link ?? "",
                        onlineInstruction: data.online_instruction ?? "",

                        // Fields untuk Offline (Jika API menyediakan, masukkan di sini)
                        location: data.location ?? "",
                        locationDetail: data.location_detail ?? "",
                        accessInstruction: data.access_instruction ?? "",

                        // Logika Quota: Jika null maka true (unlimited)
                        is_onlineQuotaUnlimited: data.online_quota === null,
                        is_offllineQuoataUnlimited: data.offline_quota === null,

                        // Jika ada nilainya pakai nilainya, kalau null jadi 0
                        onlineQuota: data.online_quota ?? 0,
                        offlineQuota: data.offline_quota ?? 0,
                    });
                    console.log(data);
                }
            } catch (error) {
                console.error("Gagal mengambil data event:", error);
            }
        };

        if (eventId) {
            fetchLocationData();
        }
    }, [eventId]);

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSave = async () => {
        let payload = {};

        if (selectedType === "online") {
            payload = {
                type: "online",
                platform: formData.platform,
                meeting_link: formData.link,
                online_instruction: formData.onlineInstruction,
                online_quota: formData.onlineQuota,
            };
        } else if (selectedType === "offline") {
            payload = {
                locationSummary: formData.locationSummary,
                venueName: formData.venueName,
                // ... field offline lainnya
            };
        } else {
            payload = formData; // Kirim semua jika hybrid
        }

        try {
            const response = await api.post(
                `event-dashboard/${eventId}/info-utama/set-location`,
                payload,
                {
                    headers: { "Content-Type": "multipart/form-data" },
                },
            );
            console.log("Sukses update:", response.data);
            notify(
                "success",
                "Berhasil!",
                "Perubahan informasi utama telah disimpan.",
            );
        } catch (error) {
            console.error("Gagal update data");
            throw error;
        }

        console.log("Data yang benar-benar dikirim ke DB:", payload);
    };

    return (
        <>
            <EventLayout
                heading="Konfigurasi Teknis & Jadwal Event"
                subheading="Atur mode kehadiran, lokasi, dan detail sesi acara dalam satu tempat."
                nextPath="agenda"
                onSave={handleSave}
            >
                <Step1_TypeSelection
                    selectedType={selectedType}
                    onSelectType={setSelectedType}
                />

                {selectedType ? (
                    <>
                        <Step2_DetailLocation
                            selectedType={selectedType}
                            formData={formData}
                            onChange={handleChange}
                        />
                        {/* <Step3_Schedule /> */}
                    </>
                ) : (
                    <SchedulePlaceholder />
                )}
            </EventLayout>
        </>
    );
};

export default EventLocation;
