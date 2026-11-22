import api from '@/api/axios';

const url = (moduleId, path = '') => `/lms/member/modules/${moduleId}/quiz${path}`;
const unwrap = (res) => res.data.data;

export const quizApi = {
	/** Mulai atau lanjutkan attempt yang sedang berjalan (idempotent). */
	start: (moduleId) => api.post(url(moduleId, '/start')).then(unwrap),

	/** Autosave satu jawaban. */
	saveAnswer: (moduleId, attemptId, questionId, optionId) =>
		api.put(url(moduleId, `/attempts/${attemptId}/answers`), {
			question_id: questionId,
			option_id: optionId,
		}),

	/** answers = { [questionId]: optionId } */
	submit: (moduleId, attemptId, answers) =>
		api
			.post(url(moduleId, `/attempts/${attemptId}/submit`), {
				answers: Object.entries(answers).map(([q, o]) => ({
					question_id: Number(q),
					option_id: o,
				})),
			})
			.then(unwrap),

	result: (moduleId, attemptId) => api.get(url(moduleId, `/attempts/${attemptId}`)).then(unwrap),
};
