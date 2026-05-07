import React from 'react';
import { useParams } from 'react-router-dom';
import OrganizerMaterialsManage from '../../../../components/event/OrganizerMaterialsManage';

const OrganizerMaterialsManagePage = () => {
    const { eventId } = useParams();
    return <OrganizerMaterialsManage eventId={eventId} />;
};
export default OrganizerMaterialsManagePage;
