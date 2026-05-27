import { useState, useEffect } from 'react';
import api from '../api/axios';

/**
 * Hook untuk mengambil metadata event (status & jumlah peserta).
 * Digunakan di semua halaman detail event agar bisa menampilkan
 * modal konfirmasi notifikasi saat event sudah published.
 *
 * @param {string|number} eventId
 * @returns {{ eventStatus: string, participantCount: number, hasParticipants: boolean, isLoading: boolean }}
 */
const useEventMeta = (eventId) => {
    const [eventStatus, setEventStatus] = useState('draft');
    const [participantCount, setParticipantCount] = useState(0);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (!eventId) return;

        const fetchMeta = async () => {
            setIsLoading(true);
            try {
                const res = await api.get(`/event-dashboard/${eventId}/overview`);
                if (res.data?.status === 'success' && res.data?.data) {
                    const data = res.data.data;
                    setEventStatus(data.status || 'draft');

                    // Ambil total peserta dari demographics totals
                    const totals = data.demographics?.totals || [];
                    const totalPeserta = totals.find(t => t.label === 'Total Peserta');
                    setParticipantCount(totalPeserta?.value || 0);
                }
            } catch (err) {
                console.error('Gagal mengambil meta event:', err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchMeta();
    }, [eventId]);

    return {
        eventStatus,
        participantCount,
        hasParticipants: participantCount > 0,
        isLoading,
    };
};

export default useEventMeta;
