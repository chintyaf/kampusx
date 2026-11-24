import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import axios from '@/api/axios';

const SRLContext = createContext();

const BASE = '/lms/member/srl-sessions';
const AUTO_SYNC_MS = 30000; // sync berkala saat timer berjalan
const DEBOUNCE_MS = 1500; // sync setelah user berhenti mengubah catatan/fokus/jeda

// Nama field mengikuti yang dipakai komponen fase (bukan nama kolom DB)
const initialSRLData = {
	forethought: {
		goal: '',
		motivation: '',
		estimatedTime: 25,
		confidence: null,
	},
	performance: {
		notes: '',
		focusLevel: null,
		accumulatedSeconds: 0,
		startedAt: null,
		hasStarted: false,
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

// Pesan error paling informatif dari response Laravel
const getErrorMessage = (e, fallback = 'Terjadi kesalahan. Coba lagi.') => {
	const data = e?.response?.data;
	if (data?.errors) {
		const first = Object.values(data.errors)[0];
		if (Array.isArray(first) && first[0]) return first[0];
	}
	return data?.message || fallback;
};

// Total detik belajar, termasuk timer yang sedang berjalan
const getElapsedSeconds = (p = {}) =>
	Math.max(
		0,
		Math.floor(
			(p.accumulatedSeconds || 0) + (p.startedAt ? (Date.now() - p.startedAt) / 1000 : 0),
		),
	);

// Ubah data form Forethought -> payload sesuai validasi backend
const buildStartPayload = (d = {}) => {
	const goal = String(d.goal ?? d.sessionGoal ?? '')
		.trim()
		.slice(0, 1000);
	const strategiesRaw = Array.isArray(d.selectedStrategies)
		? d.selectedStrategies
		: Array.isArray(d.plan)
			? d.plan
			: [];
	const minutes = Math.min(300, Math.max(5, Math.round(Number(d.estimatedTime) || 25)));
	const conf = Math.round(Number(d.confidence));

	return {
		goal,
		motivation:
			String(d.motivation ?? '')
				.trim()
				.slice(0, 1000) || null,
		strategies: strategiesRaw.map((s) => String(s).trim().slice(0, 255)).filter(Boolean),
		estimated_minutes: minutes,
		confidence_level: conf >= 1 && conf <= 5 ? conf : null,
		start_immediately: true,
	};
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
		if (sessionId) localStorage.setItem('srl_session_id', String(sessionId));
		else localStorage.removeItem('srl_session_id');
	}, [sessionId]);

	// ── Turunan state untuk UI ───────────────────────────────
	const perf = srlData.performance;
	const isTimerRunning = perf.startedAt !== null && perf.startedAt !== undefined;
	const isPaused =
		isSessionActive && currentPhase === 'performance' && perf.hasStarted && !isTimerRunning;

	// ── Reset lokal ──────────────────────────────────────────
	const clearSession = () => {
		setIsSessionActive(false);
		setCurrentPhase('forethought');
		setSrlData(initialSRLData);
		setSessionId(null);
		sessionIdRef.current = null;
		localStorage.removeItem('srl_session_data');
		localStorage.removeItem('srl_session_active');
		localStorage.removeItem('srl_current_phase');
		localStorage.removeItem('srl_session_id');
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

			// Sesi 'planned' -> mulai sekarang
			if (s.status === 'planned') {
				const started = await axios.patch(`${BASE}/${s.id}/start`);
				s = started.data?.session ?? s;
			}

			const sameSession = String(sessionIdRef.current) === String(s.id);

			setSessionId(String(s.id));
			sessionIdRef.current = String(s.id);
			setIsSessionActive(true);

			// Fase 'reflection' hanya ada di lokal (server baru menandainya saat selesai)
			setCurrentPhase((prev) =>
				sameSession && prev === 'reflection' ? 'reflection' : 'performance',
			);

			const strategies = Array.isArray(s.strategies) ? s.strategies : [];
			const fromServer = {
				goal: s.goal ?? '',
				sessionGoal: s.goal ?? '',
				motivation: s.motivation ?? '',
				plan: strategies,
				selectedStrategies: strategies,
				estimatedTime: s.estimated_minutes ?? 25,
				confidence: s.confidence_level ?? null,
			};

			setSrlData((prev) => {
				if (sameSession) {
					const p = prev.performance;
					const serverSecs = s.accumulated_seconds || 0;
					return {
						...prev,
						forethought: prev.forethought?.goal ? prev.forethought : fromServer,
						// Timer lokal yang sedang berjalan tidak disentuh
						performance:
							!p.startedAt && serverSecs > (p.accumulatedSeconds || 0)
								? { ...p, accumulatedSeconds: serverSecs }
								: p,
					};
				}
				// Sesi dari backend (mis. ganti perangkat / localStorage terhapus):
				// hasStarted=false -> PerformancePhase otomatis melanjutkan timer
				return {
					forethought: fromServer,
					performance: {
						notes: s.notes ?? '',
						focusLevel: s.focus_level ?? null,
						accumulatedSeconds: s.accumulated_seconds || 0,
						startedAt: null,
						hasStarted: false,
					},
					reflection: initialSRLData.reflection,
				};
			});

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
	// formData dikirim dari ForethoughtPhase. Return true bila berhasil.
	const startSession = async (formData) => {
		const payload = buildStartPayload(formData ?? srlDataRef.current.forethought);

		if (!payload.goal) {
			setApiError('Target belajar wajib diisi.');
			return false;
		}

		setApiError(null);
		setIsSubmitting(true);
		try {
			const resp = await axios.post(BASE, payload);
			const id = resp.data?.session?.id ?? null;

			setSessionId(id ? String(id) : null);
			sessionIdRef.current = id ? String(id) : null;
			setIsSessionActive(true);
			// Pastikan data performance & reflection bersih untuk sesi baru
			setSrlData((prev) => ({
				...prev,
				performance: initialSRLData.performance,
				reflection: initialSRLData.reflection,
			}));
			setCurrentPhase('performance');
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
	// Selalu membaca state terbaru lewat ref dan menghitung timer yang sedang berjalan.
	const syncProgress = async () => {
		const sid = sessionIdRef.current;
		if (!sid) return false;
		const p = srlDataRef.current.performance;
		try {
			await axios.patch(`${BASE}/${sid}/progress`, {
				accumulated_seconds: getElapsedSeconds(p),
				notes: p.notes || null,
				focus_level: p.focusLevel || null,
			});
			return true;
		} catch (e) {
			console.error('[SRL] syncProgress gagal:', e?.response?.data ?? e);
			return false;
		}
	};
	syncRef.current = syncProgress;

	// Auto-sync setelah user berhenti mengubah catatan / fokus / jeda-lanjut
	useEffect(() => {
		if (!isSessionActive || !sessionId || currentPhase !== 'performance') return undefined;
		const t = setTimeout(() => syncRef.current?.(), DEBOUNCE_MS);
		return () => clearTimeout(t);
	}, [
		perf.notes,
		perf.focusLevel,
		perf.accumulatedSeconds,
		perf.startedAt,
		isSessionActive,
		sessionId,
		currentPhase,
	]);

	// Auto-sync berkala selama timer berjalan (waktu belajar tidak hilang kalau tab ditutup)
	const shouldAutoSync =
		isSessionActive && !!sessionId && currentPhase === 'performance' && isTimerRunning;
	useEffect(() => {
		if (!shouldAutoSync) return undefined;
		const id = setInterval(() => syncRef.current?.(), AUTO_SYNC_MS);
		return () => clearInterval(id);
	}, [shouldAutoSync]);

	// ── API: Phase 2 — trackMaterial ─────────────────────────
	const trackMaterial = async ({
		targetType,
		targetId,
		activityType = 'viewed',
		durationSeconds = 0,
		isCompleted = false,
	} = {}) => {
		const sid = sessionIdRef.current;
		if (!sid || !targetType || !targetId) return null;
		try {
			const resp = await axios.post(`${BASE}/${sid}/materials`, {
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
	const reflect = async () => {
		const sid = sessionIdRef.current;
		if (!sid) {
			setApiError('Sesi tidak ditemukan. Tutup lalu mulai sesi baru.');
			return false;
		}
		const { reflection: r, performance: p } = srlDataRef.current;

		if (!r.goalAchievement) {
			setApiError('Pilih dulu apakah target belajarmu tercapai.');
			return false;
		}

		setApiError(null);
		setIsSubmitting(true);
		try {
			await axios.patch(`${BASE}/${sid}/reflect`, {
				goal_achievement: r.goalAchievement,
				factors: (r.factors ?? []).map((f) => String(f).slice(0, 255)),
				evaluation: r.evaluation?.trim().slice(0, 2000) || null,
				future_adjustment: r.futureAdjustment?.trim().slice(0, 2000) || null,
				accumulated_seconds: getElapsedSeconds(p),
				notes: p.notes || null,
				focus_level: p.focusLevel || null,
			});
			return true;
		} catch (e) {
			console.error('[SRL] reflect gagal:', e?.response?.data ?? e);
			setApiError(
				getErrorMessage(e, 'Gagal menyimpan refleksi. Data kamu masih aman, coba lagi.'),
			);
			return false;
		} finally {
			setIsSubmitting(false);
		}
	};

	// ── API: Abandon ─────────────────────────────────────────
	const abandon = async () => {
		const sid = sessionIdRef.current;
		if (sid) {
			try {
				await axios.patch(`${BASE}/${sid}/abandon`);
			} catch (e) {
				const status = e?.response?.status;
				console.error('[SRL] abandon gagal:', e?.response?.data ?? e);
				// 403/404 = sesi sudah tidak valid di server, aman untuk direset lokal
				if (status !== 403 && status !== 404) {
					setApiError(getErrorMessage(e, 'Gagal membatalkan sesi. Coba lagi.'));
					return false;
				}
			}
		}
		resetLocal();
		return true;
	};

	// ── Phase navigation ─────────────────────────────────────
	const goToReflection = () => setCurrentPhase('reflection');
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
				isPaused,
				sessionId,
				currentPhase,
				setCurrentPhase,
				srlData,
				updatePhaseData,
				// status API
				apiError,
				clearError,
				isSubmitting,
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
