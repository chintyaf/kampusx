// src/utils/notify.js
import toast from 'react-hot-toast';
import AlertMessage from '../components/AlertMessage'; // Sesuaikan path komponenmu

export const notify = (type, title, message) => {
    return toast.custom((t) => (
        <AlertMessage 
            t={t} 
            type={type} 
            title={title} 
            message={message} 
        />
    ), {
        duration: 3000, // Kamu bisa atur durasi global di sini
    });
};