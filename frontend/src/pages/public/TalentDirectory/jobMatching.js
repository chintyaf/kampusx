import api from '@/api/axios';

/**
 * API Job Matching (Recruiter = guest, tanpa akun).
 * Akses ke sebuah pencarian dikontrol lewat token rahasia
 * yang dikembalikan sekali saat pencarian dibuat (header X-Search-Token).
 */
const BASE = '/lms/recruiter';

const tokenHeader = (token) => ({ headers: { 'X-Search-Token': token } });

/** Daftar skill untuk form pencarian -> [{ id, name, category }] */
export const getSkills = () =>
	api.get(`${BASE}/skills`).then((res) => res.data);

/**
 * Buat pencarian baru.
 * payload: { recruiter_name, recruiter_email, company_name?, title, min_similarity?,
 *            skills: [{ skill_id, importance_weight?, required_level?, is_mandatory? }] }
 * return:  { id, access_token }
 */
export const createJobSearch = (payload) =>
	api.post(`${BASE}/job-searches`, payload).then((res) => res.data);

/** Hitung kecocokan (top 10) -> { search, model_version, total, matches[] } */
export const matchJobSearch = (searchId, token) =>
	api.get(`${BASE}/job-searches/${searchId}/match`, tokenHeader(token)).then((res) => res.data);

/** Simpan kandidat ke shortlist. status: shortlisted | contacted | rejected */
export const shortlistCandidate = (searchId, token, userId, status = 'shortlisted') =>
	api
		.post(`${BASE}/job-searches/${searchId}/shortlist`, { user_id: userId, status }, tokenHeader(token))
		.then((res) => res.data);

/** Daftar kandidat yang sudah di-shortlist pada pencarian ini */
export const getShortlists = (searchId, token) =>
	api.get(`${BASE}/job-searches/${searchId}/shortlists`, tokenHeader(token)).then((res) => res.data);
