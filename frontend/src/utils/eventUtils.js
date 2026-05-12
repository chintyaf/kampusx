import { STORAGE_URL } from '../api/storage';

/**
 * Utility to get the correct image URL for an event.
 * Prioritizes the uploaded image_path if available,
 * otherwise falls back to the manual event-banners folder based on the event ID.
 * 
 * @param {Object} event - The event object (must contain id, and optionally image_path)
 * @returns {string} The full image URL
 */
export const getEventImageUrl = (event) => {
    if (!event) return 'https://placehold.co/600x300';

    if (event.image_path) {
        return `${STORAGE_URL}/${event.image_path}`;
    }

    if (event.id) {
        return `${STORAGE_URL}/event-banners/${event.id}.jpg`;
    }

    return 'https://placehold.co/600x300';
};
