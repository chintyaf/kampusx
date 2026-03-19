import React from "react";
import { Toast } from "react-bootstrap";
import { CheckCircle, Info, AlertTriangle, XCircle } from "lucide-react";
import toast from "react-hot-toast";

const AlertMessage = ({ t, type, title, message }) => {
    const icons = {
        success: <CheckCircle className="text-success me-2" size={20} />,
        info: <Info className="text-primary me-2" size={20} />,
        warning: <AlertTriangle className="text-warning me-2" size={20} />,
        danger: <XCircle className="text-danger me-2" size={20} />,
    };

    const borderColors = {
        success: "#198754",
        info: "#0dcaf0",
        warning: "#ffc107",
        danger: "#dc3545",
    };

    const bgColors = {
        success: "#f0fff4",
        info: "#f0f7ff",
        warning: "#fffbeb",
        danger: "#fff5f5",
    };

    return (
        <div
            className={
                t.visible ? "animate-popup-enter" : "animate-popup-leave"
            }
            style={{
                transformOrigin: "top right",
                marginBottom: "10px", 
            }}
        >
            <Toast
                // 2. Fungsi tutup manual
                onClose={() => toast.dismiss(t.id)}
                style={{
                    padding: "5px 5px",
                    backgroundColor: bgColors[type] || "#fff",
                    border: `1px solid ${borderColors[type]}`,
                    borderRadius: "7px",
                    boxShadow: "0 10px 25px rgba(0,0,0,0.1)", // Shadow lebih halus
                    minWidth: "300px",
                    maxWidth: "400px",
                }}
            >
                <Toast.Header closeButton className="border-0 bg-transparent">
                    {icons[type]}
                    <strong className="me-auto text-dark">{title}</strong>
                </Toast.Header>
                <Toast.Body
                    className="pt-0 pb-3"
                    style={{ paddingLeft: "40px" }}
                >
                    <span className="text-muted">{message}</span>
                </Toast.Body>
            </Toast>
        </div>
    );
};

export default AlertMessage;
