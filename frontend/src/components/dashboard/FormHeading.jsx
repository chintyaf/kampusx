import React from "react";

const FormHeading = ({ heading, subheading }) => {
    return (
        <>
            <div className="mb-4 d-flex align-items-start">
                <div>
                    <h5 className="fw-bold mb-1" style={{ fontSize: "1.1rem" }}>
                        {heading}
                    </h5>
                    <p className="text-muted small mb-0">{subheading}</p>
                </div>
            </div>
        </>
    );
};

export default FormHeading;
