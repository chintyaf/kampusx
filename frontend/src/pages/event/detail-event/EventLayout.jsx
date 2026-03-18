import { useState } from "react";
import { Form, Container, Button, InputGroup } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import Select from "react-select";
import "../../../assets/css/form.css";
import { Image } from "lucide-react";

const EventLayout = ({ heading, subheading, children, nextPath }) => {
    const navigate = useNavigate();
    const handleSaveAndContinue = () => {
        try {
            // Simpan data event ke backend (belum diimplementasikan)

            // Setelah berhasil menyimpan, navigasi ke halaman berikutnya
            navigate(`../${nextPath}`);
        } catch (error) {
            console.error("Navigation error:", error);
        }
    };

    return (
        <>
            {/* Header Bagian */}
            <div className="mb-4 d-flex align-items-start">
                <div>
                    <h5 className="fw-bold mb-1" style={{ fontSize: "1.1rem" }}>
                        {heading}
                    </h5>
                    <p className="text-muted small mb-0">{subheading}</p>
                </div>
            </div>
            <div className="d-flex flex-column gap-4">{children}</div>
            <div className="w-100 d-flex justify-content-end mt-4 gap-4">
                <Button variant="dark" onClick={handleSaveAndContinue}>
                    Simpan & Lanjut
                </Button>
            </div>
        </>
    );
};

export default EventLayout;
