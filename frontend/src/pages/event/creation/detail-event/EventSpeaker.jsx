import React, { useState, useEffect, useCallback } from "react";
import EventLayout from "../../../../layouts/EventLayout";
import { Form, Collapse, Button } from "react-bootstrap";
import { Users } from "lucide-react";
import { useParams } from "react-router-dom";

import SpeakerForm from "./sections/event-speaker/SpeakerForm";
import SpeakerCard from "./sections/event-speaker/SpeakerCard";

import SectionPlaceholder from "../../../../components/form/SectionPlaceholder";

import api from "../../../../api/axios";
import { notify } from "../../../../utils/notify";

const EventSpeaker = () => {
    const { eventId } = useParams();
    const [errors, setErrors] = useState({});

    const [showAddForm, setShowAddForm] = useState(false);
    const [editingSpeakerId, setEditingSpeakerId] = useState(null);
    const [speakers, setSpeakers] = useState([]);

    // 1. Ekstrak fungsi fetch ke luar useEffect pakai useCallback
    // agar bisa dipanggil ulang setelah berhasil nge-save
    const fetchEventSpeakers = useCallback(async () => {
        if (!eventId) return;

        try {
            const response = await api.get(
                `event-dashboard/${eventId}/info-utama/speaker`,
            );
            const result = response.data;

            if (
                (result.status === "success" || result.success) &&
                result.data
            ) {
                setSpeakers(result.data);
            }
        } catch (error) {
            console.error("Gagal mengambil data speaker:", error);
            notify("error", "Terjadi kesalahan saat memuat data pembicara.");
        }
    }, [eventId]);

    useEffect(() => {
        fetchEventSpeakers();
    }, [fetchEventSpeakers]);

    const handleAddClick = () => {
        setEditingSpeakerId(null);
        setShowAddForm(true);
    };

    const handleEditClick = (speakerId) => {
        setShowAddForm(false);
        if (editingSpeakerId === speakerId) {
            setEditingSpeakerId(null);
        } else {
            setEditingSpeakerId(speakerId);
        }
    };

    const handleSaveSpeaker = (data) => {
        if (data.id) {
            // Update data lama
            setSpeakers(
                speakers.map((speaker) =>
                    speaker.id === data.id ? { ...speaker, ...data } : speaker,
                ),
            );
        } else {
            // 2. Gunakan flag 'temp_' untuk menandai data baru yang belum masuk DB
            const newSpeaker = { ...data, id: `temp_${Date.now()}` };
            setSpeakers([newSpeaker, ...speakers]);
        }

        setEditingSpeakerId(null);
        setShowAddForm(false);
    };

    const handleDeleteSpeaker = (idToDelete) => {
        const confirmDelete = window.confirm(
            "Apakah Anda yakin ingin menghapus speaker ini?",
        );
        if (confirmDelete) {
            setSpeakers(
                speakers.filter((speaker) => speaker.id !== idToDelete),
            );
            if (editingSpeakerId === idToDelete) setEditingSpeakerId(null);
        }
    };

    const handleSave = async () => {
        if (speakers.length === 0) {
            notify("error", "Wajib Diisi!", "Sebuah event setidaknya harus memiliki 1 pembicara (Speaker). Silakan tambah pembicara terlebih dahulu.");
            throw new Error("Speaker wajib diisi");
        }

        // Gunakan FormData agar bisa mengirim file gambar bersama data JSON
        const formData = new FormData();

        speakers.forEach((speaker, index) => {
            const cleanId =
                typeof speaker.id === "string" && speaker.id.startsWith("temp_")
                    ? ""
                    : speaker.id;

            formData.append(`speakers[${index}][id]`, cleanId || "");
            formData.append(`speakers[${index}][name]`, speaker.name || "");
            formData.append(`speakers[${index}][role]`, speaker.role || "");
            formData.append(`speakers[${index}][bio]`, speaker.bio || "");

            // Social links (array of objects)
            const socialLinks = speaker.social_link || [];
            socialLinks.forEach((link, linkIndex) => {
                formData.append(`speakers[${index}][social_link][${linkIndex}][platform]`, link.platform || "");
                formData.append(`speakers[${index}][social_link][${linkIndex}][url]`, link.url || "");
            });

            // Expertise
            const expertise = speaker.expertise || [];
            expertise.forEach((tag, tagIndex) => {
                formData.append(`speakers[${index}][expertise][${tagIndex}]`, typeof tag === 'string' ? tag : tag.label || tag.value || '');
            });

            // Sessions (array of IDs)
            const sessions = speaker.sessions
                ? speaker.sessions.map((s) => s.id || s.value || s)
                : [];
            sessions.forEach((sessionId, sessionIndex) => {
                formData.append(`speakers[${index}][sessions][${sessionIndex}]`, sessionId);
            });

            // Append image file jika ada (dari SpeakerForm via _imageFile)
            if (speaker._imageFile) {
                formData.append(`speakers_image_${index}`, speaker._imageFile);
            }
        });

        try {
            const response = await api.post(
                `event-dashboard/${eventId}/info-utama/speaker`,
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                },
            );

            notify(
                "success",
                "Berhasil!",
                "Data pembicara telah berhasil disimpan.",
            );

            // 4. Panggil ulang fetch untuk mendapatkan ID asli & relasi nama sesi dari DB
            fetchEventSpeakers();
        } catch (error) {
            const serverResponse = error.response?.data;
            const errorMsg =
                serverResponse?.message || "Terjadi kesalahan pada server.";

            if (serverResponse?.errors) {
                console.table(serverResponse.errors);
            }

            notify("error", "Gagal!", errorMsg);
            throw error;
        }
    };

    return (
        <EventLayout
            heading="Manajemen Pembicara & Narasumber *"
            subheading="Kelola profil pengisi acara dan hubungkan mereka dengan sesi yang relevan."
            nextPath={"formulir"}
            onSave={handleSave}
            prevPath={"sesi"}
            isFormDirty={showAddForm || editingSpeakerId !== null}
            formDirtyMessage="Terdapat form speaker yang belum disimpan atau dibatalkan. Harap selesaikan terlebih dahulu."
        >
            <Form>
                {speakers.length > 0 ? (
                    speakers.map((speaker) => (
                        <div key={speaker.id}>
                            <SpeakerCard
                                data={speaker}
                                onEdit={() => handleEditClick(speaker.id)}
                                onDelete={() => handleDeleteSpeaker(speaker.id)}
                            />

                            <Collapse in={editingSpeakerId === speaker.id}>
                                <div>
                                    {editingSpeakerId === speaker.id && (
                                        <div className="mb-4 ms-4 border-start border-primary border-3 ps-3">
                                            <SpeakerForm
                                                initialData={speaker}
                                                onSave={handleSaveSpeaker}
                                                onCancel={() =>
                                                    setEditingSpeakerId(null)
                                                }
                                                eventId={eventId}
                                            />
                                        </div>
                                    )}
                                </div>
                            </Collapse>
                        </div>
                    ))
                ) : (
                    <SectionPlaceholder
                        title="Belum ada pembicara"
                        subtitle="Klik tombol di bawah untuk menambahkan pembicara baru ke event ini."
                    />
                )}

                {showAddForm ? (
                    <Collapse in={showAddForm}>
                        <div>
                            <SpeakerForm
                                initialData={null}
                                onSave={handleSaveSpeaker}
                                onCancel={() => setShowAddForm(false)}
                                eventId={eventId}
                            />
                        </div>
                    </Collapse>
                ) : (
                    <Button
                        variant="outline-primary"
                        className="w-100 py-3 border-dashed"
                        onClick={handleAddClick}
                    >
                        + Tambah Speaker
                    </Button>
                )}
            </Form>
        </EventLayout>
    );
};

export default EventSpeaker;
