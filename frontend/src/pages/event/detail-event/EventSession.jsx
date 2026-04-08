import { useState, useEffect } from "react";
import { Form, Card, Row, Col } from "react-bootstrap";
import { useParams } from "react-router-dom";

import ScheduleTable from "./sections/event-session/ScheduleTable";
import EventLayout from "../../../layouts/EventLayout";
import SessionDateForm from "./sections/event-session/SessionDateForm";

import api from "../../../api/axios";
import { notify } from "../../../utils/notify";

const EventAgenda = () => {
    const { eventId } = useParams();
    const [errors, setErrors] = useState({});

    const [sessions, setSessions] = useState([]);
    const [totalDays, setTotalDays] = useState(1);

    const [formData, setFormData] = useState({
        timezone: "",
        startDate: "",
        endDate: "",
    });

    useEffect(() => {
        const fetchEventSession = async () => {
            try {
                const response = await api.get(
                    `event-dashboard/${eventId}/info-utama/session`,
                );
                const result = response.data;

                if (result.status === "success" && result.data) {
                    const data = result.data;

                    setFormData({
                        timezone: data.timezone || "",
                        startDate: data.startDate || "",
                        endDate: data.endDate || "",
                    });

                    setSessions(data.sessions || []);

                    // Calculate total days initially when data loads
                    if (data.startDate && data.endDate) {
                        const diffDays =
                            Math.ceil(
                                (new Date(data.endDate) -
                                    new Date(data.startDate)) /
                                    86400000,
                            ) + 1;
                        setTotalDays(diffDays > 0 ? diffDays : 1);
                    }
                }
            } catch (error) {
                // Fixed: Added error parameter here
                console.error("Gagal mengambil data event:", error);
            }
        };

        if (eventId) {
            fetchEventSession();
        }
    }, [eventId]);

    const handleSave = async () => {
        const payload = {
            ...formData,
            sessions: sessions,
        };

        try {
            const response = await api.post(
                `event-dashboard/${eventId}/info-utama/session`,
                payload,
            );
            console.log("Sukses update:", response.data);
            notify(
                "success",
                "Berhasil!",
                "Perubahan informasi utama telah disimpan.",
            );
        } catch (error) {
            const serverResponse = error.response?.data;
            const errorMsg =
                serverResponse?.message || "Terjadi kesalahan pada server.";

            if (serverResponse?.errors) {
                console.table(serverResponse.errors);
            }

            notify("error", "Gagal!", errorMsg);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    // --- RETURN PAGE
    return (
        <EventLayout
            heading="Schedule Breakdown"
            subheading="Susun jadwal detail per hari dan sesi menggunakan matriks waktu"
            onSave={handleSave}
            nextPath={"pembicara"}
            prevPath={"tempat"}
        >
            <Form>
                <SessionDateForm
                    formData={formData}
                    totalDays={totalDays}
                    onSetTotalDays={setTotalDays}
                    onChange={handleChange}
                />
            </Form>

            <Form className="mt-4">
                <ScheduleTable
                    sessions={sessions}
                    setSessions={setSessions}
                    totalDays={totalDays}
                />
            </Form>
        </EventLayout>
    );
};

export default EventAgenda;
