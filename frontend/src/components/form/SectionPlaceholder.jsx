import React from "react";
import { Users } from "lucide-react";

const SectionPlaceholder = ({ icon, title, subtitle }) => {
    return (
        <>
            <div
                className="text-center p-5 mb-4 rounded-4 bg-light"
                style={{ borderStyle: "dashed", borderColor: "#b7bec9" }}
            >
                <Users size={48} className="text-muted mb-3 opacity-50" />
                <h6 className="fw-bold text-muted mb-1">
                    {title || "Belum ada data"}
                </h6>
                <p className="text-muted small mb-0">
                    {subtitle ||
                        "Silakan klik tombol di bawah untuk menambahkan data baru."}
                </p>
            </div>
        </>
    );
};

export default SectionPlaceholder;
