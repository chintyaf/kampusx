import axios from "axios";

/**
 * Konfigurasi Dasar Axios
 * Menggunakan Environment Variable untuk fleksibilitas antara Production & Development
 */
const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api",
    headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
    },
});

/**
 * REQUEST INTERCEPTOR
 * Secara otomatis menyisipkan Token Bearer ke setiap request jika tersedia
 */
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error),
);

/**
 * RESPONSE INTERCEPTOR
 * Menangani error global seperti 401 (Unauthorized) secara terpusat
 */
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            // Bersihkan data sesi yang expired
            localStorage.removeItem("token");

            // Redirect ke halaman login jika bukan di halaman login
            if (!window.location.pathname.includes("/login")) {
                window.location.href = "/login";
            }
        }
        return Promise.reject(error);
    },
);

export default api;


