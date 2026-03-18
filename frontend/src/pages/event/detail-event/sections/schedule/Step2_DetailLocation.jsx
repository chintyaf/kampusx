import { Form } from "react-bootstrap";
import { CheckCircle2 } from "lucide-react";
import OnlineForm from "./OnlineForm";
import OfflineForm from "./OfflineForm";
import HybridForm from "./HybridForm";

const Step2_DetailLocation = ({ selectedType }) => {
    return (
        <Form>
            {/* Header Bagian */}
            <div className="mb-4 d-flex align-items-start">
                <div className="me-2 mt-1 text-success">
                    <CheckCircle2 size={24} fill="currentColor" color="white" />
                </div>
                <div>
                    <h5 className="fw-bold mb-1" style={{ fontSize: "1.1rem" }}>
                        Level 2 — Tipe Kehadiran
                    </h5>
                    <p className="text-muted small mb-0">
                        Pilih mode kehadiran. Ini menentukan field yang perlu
                        diisi.
                    </p>
                </div>
            </div>

            {/* Form Berdasarkan Tipe Kehadiran */}
            {selectedType === "online" && <OnlineForm />}
            {selectedType === "offline" && <OfflineForm />}
            {selectedType === "hybrid" && <HybridForm />}
        </Form>
    );
};

export default Step2_DetailLocation;
