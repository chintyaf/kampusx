import { Form } from "react-bootstrap";
import { CheckCircle2 } from "lucide-react";
import OnlineForm from "./OnlineForm";
import OfflineForm from "./OfflineForm";
import HybridForm from "./HybridForm";
import { useState } from "react";

const Step2_DetailLocation = ({ selectedType, formData, onChange, errors }) => {
    return (
        <Form className="fade-in-down" key={selectedType}>
            {/* Header Bagian */}
            <div className="mb-4 d-flex align-items-start">
                <div>
                    <h5
                        className="fw-bold mb-1 text-capitalize"
                        style={{ fontSize: "1.1rem" }}
                    >
                        {selectedType} Form
                    </h5>

                    <p className="text-muted small mb-0">
                        Pilih mode kehadiran. Ini menentukan field yang perlu
                        diisi.
                    </p>
                </div>
            </div>

            {/* Form Berdasarkan Tipe Kehadiran */}
            {selectedType === "online" && (
                <OnlineForm data={formData} onChange={onChange} errors={errors} />
            )}
            {selectedType === "offline" && (
                <OfflineForm data={formData} onChange={onChange} errors={errors} />
            )}
            {selectedType === "hybrid" && (
                <HybridForm data={formData} onChange={onChange} errors={errors} />
            )}

            {/* Tombol Simpan (CREATE/UPDATE) */}
            {/* <div className="d-flex justify-content-end">
                <button
                    className="btn btn-outline-dark"
                    onClick={() => console.log("Kirim ke API:", formData)}
                >
                    Simpan Informasi
                </button>
            </div> */}
        </Form>
    );
};

export default Step2_DetailLocation;
