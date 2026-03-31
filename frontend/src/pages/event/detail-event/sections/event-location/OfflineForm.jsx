import React, { useState } from "react";
import { Form, Row, Col, Badge } from "react-bootstrap";
import { Map, Zap } from "lucide-react";
import OptionalBadge from "../../../../../components/form/OptionalBadge";

const OfflineForm = ({ data, onChange }) => {
    // const [mapUrl, setMapUrl] = useState("");

    // // Fungsi untuk mengubah URL Google Maps biasa menjadi format Embed
    // const getEmbedUrl = (inputUrl) => {
    //     if (!inputUrl) return "";

    //     // 1. Jika user sudah memasukkan link embed (mengandung /embed)
    //     if (inputUrl.includes("/embed")) {
    //         return inputUrl;
    //     }

    //     // 2. Jika user memasukkan link koordinat standar (@lat,long)
    //     // Contoh: .../@-6.89148,107.58958,17z...
    //     const regex = /@(-?\d+\.\d+),(-?\d+\.\d+)/;
    //     const match = inputUrl.match(regex);

    //     if (match) {
    //         const lat = match[1];
    //         const lng = match[2];
    //         // Gunakan API embed tanpa key (mode view/place)
    //         return `https://maps.google.com/maps?q=${lat},${lng}&z=15&output=embed`;
    //     }

    //     // 3. Fallback: Coba jadikan sebagai pencarian query
    //     return `https://maps.google.com/maps?q=${encodeURIComponent(inputUrl)}&output=embed`;
    // };

    // const embedUrl = getEmbedUrl(mapUrl);

    return (
        <>
            {/* Ringkasan Lokasi (Publik) */}
            <Form.Group controlId="formGridLocation" className="mb-4">
                <Form.Label className="">Ringkasan Lokasi</Form.Label>
                <Form.Control
                    type="text"
                    name="location"
                    value={data.location}
                    onChange={onChange}
                    placeholder="Contoh: Kampus Utama, Gedung Rektorat, atau Area Parkir Bawah"
                />
                <Form.Text className="text-muted d-block">
                    Nama lokasi singkat yang muncul di kartu event halaman
                    publik.
                </Form.Text>
            </Form.Group>

            {/* Detail Lokasi Spesifik (Pengganti Lantai & Ruangan) */}
            <Form.Group controlId="formLocationDetail" className="mb-4">
                <Form.Label className=" d-flex align-items-center">
                    Detail Lokasi Spesifik
                    <OptionalBadge />
                </Form.Label>
                <Form.Control
                    as="textarea"
                    name="locationDetail"
                    value={data.locationDetail}
                    rows={2}
                    onChange={onChange}
                    placeholder="Sebutkan detail seperti: Lantai 3A (Sarang Penyamun), Ruang R-301, atau Lab Komputer Sayap Kiri."
                    style={{ resize: "none" }}
                />
                <Form.Text className="text-muted">
                    Gunakan ini untuk menjelaskan letak ruangan/lantai secara
                    mendalam.
                </Form.Text>
            </Form.Group>

            {/* Google Maps */}
            {/* <Form.Group className="mb-4" controlId="formMaps">
                <Form.Label className="d-flex align-items-center justify-content-between">
                    <span>
                        URL Google Maps
                        <span className="text-secondary fw-normal small ms-1">
                            (Titik Koordinat)
                        </span>
                    </span>
                    <span className="text-muted small d-flex align-items-center gap-1">
                        <Zap size={14} className="text-warning" />
                        Paste Link Share
                    </span>
                </Form.Label>

                <div className="border rounded-3 overflow-hidden shadow-sm">
                    <Form.Control
                        type="text"
                        placeholder="Contoh: https://www.google.com/maps/place/..."
                        className="border-0 border-bottom rounded-0 py-2"
                        value={mapUrl}
                        onChange={(e) => setMapUrl(e.target.value)}
                    />

                    <div
                        className="bg-light d-flex flex-column align-items-center justify-content-center text-muted"
                        style={{ minHeight: "250px" }}
                    >
                        {embedUrl && mapUrl ? (
                            <iframe
                                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3961.0123... (link panjang kamu)"
                                width="100%" // Pakai 100% supaya responsif di dalam kontainer Form kamu
                                height="450"
                                style={{ border: 0 }} // Format objek untuk React
                                allowFullScreen="" // CamelCase
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade" // CamelCase
                            ></iframe>
                        ) : (
                            <>
                                <Map
                                    size={32}
                                    strokeWidth={1}
                                    className="mb-2 opacity-50"
                                />
                                <p className="small mb-0">
                                    Preview peta akan tampil otomatis.
                                </p>
                            </>
                        )}
                    </div>
                </div>
            </Form.Group> */}

            {/* 5. Instruksi Akses */}
            <Form.Group className="mb-4" controlId="formAccessInstruction">
                <Form.Label className="">
                    Instruksi Akses & Parkir <OptionalBadge />
                </Form.Label>
                <Form.Control
                    as="textarea"
                    name="accessInstruction"
                    value={data.accessInstruction}
                    rows={3}
                    onChange={onChange}
                    placeholder="Contoh: Parkir di Basement P2 (Area Keramat). Masuk via Lobby Selatan, naik lift, lalu ikuti jejak penderitaan mahasiswa semester akhir."
                />
            </Form.Group>

            <Form.Group className="mb-4">
                <Form.Label className="fw-bold">Batas Kuota</Form.Label>

                <Row className="align-items-center g-3">
                    <Col xs={8} sm={9}>
                        <Form.Control
                            name="offlineQuota"
                            type="number"
                            value={data.offlineQuota || ""}
                            onChange={onChange}
                            disabled={data.is_offllineQuoataUnlimited}
                            placeholder="0"
                            min="1"
                        />
                    </Col>

                    <Col xs={4} sm={3}>
                        <Form.Check
                            type="checkbox"
                            id="is_offllineQuoataUnlimited"
                            name="is_offllineQuoataUnlimited"
                            checked={data.is_offllineQuoataUnlimited || false}
                            onChange={(e) => {
                                onChange({
                                    target: {
                                        name: "is_offllineQuoataUnlimited",
                                        value: e.target.checked,
                                    },
                                });

                                // Kosongkan input angka jika checkbox dicentang
                                if (e.target.checked) {
                                    onChange({
                                        target: {
                                            name: "offlineQuota",
                                            value: "",
                                        },
                                    });
                                }
                            }}
                            label="Unlimited"
                            className="mb-0"
                        />
                    </Col>
                </Row>
            </Form.Group>
        </>
    );
};

export default OfflineForm;
