import { useEffect } from 'react';
import { useSRL } from '@/context/SRLContext';

/**
 * Catat materi yang sedang dibuka selama sesi SRL berlangsung.
 * Kirim "viewed" saat masuk, lalu kirim durasi saat pindah/keluar halaman.
 * Backend menjumlahkan durasi per materi, jadi aman dipanggil berkali-kali.
 *
 * Contoh di LessonViewerPage:
 *   useSRLMaterialTracker('lesson', Number(lessonId));
 */
export default function useSRLMaterialTracker(targetType, targetId) {
	const { isSessionActive, sessionId, trackMaterial } = useSRL();

	useEffect(() => {
		if (!isSessionActive || !sessionId || !targetType || !targetId) return undefined;

		const startedAt = Date.now();
		trackMaterial({ targetType, targetId, activityType: 'viewed' });

		return () => {
			const seconds = Math.floor((Date.now() - startedAt) / 1000);
			if (seconds > 0) {
				trackMaterial({ targetType, targetId, activityType: 'viewed', durationSeconds: seconds });
			}
		};
	}, [isSessionActive, sessionId, targetType, targetId]);
}