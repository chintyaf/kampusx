import React from "react";
import { ProgressBar, Card, Row, Col } from "react-bootstrap";

const QuotaCard = ({ onlineQuota, offlineQuota }) => {
    // Hitung total dan persentase
    const total = Number(onlineQuota) + Number(offlineQuota);

    // Guard clause jika total 0 untuk menghindari division by zero
    const onlinePercent =
        total > 0 ? Math.round((onlineQuota / total) * 100) : 0;
    const offlinePercent =
        total > 0 ? Math.round((offlineQuota / total) * 100) : 0;

    return (
        <Card
            className="p-3 border-0 shadow-sm"
            style={{ borderRadius: "12px", backgroundColor: "#f8f9fa" }}
        >
            {/* Label Atas */}
            <div className="d-flex justify-content-between mb-2 text-muted small">
                <span>Online: {onlineQuota}</span>
                <span>Offline: {offlineQuota}</span>
                <span className="fw-bold">Total: {total}</span>
            </div>

            {/* Progress Bar Stacked */}
            <ProgressBar style={{ height: "8px", borderRadius: "10px" }}>
                <ProgressBar
                    now={onlinePercent}
                    key={1}
                    style={{
                        backgroundColor: "#4D8BFF",
                        borderTopLeftRadius: "10px",
                        borderBottomLeftRadius: "10px",
                    }}
                />
                <ProgressBar
                    now={offlinePercent}
                    key={2}
                    style={{
                        backgroundColor: "#FF9F43",
                        borderTopRightRadius: "10px",
                        borderBottomRightRadius: "10px",
                    }}
                />
            </ProgressBar>

            {/* Legend / Keterangan Persentase */}
            <div className="d-flex gap-3 mt-2">
                <div className="d-flex align-items-center small text-muted">
                    <span
                        className="me-1"
                        style={{
                            width: "8px",
                            height: "8px",
                            backgroundColor: "#4D8BFF",
                            borderRadius: "50%",
                            display: "inline-block",
                        }}
                    ></span>
                    {onlinePercent}% Online
                </div>
                <div className="d-flex align-items-center small text-muted">
                    <span
                        className="me-1"
                        style={{
                            width: "8px",
                            height: "8px",
                            backgroundColor: "#FF9F43",
                            borderRadius: "50%",
                            display: "inline-block",
                        }}
                    ></span>
                    {offlinePercent}% Offline
                </div>
            </div>
        </Card>
    );
};

export default QuotaCard;
