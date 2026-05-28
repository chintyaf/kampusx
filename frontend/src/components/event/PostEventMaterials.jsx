import React from 'react';
import LmsPlayer from '../lms/LmsPlayer';

const PostEventMaterials = ({ eventId }) => {
    return (
        <div className="mt-2">
            <h5 className="fw-bold mb-4 d-flex align-items-center justify-content-between">
                <span style={{ color: 'var(--color-primary, #1A365D)' }}>Ruang Belajar Micro-Learning</span>
            </h5>
            <LmsPlayer eventId={eventId} />
        </div>
    );
};

export default PostEventMaterials;
