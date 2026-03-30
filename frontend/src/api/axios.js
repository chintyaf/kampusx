import axios from 'axios';

// Konfigurasi default axios
const api = axios.create({
//     baseURL: 'http://localhost:8000/api',
// });

// // Tambahkan Interceptor untuk menyelipkan token
// api.interceptors.request.use((config) => {
//     const token = localStorage.getItem('token'); // Sesuaikan dengan nama key-mu
//     if (token) {
//         config.headers.Authorization = `Bearer ${token}`;
//     }
//     return config;
// });
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api',
    headers: {
        'Accept': 'application/json',
        // Default kita set ke JSON. (Lihat catatan di bawah untuk form-data)
        'Content-Type': 'application/json', 
    }
});

// REQUEST INTERCEPTOR: Menyisipkan token otomatis
api.interceptors.request.use(
    (config) => {
        // Ambil token dari localStorage (Pastikan nama key-nya sesuai dengan saat kamu nyimpen token pas login)
        const token = localStorage.getItem('token'); 

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// RESPONSE INTERCEPTOR: Menangani error global (seperti token expired)
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            console.error('Sesi tidak valid atau telah habis. Silakan login kembali.');
            // Hapus token yang sudah tidak valid
            localStorage.removeItem('token');
            // Opsional: Redirect ke halaman login
            window.location.href = '/login'; 
        }
        return Promise.reject(error);
    }
);

export default api;