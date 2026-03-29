import React, { useState, useEffect } from "react";
import {
    Container,
    Card,
    Row,
    Col,
    Button,
    Spinner,
    Form,
    InputGroup,
    Badge,
} from "react-bootstrap";
import { NavLink } from "react-router-dom";
import {
    Plus,
    Search,
    Calendar,
    MapPin,
    Users,
    Edit,
    Trash2,
} from "lucide-react";

import api from "../../api/axios";
import NoEvent from "./section/DashboardNoEvent";
import EventList from "./section/DashboardEventList";

const OrgDashboardPage = () => {
    const [events, setEvents] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const response = await api.get("/organizer/events-list");
                const result = response.data;

                if (result.status === "success" && Array.isArray(result.data)) {
                    setEvents(result.data);
                    setIsLoading(false);
                }
            } catch (error) {
                console.error("Error fetching events:", error);
                setIsLoading(false);
            }
        };

        fetchEvents();
        console.log(events);
    }, [events]);

    return (
        <div className="py-2 container">
            {/* Header Section Selalu Muncul */}

            {isLoading ? (
                <div className="text-center mt-5">
                    <Spinner animation="border" variant="primary" />
                    <p className="mt-2 text-muted">Memuat data acara...</p>
                </div>
            ) : events.length === 0 ? (
                <NoEvent />
            ) : (
                /* Main Container My Events */
                <EventList events={events} />
            )}
        </div>
    );
};

export default OrgDashboardPage;
