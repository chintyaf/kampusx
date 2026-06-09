import React from 'react';
import { useParams } from 'react-router-dom';
import MateriAcara from '../../../../components/event/MateriAcara';

const EventMaterial = () => {
    const { eventId } = useParams();

    return (
        <div className="container-fluid p-0">
            <MateriAcara />
        </div>
    );
};

export default EventMaterial;
