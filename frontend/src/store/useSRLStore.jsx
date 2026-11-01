import { create } from 'zustand';

export const useSRLStore = create((set) => ({
	// Modal state
	isOpen: false,
	activeTab: 'forethought',

	// Data 3 fase SRL
	forethought: {
		target: '',
		rencana: '',
	},

	performance: {
		catatan: '',
		progres: '',
	},

	selfReflection: {
		evaluasi: '',
		kendala: '',
	},

	// Modal actions
	setIsOpen: (isOpen) => set({ isOpen }),

	setActiveTab: (tab) => set({ activeTab: tab }),

	// Update Forethought
	updateForethought: (data) =>
		set((state) => ({
			forethought: {
				...state.forethought,
				...data,
			},
		})),

	// Update Performance
	updatePerformance: (data) =>
		set((state) => ({
			performance: {
				...state.performance,
				...data,
			},
		})),

	// Update Self-Reflection
	updateSelfReflection: (data) =>
		set((state) => ({
			selfReflection: {
				...state.selfReflection,
				...data,
			},
		})),

	// Reset session
	resetSRL: () =>
		set({
			isOpen: false,
			activeTab: 'forethought',
			forethought: {
				target: '',
				rencana: '',
			},
			performance: {
				catatan: '',
				progres: '',
			},
			selfReflection: {
				evaluasi: '',
				kendala: '',
			},
		}),
}));
