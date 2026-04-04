import { useState } from "react";
import { Form, Container, Button, InputGroup } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import Select from "react-select";
import "../assets/css/form.css";
import { Image } from "lucide-react";
import { notify } from "../utils/notify";

const EventLayout = ({
    heading,
    subheading,
    children,
    nextPath,
    prevPath,
    onSave,
}) => {
    const navigate = useNavigate();
    const [isSaving, setIsSaving] = useState(false);
    const handleSaveAndContinue = async () => {
        if (isSaving) return;
        setIsSaving(true);

        try {
            if (onSave) await onSave();
            navigate(`../${nextPath}`);
        } catch (error) {
            console.error("Navigation error:", error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleSave = async () => {
        if (isSaving) return;
        setIsSaving(true);
        try {
            if (onSave) await onSave();
        } catch (error) {
            notify("Failed to save", "error");
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
                {prevPath && (
                    <Button
                        variant="dark"
                        onClick={() =>
                            prevPath ? navigate(`../${prevPath}`) : navigate(-1)
                        }
                    >
                        Back
                    </Button>
                )}
                <Button
                    variant="dark"
                    onClick={handleSaveAndContinue}
                    disabled={isSaving}
                >
                    Selanjutnya
                </Button>
            </div>
        </>
    );
};

export default EventLayout;
