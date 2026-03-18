import React from "react";

const StatCard = ({ title, content, subcontent }) => {
    return (
        <div
            className="card border-grey p-3 d-flex flex-fill"
            style={{ borderRadius: "7px" }}
        >
            <div className="card-body ">
                <div className="d-flex justify-content-between align-items-start">
                    <div>
                        <p
                            className="mb-1 fs-6 text-body-tertiary"
                            style={{ fontSize: "var(--font-sm)" }}
                        >
                            {title}
                        </p>
                        <h2
                            className="fw-bold mb-0"
                            style={{ fontSize: "var(--font-xl)" }}
                        >
                            {content}
                        </h2>
                    </div>

                    {/* Icon placeholder using Bootstrap colors */}
                    <div
                        className="bg-primary p-3 rounded-2"
                        style={{ width: "40px", height: "40px" }}
                    >
                        <i className="bi bi-ticket-perforated text-primary fs-1"></i>
                    </div>
                </div>

                <div className="mt-2">
                    <p
                        className="text-body-tertiary small mb-0"
                        style={{ fontSize: "var(--font-xs)" }}
                    >
                        {subcontent}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default StatCard;
