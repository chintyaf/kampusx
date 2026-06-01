import React from 'react';
import ParticipantMaterialsTab from './ParticipantMaterialsTab';

const PostEventMaterials = ({ eventId }) => {
    return (
        <div className="mt-2">
            <ParticipantMaterialsTab eventId={eventId} />
        </div>
    );
};

export default PostEventMaterials;
