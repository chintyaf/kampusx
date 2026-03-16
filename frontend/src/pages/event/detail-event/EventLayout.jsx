import { useState } from "react";
import { Form, Container, Button, InputGroup } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import Select from "react-select";
import "../../../assets/css/form.css";
import { Image } from "lucide-react";

const EventLayout = ({ title, children, nextPath }) => {
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
            <Form>
                <p className="mb-4 form-title">{title}</p>

                {children}
            </Form>
            <div className="w-100 d-flex justify-content-end mt-4 gap-4">
                <Button variant="dark" onClick={handleSaveAndContinue}>
                    Simpan & Lanjut
                </Button>
            </div>
        </>
    );
};

export default EventLayout;
