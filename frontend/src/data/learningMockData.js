/**
 * learningMockData.js
 * Mock data for the KampusX Microlearning Learning Dashboard.
 * Includes user profile, weekly goals, active modules, recommendations,
 * enrolled courses, SRL learning readiness scores, quiz feedback, and badges.
 */

export const mockUserLearningProfile = {
	id: 'usr-101',
	name: 'Alex Rivera',
	avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
	role: 'Software Engineer & Learner',
	greeting: 'Good morning',
	motivationalQuote:
		'Consistency is the key to mastery. You are 60% closer to your weekly microlearning goal!',
	currentStreak: 7,
	totalXp: 2850,
	xp: 2850,
	streakCount: 7,
	level: 4,
	levelTitle: 'SRL Advanced Scholar',
	skillMatrix: [
		{ skill: 'REST API & Architecture', level: 90, benchmark: 80, category: 'Backend' },
		{ skill: 'React & Modern Frontend', level: 85, benchmark: 75, category: 'Frontend' },
		{
			skill: 'Cloud & Containerization (Docker)',
			level: 78,
			benchmark: 70,
			category: 'DevOps',
		},
		{ skill: 'Database Optimization & SQL', level: 72, benchmark: 65, category: 'Database' },
		{
			skill: 'Self-Regulated Learning (SRL)',
			level: 94,
			benchmark: 85,
			category: 'Metacognitive',
		},
		{ skill: 'API Security & Zero Trust', level: 80, benchmark: 75, category: 'Security' },
	],
	jobMatches: [
		{
			id: 'job-1',
			title: 'Senior Fullstack Engineer',
			company: 'TechCorp Indonesia',
			location: 'Jakarta (Hybrid)',
			matchPercentage: 88,
			matchedSkills: [
				'REST API & Architecture',
				'React & Modern Frontend',
				'Cloud & Containerization',
			],
			missingSkills: ['Kafka Event Streaming', 'Kubernetes Helm'],
			salaryRange: 'Rp 18.000.000 - Rp 26.000.000',
		},
		{
			id: 'job-2',
			title: 'Backend Systems Architect',
			company: 'Nusantara Cloud Solutions',
			location: 'Bandung (Remote)',
			matchPercentage: 82,
			matchedSkills: ['REST API & Architecture', 'Database Optimization', 'API Security'],
			missingSkills: ['gRPC Protocol Buffers', 'GraphQL Federation'],
			salaryRange: 'Rp 22.000.000 - Rp 32.000.000',
		},
		{
			id: 'job-3',
			title: 'Frontend Lead Specialist',
			company: 'Fintech Nusantara Hub',
			location: 'Jakarta (Onsite)',
			matchPercentage: 91,
			matchedSkills: ['React & Modern Frontend', 'Self-Regulated Learning', 'REST API'],
			missingSkills: ['Next.js SSR Turbopack'],
			salaryRange: 'Rp 20.000.000 - Rp 28.000.000',
		},
		{
			id: 'job-4',
			title: 'DevOps & Infrastructure Engineer',
			company: 'Digital Karya Studio',
			location: 'Yogyakarta (Remote)',
			matchPercentage: 74,
			matchedSkills: ['Cloud & Containerization', 'API Security'],
			missingSkills: ['Terraform IaC', 'CI/CD GitHub Actions Workflow'],
			salaryRange: 'Rp 15.000.000 - Rp 22.000.000',
		},
	],
};

export const userProfile = mockUserLearningProfile;

export const mockWeeklyGoal = {
	completedModules: 3,
	targetModules: 5,
	studyHours: 6.5,
	targetHours: 10,
	progressPercent: 60,
	daysLeft: 3,
	dailyBreakdown: [
		{ day: 'Mon', hours: 1.5, completed: true, label: 'Sen' },
		{ day: 'Tue', hours: 2.0, completed: true, label: 'Sel' },
		{ day: 'Wed', hours: 1.0, completed: true, label: 'Rab' },
		{ day: 'Thu', hours: 2.0, completed: true, label: 'Kam' },
		{ day: 'Fri', hours: 0, completed: false, label: 'Jum' },
		{ day: 'Sat', hours: 0, completed: false, label: 'Sab' },
		{ day: 'Sun', hours: 0, completed: false, label: 'Min' },
	],
	weeklyMessage:
		'You are on track! Complete 2 more modules by Sunday to maintain your streak bonus.',
};

export const mockContinueLearning = {
	id: 'mod-arch-101',
	title: 'Web Application Architecture & REST API Design',
	category: 'System Architecture',
	level: 'Intermediate',
	passingScore: 75,
	thumbnail:
		'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=800&q=80',
	currentLesson: 'Lesson 4 of 8: Scalable Endpoints, Idempotency & Rate Limiting',
	currentChapter: 'Chapter 2: Scalability & REST Principles',
	totalLessons: 8,
	completedLessons: 5,
	progressPercent: 65,
	timeRemaining: '15 min remaining',
	lastAccessed: '2 hours ago',
	instructor: 'Ir. Hendra Pratama, M.T.',
	tags: ['REST API', 'Architecture', 'Microservices'],
};

export const mockRecommendedModules = [
	{
		id: 'rec-1',
		title: 'Microservices Event-Driven Patterns with Kafka & Redis',
		category: 'Backend Architecture',
		badge: { text: 'Trending', bg: 'primary', color: '#6c5ce7' },
		rating: 4.9,
		reviewsCount: 348,
		duration: '18 min',
		lessonsCount: 5,
		difficulty: 'Intermediate',
		thumbnail:
			'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=600&q=80',
		xpReward: 120,
		author: 'Tech Arch Guild',
	},
	{
		id: 'rec-2',
		title: 'React 19 Server Components, Actions & Optimistic UI',
		category: 'Frontend Engineering',
		badge: { text: 'New', bg: 'success', color: '#10b981' },
		rating: 4.85,
		reviewsCount: 194,
		duration: '14 min',
		lessonsCount: 4,
		difficulty: 'Advanced',
		thumbnail:
			'https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&w=600&q=80',
		xpReward: 95,
		author: 'Frontend Mastery',
	},
	{
		id: 'rec-3',
		title: 'Securing Distributed APIs: OAuth 2.1 & Zero Trust JWT',
		category: 'Cybersecurity',
		badge: { text: 'Popular', bg: 'danger', color: '#ef4444' },
		rating: 4.92,
		reviewsCount: 512,
		duration: '12 min',
		lessonsCount: 3,
		difficulty: 'Intermediate',
		thumbnail:
			'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=600&q=80',
		xpReward: 80,
		author: 'Cybersec Team',
	},
	{
		id: 'rec-4',
		title: 'Self-Regulated Learning (SRL): High Performance Habits',
		category: 'Productivity & SRL',
		badge: { text: 'Editor’s Choice', bg: 'warning', color: '#f59e0b' },
		rating: 4.96,
		reviewsCount: 276,
		duration: '10 min',
		lessonsCount: 3,
		difficulty: 'All Levels',
		thumbnail:
			'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=600&q=80',
		xpReward: 75,
		author: 'KampusX Learning Lab',
	},
];

export const mockEnrolledModules = [
	{
		id: 'enr-1',
		title: 'Web Application Architecture & REST API Design',
		category: 'System Architecture',
		status: 'in_progress',
		progress: 65,
		completedLessons: 5,
		totalLessons: 8,
		duration: '45 min',
		lastStudied: 'Today, 10:30 AM',
		thumbnail:
			'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=600&q=80',
		rating: 4.9,
		xpEarned: 150,
	},
	{
		id: 'enr-2',
		title: 'Modern State Management with Redux Toolkit & Zustand',
		category: 'Frontend Development',
		status: 'in_progress',
		progress: 35,
		completedLessons: 2,
		totalLessons: 6,
		duration: '35 min',
		lastStudied: 'Yesterday',
		thumbnail:
			'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=600&q=80',
		rating: 4.8,
		xpEarned: 80,
	},
	{
		id: 'enr-3',
		title: 'Database Indexing & PostgreSQL Query Optimization',
		category: 'Database Systems',
		status: 'in_progress',
		progress: 50,
		completedLessons: 3,
		totalLessons: 6,
		duration: '40 min',
		lastStudied: '3 days ago',
		thumbnail:
			'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?auto=format&fit=crop&w=600&q=80',
		rating: 4.88,
		xpEarned: 110,
	},
	{
		id: 'enr-4',
		title: 'Docker & Containerization for Fullstack Engineers',
		category: 'DevOps & Cloud',
		status: 'completed',
		progress: 100,
		completedLessons: 6,
		totalLessons: 6,
		duration: '50 min',
		lastStudied: '5 days ago',
		certificateId: 'CERT-KX-8921',
		thumbnail:
			'https://images.unsplash.com/photo-1605745341112-85968b19335b?auto=format&fit=crop&w=600&q=80',
		rating: 4.95,
		xpEarned: 200,
	},
	{
		id: 'enr-5',
		title: 'Clean Architecture & Domain Driven Design Essentials',
		category: 'Software Engineering',
		status: 'completed',
		progress: 100,
		completedLessons: 7,
		totalLessons: 7,
		duration: '1 hr 10 min',
		lastStudied: '1 week ago',
		certificateId: 'CERT-KX-7402',
		thumbnail:
			'https://images.unsplash.com/photo-1516116211227-bbc67981503f?auto=format&fit=crop&w=600&q=80',
		rating: 4.92,
		xpEarned: 250,
	},
];

export const mockLearningReadiness = {
	score: 78,
	statusLabel: 'Ready to Advance',
	badgeText: 'High SRL Readiness',
	description:
		'You demonstrate strong self-regulation habits and consistent focus during microlearning intervals.',
	subDimensions: [
		{ name: 'Forethought & Goal Setting', score: 85, color: '#6c5ce7', icon: 'Target' },
		{ name: 'Performance & Focus', score: 75, color: '#00699e', icon: 'Zap' },
		{ name: 'Self-Reflection & Review', score: 78, color: '#10b981', icon: 'RotateCcw' },
		{ name: 'Time & Habit Management', score: 72, color: '#f59e0b', icon: 'Clock' },
	],
};

export const mockQuizFeedback = {
	quizTitle: 'REST API Principles & Status Codes',
	moduleTitle: 'Web Application Architecture & REST API Design',
	score: 92,
	totalQuestions: 10,
	correctAnswers: 9,
	completedAt: '2 hours ago',
	badge: 'Mastery Passed',
	feedbackSummary:
		'Excellent comprehension of idempotency and standard HTTP status response contracts.',
	strengths: [
		'Perfect evaluation on idempotent verbs (PUT, DELETE, GET)',
		'Flawless distinction between 401 Unauthorized vs 403 Forbidden',
	],
	improvementTip:
		'Revisit cache invalidation headers (ETag vs Cache-Control) for optimal browser latency.',
};

export const mockBadgesAndCredentials = {
	badges: [
		{
			id: 'b-1',
			name: 'Quick Saver',
			description: 'Bookmarked and organized 10+ essential code resources',
			icon: 'Bookmark',
			color: '#3b82f6',
			bgColor: '#eff6ff',
			borderColor: '#bfdbfe',
			unlocked: true,
			unlockedAt: 'Yesterday',
			txHash: '0x8f2c39a1d5e6b7c4a9f0123456789abcde0123456789abcdef0123456789abcd',
			payloadJSON: {
				user_id: 'usr-101',
				badge_id: 'b-1',
				name: 'Quick Saver',
				criteria: '10+ Resources Bookmarked',
				timestamp: '2026-09-29T14:20:00Z',
				network: 'Polygon PoS Mainnet',
			},
		},
		{
			id: 'b-2',
			name: 'Deep Thinker',
			description: 'Completed 5 detailed SRL reflection journals',
			icon: 'Brain',
			color: '#8b5cf6',
			bgColor: '#f5f3ff',
			borderColor: '#ddd6fe',
			unlocked: true,
			unlockedAt: '3 days ago',
			txHash: '0x4c2b9a7f1e0d8c3b5a6f7890123456789abcdef0123456789abcdef012345678',
			payloadJSON: {
				user_id: 'usr-101',
				badge_id: 'b-2',
				name: 'Deep Thinker',
				criteria: '5 SRL Reflection Journals',
				timestamp: '2026-09-27T11:15:00Z',
				network: 'Polygon PoS Mainnet',
			},
		},
		{
			id: 'b-3',
			name: '7-Day Streak',
			description: 'Logged in and studied for 7 consecutive days',
			icon: 'Flame',
			color: '#f97316',
			bgColor: '#fff7ed',
			borderColor: '#fed7aa',
			unlocked: true,
			unlockedAt: 'Today',
			txHash: '0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f90a1b2c3d4e5f6a7b8c9d0e1f2a3',
			payloadJSON: {
				user_id: 'usr-101',
				badge_id: 'b-3',
				name: '7-Day Streak',
				criteria: '7 Consecutive Days of Study',
				timestamp: '2026-09-30T09:00:00Z',
				network: 'Polygon PoS Mainnet',
			},
		},
		{
			id: 'b-4',
			name: 'Quiz Master',
			description: 'Scored 90%+ in 3 microlearning quizzes consecutively',
			icon: 'Award',
			color: '#10b981',
			bgColor: '#ecfdf5',
			borderColor: '#a7f3d0',
			unlocked: true,
			unlockedAt: '2 days ago',
			txHash: '0x5e6f7a8b9c0d1e2f3a4b5c6d7e8f90a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7',
			payloadJSON: {
				user_id: 'usr-101',
				badge_id: 'b-4',
				name: 'Quiz Master',
				criteria: 'Score 90%+ in 3 Quizzes',
				timestamp: '2026-09-28T16:45:00Z',
				network: 'Polygon PoS Mainnet',
			},
		},
	],
	credentials: [
		{
			id: 'cred-1',
			title: 'Docker & Containerization for Fullstack',
			issuer: 'KampusX Microlearning Academy',
			issueDate: '24 Sep 2026',
			code: 'KX-DKR-8921',
			downloadUrl: '#',
			score: 95,
			status_lulus: 'LULUS_VERIFIKASI',
			txHash: '0x71a9b83f4d1e67290bc571629fa830d1284a569c73b0921e491295fc447d9c12',
			blockNumber: 4829104,
			contractAddress: '0x4E72d8296d19C502E0Db6C852e6D7644cE12B00a',
			payloadJSON: {
				user_id: 'usr-101',
				module_id: 'enr-4',
				module_title: 'Docker & Containerization for Fullstack Engineers',
				score: 95,
				status_lulus: 'LULUS_VERIFIKASI',
				timestamp: '2026-09-24T10:30:00Z',
				network: 'Polygon PoS Mainnet',
				verification_hash:
					'sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
			},
		},
		{
			id: 'cred-2',
			title: 'Clean Architecture & Domain Driven Design',
			issuer: 'KampusX Software Engineering Lab',
			issueDate: '18 Sep 2026',
			code: 'KX-CAD-7402',
			downloadUrl: '#',
			score: 92,
			status_lulus: 'LULUS_VERIFIKASI',
			txHash: '0x3a4b9c1d8e7f602514bc9081a2e345f67890bcde1234567890abcdef12345678',
			blockNumber: 4791022,
			contractAddress: '0x4E72d8296d19C502E0Db6C852e6D7644cE12B00a',
			payloadJSON: {
				user_id: 'usr-101',
				module_id: 'enr-5',
				module_title: 'Clean Architecture & Domain Driven Design Essentials',
				score: 92,
				status_lulus: 'LULUS_VERIFIKASI',
				timestamp: '2026-09-18T16:45:00Z',
				network: 'Polygon PoS Mainnet',
				verification_hash: 'sha256:d41d8cd98f00b204e9800998ecf8427e',
			},
		},
		{
			id: 'cred-3',
			title: 'Web Application Architecture & REST API Design',
			issuer: 'KampusX Architecture Guild',
			issueDate: '30 Sep 2026',
			code: 'KX-REST-101',
			downloadUrl: '#',
			score: 92,
			status_lulus: 'LULUS_VERIFIKASI',
			txHash: '0x992ab3c4d5e6f708192a3b4c5d6e7f8091a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6',
			blockNumber: 4851290,
			contractAddress: '0x4E72d8296d19C502E0Db6C852e6D7644cE12B00a',
			payloadJSON: {
				user_id: 'usr-101',
				module_id: 'mod-arch-101',
				module_title: 'Web Application Architecture & REST API Design',
				score: 92,
				status_lulus: 'LULUS_VERIFIKASI',
				timestamp: '2026-09-30T12:00:00Z',
				network: 'Polygon PoS Mainnet',
				verification_hash:
					'sha256:a1b2c3d4e5f60718293a4b5c6d7e8f90a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6',
			},
		},
	],
};

export const certificates = mockBadgesAndCredentials.credentials;
export const badges = mockBadgesAndCredentials.badges;

/**
 * Curated Micro-Quiz questions per lesson ID.
 * Each quiz contains 1-2 interactive questions with options, correct answer index,
 * informative explanation, and XP reward.
 */
export const mockLessonMicroQuizzes = {
	'les-1': [
		{
			id: 'mq-1-1',
			question:
				'Berdasarkan kaidah RESTful Semantic, manakah URI yang paling tepat untuk mengambil data pengguna dengan ID 42?',
			options: [
				'GET /getUserById?id=42',
				'GET /api/v1/users/42',
				'POST /api/v1/users/get/42',
				'GET /api/v1/user/fetch/42',
			],
			correctAnswer: 1,
			explanation:
				'Dalam RESTful convention, gunakan kata benda jamak (plural nouns) seperti /users dan path parameter untuk mengidentifikasi resource spesifik, dipadukan dengan HTTP method GET.',
			xpReward: 15,
		},
		{
			id: 'mq-1-2',
			question:
				'Manakah HTTP method yang paling tepat digunakan untuk memperbarui sebagian (partial update) field dari data user?',
			options: ['GET', 'PUT', 'PATCH', 'DELETE'],
			correctAnswer: 2,
			explanation:
				'PATCH digunakan untuk partial update (hanya mengubah field tertentu), sedangkan PUT umumnya mengganti seluruh representasi resource.',
			xpReward: 15,
		},
	],
	'les-2': [
		{
			id: 'mq-2-1',
			question:
				'Format standar RFC 7807 (Problem Details for HTTP APIs) merekomendasikan field standar berikut dalam payload JSON error, KECUALI:',
			options: [
				'status (HTTP status code numeric)',
				'title (Ringkasan human-readable)',
				'passwordHash (Kredensial rahasia autentikasi)',
				'detail (Penjelasan spesifik penyebab error)',
			],
			correctAnswer: 2,
			explanation:
				'RFC 7807 menggunakan type, title, status, detail, dan instance. Password hash atau kredensial sensitif tidak boleh diekspos dalam error payload demi keamanan API.',
			xpReward: 15,
		},
	],
};

/**
 * LocalStorage state management helpers for XP, streak, and quiz progression
 */
export const getLearnerXp = () => {
	try {
		const saved = localStorage.getItem('kampusx_learner_xp');
		if (saved !== null) {
			return parseInt(saved, 10);
		}
	} catch (e) {
		console.error('Error reading learner XP from storage', e);
	}
	return mockUserLearningProfile.totalXp;
};

export const addLearnerXp = (points) => {
	try {
		const current = getLearnerXp();
		const updated = current + points;
		localStorage.setItem('kampusx_learner_xp', updated.toString());
		mockUserLearningProfile.totalXp = updated;
		// Dispatch custom event so listeners can update in real-time
		window.dispatchEvent(
			new CustomEvent('kampusx_xp_updated', { detail: { xp: updated, added: points } }),
		);
		return updated;
	} catch (e) {
		console.error('Error saving learner XP', e);
		return mockUserLearningProfile.totalXp + points;
	}
};

export const getLessonMicroQuizStatus = (lessonId) => {
	try {
		const saved = localStorage.getItem(`kampusx_mq_${lessonId}`);
		return saved === 'completed';
	} catch (e) {
		return false;
	}
};

export const setLessonMicroQuizCompleted = (lessonId) => {
	try {
		localStorage.setItem(`kampusx_mq_${lessonId}`, 'completed');
		window.dispatchEvent(
			new CustomEvent('kampusx_microquiz_completed', { detail: { lessonId } }),
		);
	} catch (e) {
		console.error('Error saving micro-quiz status', e);
	}
};

/**
 * Comprehensive Summative Module Quizzes (5 - 8 questions per module)
 * Used by QuizPage.jsx and ReflectionPage.jsx
 */
export const mockModuleQuizzes = {
	'mod-arch-101': [
		{
			id: 'mqz-1',
			q: 'Berdasarkan kaidah arsitektur REST, apa karakteristik utama yang membedakan HTTP method PUT dan PATCH?',
			options: [
				{
					key: 'A',
					text: 'PUT digunakan untuk membuat resource baru, sedangkan PATCH untuk menghapus resource.',
				},
				{
					key: 'B',
					text: 'PUT menggantikan seluruh representasi resource (full replacement), sedangkan PATCH menerapkan modifikasi parsial (partial update).',
				},
				{
					key: 'C',
					text: 'PUT tidak bersifat idempotent, sedangkan PATCH selalu idempotent.',
				},
				{
					key: 'D',
					text: 'PUT hanya menerima format XML, sedangkan PATCH menerima format JSON.',
				},
			],
			correct: 'B',
			correctAnswer: 1,
			explanation:
				'Sesuai RFC 7231 dan RFC 5789, PUT merepresentasikan penggantian representasi resource secara menyeluruh, sedangkan PATCH digunakan untuk partial update pada atribut tertentu saja.',
		},
	],
	1: [
		{
			id: 'dt-1',
			q: 'Apa langkah pertama yang harus dilakukan dalam proses 5-tahap Design Thinking d.school?',
			options: [
				{ key: 'A', text: 'Membuat prototype produk secepat mungkin.' },
				{
					key: 'B',
					text: 'Berempati (Empathize) untuk memahami kebutuhan mendalam pengguna.',
				},
				{ key: 'C', text: 'Melakukan testing langsung ke pasar luas.' },
				{ key: 'D', text: 'Menentukan harga jual dan strategi monetisasi.' },
			],
			correct: 'B',
			correctAnswer: 1,
			explanation:
				'Empathize adalah fondasi human-centered design untuk mengesampingkan asumsi desainer dan menyelami permasalahan nyata pengguna.',
		},
		{
			id: 'dt-2',
			q: 'Dalam tahap Define pada Design Thinking, output utama yang dihasilkan oleh tim inovasi adalah:',
			options: [
				{ key: 'A', text: 'Source code aplikasi mobile' },
				{
					key: 'B',
					text: 'Problem Statement yang jelas dalam format "Point of View" (POV)',
				},
				{ key: 'C', text: 'Laporan neraca keuangan perusahaan' },
				{ key: 'D', text: 'Mockup wireframe interaktif' },
			],
			correct: 'B',
			correctAnswer: 1,
			explanation:
				'Tahap Define menyaring temuan dari fase Empathize menjadi Problem Statement (POV) yang actionable dan terpusat pada manusia.',
		},
	],
};

/**
 * Master catalog modules data supporting hybrid quiz (microQuiz + moduleQuiz)
 */
export const mockModulesData = {
	'mod-arch-101': {
		id: 'mod-arch-101',
		title: 'Web Application Architecture & REST API Design',
		category: 'System Architecture',
		passingScore: 75,
		lessons: [
			{
				id: 'les-1',
				number: 1,
				title: 'Fondasi RESTful Semantic & URI Naming Convention',
				microQuiz: mockLessonMicroQuizzes['les-1'],
			},
			{
				id: 'les-2',
				number: 2,
				title: 'HTTP Status Codes, Error Handling & RFC 7807',
				microQuiz: mockLessonMicroQuizzes['les-2'],
			},
			{
				id: 'les-3',
				number: 3,
				title: 'Diagnostic Checkpoint: REST Principles Assessment',
				microQuiz: mockLessonMicroQuizzes['les-3'],
			},
			{
				id: 'les-4',
				number: 4,
				title: 'Scalable Endpoints, Idempotency & Rate Limiting',
				microQuiz: mockLessonMicroQuizzes['les-4'],
			},
			{
				id: 'les-5',
				number: 5,
				title: 'Interactive Code Lab: Implementing Idempotency Middleware',
				microQuiz: mockLessonMicroQuizzes['les-5'],
			},
			{
				id: 'les-6',
				number: 6,
				title: 'Refleksi Diri SRL & Ringkasan Modul REST API',
				microQuiz: mockLessonMicroQuizzes['les-6'],
			},
		],
		moduleQuiz: mockModuleQuizzes['mod-arch-101'],
	},
	1: {
		id: '1',
		title: 'Pengenalan Design Thinking untuk Pemula',
		category: 'Design Thinking',
		passingScore: 75,
		lessons: [
			{
				id: 'les-1',
				number: 1,
				title: 'Prinsip Human-Centered Empathy',
				microQuiz: mockLessonMicroQuizzes['les-1'],
			},
			{
				id: 'les-2',
				number: 2,
				title: 'Perumusan Masalah & Point of View (POV)',
				microQuiz: mockLessonMicroQuizzes['les-2'],
			},
			{
				id: 'les-3',
				number: 3,
				title: 'Ideasi Solusi & Crazy Eights',
				microQuiz: mockLessonMicroQuizzes['les-3'],
			},
			{
				id: 'les-4',
				number: 4,
				title: 'Low-Fidelity Prototyping & Testing',
				microQuiz: mockLessonMicroQuizzes['les-4'],
			},
		],
		moduleQuiz: mockModuleQuizzes['1'],
	},
	2: {
		id: '2',
		title: 'Teknik Presentasi yang Memukau Audiens',
		category: 'Public Speaking',
		passingScore: 75,
		lessons: [
			{
				id: 'les-1',
				number: 1,
				title: 'Struktur Cerita Presentasi',
				microQuiz: mockLessonMicroQuizzes['les-1'],
			},
			{
				id: 'les-2',
				number: 2,
				title: 'Bahasa Tubuh & Olah Vokal',
				microQuiz: mockLessonMicroQuizzes['les-2'],
			},
		],
		moduleQuiz: mockModuleQuizzes['mod-arch-101'],
	},
	3: {
		id: '3',
		title: 'Dasar-dasar Kepemimpinan Tim Efektif',
		category: 'Leadership',
		passingScore: 75,
		lessons: [
			{
				id: 'les-1',
				number: 1,
				title: 'Membangun Psychological Safety',
				microQuiz: mockLessonMicroQuizzes['les-1'],
			},
			{
				id: 'les-2',
				number: 2,
				title: 'Delegasi & Feedback Konstruktif',
				microQuiz: mockLessonMicroQuizzes['les-2'],
			},
		],
		moduleQuiz: mockModuleQuizzes['mod-arch-101'],
	},
	4: {
		id: '4',
		title: 'Deep Work: Fokus Tanpa Distraksi Digital',
		category: 'Produktivitas',
		passingScore: 75,
		lessons: [
			{
				id: 'les-1',
				number: 1,
				title: 'Aturan 4 Disiplin Deep Work',
				microQuiz: mockLessonMicroQuizzes['les-1'],
			},
			{
				id: 'les-2',
				number: 2,
				title: 'Mengeliminasi Distraksi Notifikasi',
				microQuiz: mockLessonMicroQuizzes['les-2'],
			},
		],
		moduleQuiz: mockModuleQuizzes['mod-arch-101'],
	},
};
