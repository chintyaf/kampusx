import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import axios from '@/api/axios';

const SRLContext = createContext();

const BASE = '/lms/member/srl-sessions';
const AUTO_SYNC_MS = 30000;

const initialSRLData = {
	forethought: {
		goal: '',
		motivation: '',
		strategies: [],
		estimatedMinutes: 25,
		confidenceLevel: null,
	},
	performance: {
		notes: '',
		focusLevel: null,
		accumulatedSeconds: 0,
	},
	reflection: {
		goalAchievement: '', // 'tercapai' | 'sebagian' | 'belum'
		factors: [],
		evaluation: '',
		futureAdjustment: '',
	},
};

const readJSON = (key, fallback) => {
	try {
		const raw = localStorage.getItem(key);
		return raw ? JSON.parse(raw) : fallback;
	} catch {
		return fallback;
	}
};

// Ambil pesan error paling informatif dari response Laravel
const getErrorMessage = (e, fallback = 'Terjadi kesalahan. Coba lagi.') => {
	const data = e?.response?.data;
	if (data?.errors) {
		const first = Object.values(data.errors)[0];
		if (Array.isArray(first) && first[0]) return first[0];
	}
	return data?.message || fallback;
};

export const SRLProvider = ({ children }) => {
	const [isOpen, setIsOpen] = useState(false);
	const [apiError, setApiError] = useState(null);
	const [isSubmitting, setIsSubmitting] = useState(false);

	const [isSessionActive, setIsSessionActive] = useState(
		() => readJSON('srl_session_active', false) === true,
	);

	const [currentPhase, setCurrentPhase] = useState(() => {
		if (readJSON('srl_session_active', false) !== true) return 'forethought';
		return localStorage.getItem('srl_current_phase') || 'forethought';
	});

	const [srlData, setSrlData] = useState(() => {
		const saved = readJSON('srl_session_data', null);
		return saved
			? {
					forethought: { ...initialSRLData.forethought, ...saved.forethought },
					performance: { ...initialSRLData.performance, ...saved.performance },
					reflection: { ...initialSRLData.reflection, ...saved.reflection },
				}
			: initialSRLData;
	});

	const [sessionId, setSessionId] = useState(
		() => localStorage.getItem('srl_session_id') || null,
	);

	const [timerRunning, setTimerRunning] = useState(
		() => readJSON('srl_timer_running', false) === true,
	);

	// Ref supaya fungsi async & interval selalu membaca nilai terbaru
	const sessionIdRef = useRef(sessionId);
	const srlDataRef = useRef(srlData);
	const syncRef = useRef(null);
	srlDataRef.current = srlData;

	useEffect(() => {
		sessionIdRef.current = sessionId;
	}, [sessionId]);

	// ── LocalStorage sync ────────────────────────────────────
	useEffect(() => {
		localStorage.setItem('srl_session_active', JSON.stringify(isSessionActive));
	}, [isSessionActive]);

	useEffect(() => {
		localStorage.setItem('srl_current_phase', currentPhase);
	}, [currentPhase]);

	useEffect(() => {
		localStorage.setItem('srl_session_data', JSON.stringify(srlData));
	}, [srlData]);

	useEffect(() => {
		localStorage.setItem('srl_timer_running', JSON.stringify(timerRunning));
	}, [timerRunning]);

	useEffect(() => {
		if (sessionId) localStorage.setItem('srl_session_id', String(sessionId));
		else localStorage.removeItem('srl_session_id');
	}, [sessionId]);

	// ── Timer (hidup di context, jadi tetap jalan saat modal ditutup) ──
	// Memakai selisih timestamp agar akurat walau tab di-throttle browser.
	const timerActive = timerRunning && isSessionActive && currentPhase === 'performance';

	useEffect(() => {
		if (!timerActive) return undefined;
		const startTs = Date.now();
		const base = srlDataRef.current.performance.accumulatedSeconds || 0;
		const id = setInterval(() => {
			const elapsed = Math.floor((Date.now() - startTs) / 1000);
			setSrlData((prev) => ({
				...prev,
				performance: { ...prev.performance, accumulatedSeconds: base + elapsed },
			}));
		}, 1000);
		return () => clearInterval(id);
	}, [timerActive]);

	// Auto-sync ke backend tiap 30 detik selama timer berjalan
	useEffect(() => {
		if (!timerActive) return undefined;
		const id = setInterval(() => syncRef.current?.(), AUTO_SYNC_MS);
		return () => clearInterval(id);
	}, [timerActive]);

	// ── Reset lokal ──────────────────────────────────────────
	const clearSession = () => {
		setIsSessionActive(false);
		setCurrentPhase('forethought');
		setSrlData(initialSRLData);
		setSessionId(null);
		setTimerRunning(false);
		sessionIdRef.current = null;
		localStorage.removeItem('srl_session_data');
		localStorage.removeItem('srl_session_active');
		localStorage.removeItem('srl_current_phase');
		localStorage.removeItem('srl_session_id');
		localStorage.removeItem('srl_timer_running');
	};

	const resetLocal = () => {
		clearSession();
		setIsOpen(false);
	};

	const clearError = () => setApiError(null);

	// ── API: GET active — sinkronkan state lokal dengan backend ──
	// Backend adalah sumber kebenaran. Dipanggil saat mount & saat modal dibuka.
	const fetchActiveSession = async () => {
		try {
			const { data } = await axios.get(`${BASE}/active`);
			let s = data?.session;

			if (!s) {
				// Backend tidak punya sesi aktif, tapi lokal masih mengira ada -> bersihkan
				if (sessionIdRef.current) clearSession();
				return null;
			}

			// Sesi 'planned' (dibuat tanpa start_immediately) -> mulai sekarang
			if (s.status === 'planned') {
				const started = await axios.patch(`${BASE}/${s.id}/start`);
				s = started.data?.session ?? s;
			}

			const sameSession = String(sessionIdRef.current) === String(s.id);

			setSessionId(String(s.id));
			sessionIdRef.current = String(s.id);
			setIsSessionActive(true);

			// Fase 'reflection' hanya ada di lokal (server baru set saat selesai)
			setCurrentPhase((prev) =>
				sameSession && prev === 'reflection' ? 'reflection' : 'performance',
			);

			// Sesi baru dari backend (mis. ganti perangkat) -> timer lanjut otomatis
			if (!sameSession) setTimerRunning(true);

			setSrlData((prev) => ({
				forethought: {
					goal: s.goal ?? '',
					motivation: s.motivation ?? '',
					strategies: s.strategies ?? [],
					estimatedMinutes: s.estimated_minutes ?? 25,
					confidenceLevel: s.confidence_level ?? null,
				},
				performance: {
					notes: sameSession ? prev.performance.notes || s.notes || '' : (s.notes ?? ''),
					focusLevel: sameSession
						? (prev.performance.focusLevel ?? s.focus_level ?? null)
						: (s.focus_level ?? null),
					// Ambil yang terbesar supaya timer tidak mundur
					accumulatedSeconds: Math.max(
						sameSession ? prev.performance.accumulatedSeconds || 0 : 0,
						s.accumulated_seconds || 0,
					),
				},
				reflection: sameSession ? prev.reflection : initialSRLData.reflection,
			}));

			return s;
		} catch (e) {
			console.error('[SRL] fetchActiveSession gagal:', e?.response?.data ?? e);
			return null;
		}
	};

	// Cek sesi aktif saat provider pertama kali dimuat
	useEffect(() => {
		fetchActiveSession();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	// ── API: Phase 1 — Forethought (store) ───────────────────
	// Return true kalau berhasil, false kalau gagal.
	const startSession = async () => {
		const f = srlData.forethought;

		if (!f.goal?.trim()) {
			setApiError('Tujuan belajar wajib diisi.');
			return false;
		}

		setApiError(null);
		setIsSubmitting(true);
		try {
			const minutes = Math.min(
				300,
				Math.max(5, Math.round(Number(f.estimatedMinutes) || 25)),
			);
			const resp = await axios.post(BASE, {
				goal: f.goal.trim(),
				motivation: f.motivation?.trim() || null,
				strategies: f.strategies?.length ? f.strategies : undefined,
				estimated_minutes: minutes,
				confidence_level: f.confidenceLevel || null,
				start_immediately: true,
			});
			const id = resp.data?.session?.id ?? null;
			setSessionId(id ? String(id) : null);
			sessionIdRef.current = id ? String(id) : null;
			setIsSessionActive(true);
			setCurrentPhase('performance');
			setTimerRunning(true);
			return true;
		} catch (e) {
			console.error('[SRL] startSession gagal:', e?.response?.data ?? e);
			if (
				e?.response?.status === 422 &&
				e?.response?.data?.message?.includes('sedang aktif')
			) {
				// Ada sesi menggantung di server -> lanjutkan sesi itu
				await fetchActiveSession();
				setApiError(
					'Kamu masih punya sesi yang sedang berjalan, sesi tersebut dilanjutkan.',
				);
			} else {
				setApiError(getErrorMessage(e, 'Gagal memulai sesi belajar.'));
			}
			return false;
		} finally {
			setIsSubmitting(false);
		}
	};

	// ── API: Phase 2 — syncProgress ──────────────────────────
	const syncProgress = async (overrides = {}) => {
		if (!sessionId) return false;
		const p = srlData.performance;
		try {
			await axios.patch(`${BASE}/${sessionId}/progress`, {
				accumulated_seconds: Math.max(
					0,
					Math.floor(overrides.accumulatedSeconds ?? p.accumulatedSeconds ?? 0),
				),
				notes: overrides.notes ?? p.notes ?? null,
				focus_level: overrides.focusLevel ?? p.focusLevel ?? null,
			});
			return true;
		} catch (e) {
			console.error('[SRL] syncProgress gagal:', e?.response?.data ?? e);
			return false;
		}
	};
	syncRef.current = syncProgress;

	// ── Timer controls ───────────────────────────────────────
	const startTimer = () => setTimerRunning(true);
	const pauseTimer = () => {
		setTimerRunning(false);
		syncProgress();
	};

	// ── API: Phase 2 — trackMaterial ─────────────────────────
	const trackMaterial = async ({
		targetType,
		targetId,
		activityType = 'viewed',
		durationSeconds = 0,
		isCompleted = false,
	} = {}) => {
		if (!sessionId || !targetType || !targetId) return null;
		try {
			const resp = await axios.post(`${BASE}/${sessionId}/materials`, {
				target_type: targetType, // 'lesson' | 'module'
				target_id: targetId,
				activity_type: activityType,
				duration_seconds: Math.max(0, Math.floor(durationSeconds)),
				is_completed: isCompleted,
			});
			return resp.data?.material ?? null;
		} catch (e) {
			console.error('[SRL] trackMaterial gagal:', e?.response?.data ?? e);
			return null;
		}
	};

	// ── API: Phase 3 — reflect (selesai) ─────────────────────
	// Return true kalau tersimpan di backend.
	const reflect = async (overrides = {}) => {
		if (!sessionId) return false;
		const r = srlData.reflection;
		const p = srlData.performance;

		const goalAchievement = overrides.goalAchievement ?? r.goalAchievement;
		if (!goalAchievement) {
			setApiError('Pilih dulu seberapa tercapai tujuan belajarmu.');
			return false;
		}

		setApiError(null);
		setIsSubmitting(true);
		try {
			await axios.patch(`${BASE}/${sessionId}/reflect`, {
				goal_achievement: goalAchievement,
				factors: overrides.factors ?? r.factors ?? [],
				evaluation: overrides.evaluation ?? r.evaluation ?? null,
				future_adjustment: overrides.futureAdjustment ?? r.futureAdjustment ?? null,
				accumulated_seconds: Math.max(0, Math.floor(p.accumulatedSeconds ?? 0)),
				notes: p.notes ?? null,
				focus_level: p.focusLevel ?? null,
			});
			return true;
		} catch (e) {
			console.error('[SRL] reflect gagal:', e?.response?.data ?? e);
			setApiError(getErrorMessage(e, 'Gagal menyimpan refleksi.'));
			return false;
		} finally {
			setIsSubmitting(false);
		}
	};

	// ── API: Abandon ─────────────────────────────────────────
	const abandon = async () => {
		if (sessionId) {
			try {
				await axios.patch(`${BASE}/${sessionId}/abandon`);
			} catch (e) {
				console.error('[SRL] abandon gagal:', e?.response?.data ?? e);
			}
		}
		resetLocal();
	};

	// ── Phase navigation ─────────────────────────────────────
	const goToReflection = () => {
		setTimerRunning(false); // timer berhenti saat masuk refleksi
		setCurrentPhase('reflection');
	};
	const backToPerformance = () => setCurrentPhase('performance');
	const finishSession = () => resetLocal();

	// ── Modal helpers ────────────────────────────────────────
	const openModal = () => {
		setApiError(null);
		setIsOpen(true);
		fetchActiveSession(); // pastikan sinkron dengan backend
	};

	const closeModal = () => setIsOpen(false);

	const toggleModal = () => {
		if (isOpen) closeModal();
		else openModal();
	};

	const updatePhaseData = (phase, field, value) => {
		setSrlData((prev) => ({
			...prev,
			[phase]: { ...prev[phase], [field]: value },
		}));
	};

	return (
		<SRLContext.Provider
			value={{
				isOpen,
				openModal,
				closeModal,
				toggleModal,
				isSessionActive,
				sessionId,
				currentPhase,
				setCurrentPhase,
				srlData,
				updatePhaseData,
				// status API
				apiError,
				clearError,
				isSubmitting,
				// timer
				timerRunning,
				startTimer,
				pauseTimer,
				// API actions
				fetchActiveSession,
				startSession,
				syncProgress,
				trackMaterial,
				reflect,
				abandon,
				// Phase nav
				goToReflection,
				backToPerformance,
				finishSession,
			}}
		>
			{children}
		</SRLContext.Provider>
	);
};

export const useSRL = () => {
	const context = useContext(SRLContext);
	if (!context) throw new Error('useSRL harus digunakan di dalam SRLProvider');
	return context;
};
