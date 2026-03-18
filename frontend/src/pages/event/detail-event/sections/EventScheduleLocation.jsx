import React from "react";
import { useState } from "react";
import { Form, InputGroup } from "react-bootstrap";
import Select from "react-select";
import EventLayout from "../EventLayout";

import Step1_TypeSelection from "./schedule/Step1_TypeSelection"; // Level 1
import Step2_DetailLocation from "./schedule/Step2_DetailLocation"; // Level 2
import SchedulePlaceholder from "./schedule/SchedulePlaceholder";
import Step3_Schedule from "./schedule/Step3_Schedule";

const EventScheduleLocation = () => {
    const [selectedType, setSelectedType] = useState(null);
    return (
        <EventLayout title="Informasi Utama Event" nextPath="event/create/">
            <Step1_TypeSelection onSelectType={setSelectedType} />

            {selectedType ? (
                <>
                    <Step2_DetailLocation selectedType={selectedType} />
                    <Step3_Schedule />
                </>
            ) : (
                <SchedulePlaceholder />
            )}
        </EventLayout>
    );
};

export default EventScheduleLocation;
