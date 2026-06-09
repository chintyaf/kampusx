export const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || `${BACKEND_URL}/api`;
export const STORAGE_URL = import.meta.env.VITE_STORAGE_URL || `${BACKEND_URL}/storage`;

export const getPaymentUrl = (token) => {
	return `${BACKEND_URL}/payment/${token}`;
};
