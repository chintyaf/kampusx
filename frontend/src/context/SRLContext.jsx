import React, { createContext, useContext, useState, useEffect } from 'react';

const SRLContext = createContext();

const initialSRLData = {
	forethought: { goal: '', strategy: '' },
	performance: { notes: '', focusLevel: 5 },
	reflection: { evaluation: '', futureAdjustment: '' },
};

export const SRLProvider = ({ children }) => {
	const [isOpen, setIsOpen] = useState(false);

	// 1. Status sesi aktif
	const [isSessionActive, setIsSessionActive] = useState(() => {
		try {
			return JSON.parse(localStorage.getItem('srl_session_active')) || false;
		} catch {
			return false;
		}
	});

	// 2. Fase saat ini: 'forethought' | 'performance' | 'reflection'
	// Jika sesi belum aktif, selalu default ke 'forethought'
	const [currentPhase, setCurrentPhase] = useState(() => {
		const savedSession = JSON.parse(localStorage.getItem('srl_session_active'));
		if (!savedSession) return 'forethought';
		return localStorage.getItem('srl_current_phase') || 'forethought';
	});

	// 3. Data form SRL
	const [srlData, setSrlData] = useState(() => {
		try {
			const saved = localStorage.getItem('srl_session_data');
			return saved ? JSON.parse(saved) : initialSRLData;
		} catch {
			return initialSRLData;
		}
	});

	// Sinkronisasi ke LocalStorage
	useEffect(() => {
		localStorage.setItem('srl_session_active', JSON.stringify(isSessionActive));
	}, [isSessionActive]);

	useEffect(() => {
		localStorage.setItem('srl_current_phase', currentPhase);
	}, [currentPhase]);

	useEffect(() => {
		localStorage.setItem('srl_session_data', JSON.stringify(srlData));
	}, [srlData]);

	// Action 1: Memulai sesi dari Forethought -> Performance
	const startSession = () => {
		setIsSessionActive(true);
		setCurrentPhase('performance');
	};

	// Action 2: Performance -> Reflection
	const goToReflection = () => {
		setCurrentPhase('reflection');
	};

	// Action 3: Reflection -> Performance
	const backToPerformance = () => {
		setCurrentPhase('performance');
	};

	// Action 4: Menyelesaikan sesi (Reset total)
	const finishSession = () => {
		setIsSessionActive(false);
		setCurrentPhase('forethought');
		setSrlData(initialSRLData);
		localStorage.removeItem('srl_session_data');
		localStorage.removeItem('srl_session_active');
		localStorage.removeItem('srl_current_phase');
		setIsOpen(false);
	};

	// Buka Modal (Jika sesi belum aktif, pastikan selalu mulai dari 'forethought')
	const openModal = () => {
		if (!isSessionActive) {
			setCurrentPhase('forethought');
		}
		setIsOpen(true);
	};

	const closeModal = () => {
		setIsOpen(false);
	};

	// Toggle status buka/tutup modal
	const toggleModal = () => {
		setIsOpen((prev) => {
			const nextState = !prev;
			if (nextState && !isSessionActive) {
				setCurrentPhase('forethought');
			}
			return nextState;
		});
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
				currentPhase,
				setCurrentPhase,
				srlData,
				updatePhaseData,
				startSession,
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
