import React from 'react';
import { useParams } from 'react-router-dom';
import FormHeading from '@/components/dashboard/FormHeading';
import MateriAcara from '../../../../components/event/MateriAcara';

const EventMaterial = () => {
    const { eventId } = useParams();

    return (
        <div className="container-fluid p-0">
            {/* Header Utama */}
            <FormHeading
                title="Manajemen Materi Acara"
                description="Kelola seluruh berkas pembelajaran, slide presentasi, dan video replay yang dibagikan kepada peserta sebelum, saat, dan setelah acara berlangsung."
                className="mb-4"
            />

            {/* Content Area - All Phases Combined */}
            <MateriAcara phase="all" />
        </div>
    );
};

export default EventMaterial;

