import api from '@/api/axios';

const BASE = '/lms/member/modules';

/**
 * Data sidebar: info modul, daftar lesson, progress, kuis.
 * GET /lms/member/modules/{moduleId}/lessons
 */
export const getModuleLessons = async (moduleId, config = {}) => {
	const { data } = await api.get(`${BASE}/${moduleId}/lessons`, config);
	return data.data;
};

/**
 * Konten lesson aktif + prev/next.
 * GET /lms/member/modules/{moduleId}/lessons/{lessonId}
 */
export const getLessonDetail = async (moduleId, lessonId, config = {}) => {
	const { data } = await api.get(`${BASE}/${moduleId}/lessons/${lessonId}`, config);
	return data.data;
};

/**
 * Tandai lesson selesai.
 * POST /lms/member/modules/{moduleId}/lessons/{lessonId}/complete
 */
export const completeLesson = async (moduleId, lessonId, durationSeconds = 0) => {
	const { data } = await api.post(`${BASE}/${moduleId}/lessons/${lessonId}/complete`, {
		duration_seconds: Math.round(durationSeconds),
	});
	return data.data;
};