import { useState, useEffect } from 'react';
import api from '../api/axios';

// Helper function to convert VAPID public key base64 to Uint8Array
function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
        .replace(/-/g, '+')
        .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

export const usePushNotifications = () => {
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Check current subscription status when hook mounts
        if ('serviceWorker' in navigator && 'PushManager' in window) {
            navigator.serviceWorker.ready.then((registration) => {
                registration.pushManager.getSubscription().then((subscription) => {
                    setIsSubscribed(!!subscription);
                });
            });
        }
    }, []);

    const subscribeDevice = async () => {
        setLoading(true);
        setError(null);

        try {
            // 1. Request notification permission
            const permission = await Notification.requestPermission();
            if (permission !== 'granted') {
                throw new Error('Izin notifikasi ditolak oleh pengguna.');
            }

            // 2. Ensure Service Worker is ready
            const registration = await navigator.serviceWorker.ready;

            // 3. Fetch public VAPID key from the backend
            const response = await api.get('/push-subscribe/vapid');
            const vapidPublicKey = response.data.publicKey;
            if (!vapidPublicKey) {
                throw new Error('Kunci publik VAPID tidak ditemukan di server.');
            }

            // 4. Subscribe the client
            const convertedVapidKey = urlBase64ToUint8Array(vapidPublicKey);
            const subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: convertedVapidKey
            });

            // 5. Send subscription info to backend
            const subscriptionJson = subscription.toJSON();
            await api.post('/push-subscribe', {
                endpoint: subscriptionJson.endpoint,
                keys: subscriptionJson.keys,
                content_encoding: 'aesgcm'
            });

            setIsSubscribed(true);
            return true;
        } catch (err) {
            console.error('Gagal berlangganan push notifications:', err);
            setError(err.response?.data?.message || err.message || 'Gagal mengaktifkan notifikasi perangkat.');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const unsubscribeDevice = async () => {
        setLoading(true);
        setError(null);
        try {
            const registration = await navigator.serviceWorker.ready;
            const subscription = await registration.pushManager.getSubscription();
            if (subscription) {
                await subscription.unsubscribe();
                setIsSubscribed(false);
            }
            return true;
        } catch (err) {
            console.error('Gagal membatalkan langganan push notifications:', err);
            setError(err.message || 'Gagal menonaktifkan notifikasi perangkat.');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return {
        isSubscribed,
        loading,
        error,
        subscribeDevice,
        unsubscribeDevice
    };
};
