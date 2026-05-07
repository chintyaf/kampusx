import React from 'react';
import { useParams } from 'react-router-dom';
import PostEventMaterials from '../../components/event/PostEventMaterials';

const PostEventMaterialsPage = () => {
    const { id } = useParams();
    return <PostEventMaterials eventId={id} />;
};
export default PostEventMaterialsPage;
