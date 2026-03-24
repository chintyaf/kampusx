import React from "react";
import { Badge } from "react-bootstrap";

const OptionalBadge = () => {
    return (
        <Badge
            bg="light"
            text="dark"
            className="ms-2 border fw-normal"
            style={{ fontSize: "0.65rem" }}
        >
            Opsional
        </Badge>
    );
};

export default OptionalBadge;
