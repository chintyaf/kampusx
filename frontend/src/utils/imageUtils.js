import { STORAGE_URL } from '../api/storage';

/**
 * Utility to get the correct image URL for an event.
 * Prioritizes the uploaded image_path if available,
 * otherwise falls back to the manual event-banners folder based on the event ID.
 *
 * @param {Object} event - The event object (must contain id, and optionally image_path)
 * @returns {string} The full image URL
 */

export const getLMSUrl = (url) => {
	return `${STORAGE_URL}/lms/learning-path/${url}`;
};

export const getImageUrl = (url) => {
	return `${STORAGE_URL}/${url}`;
};
