// ============================================================================
// LEARNING PATH DATA (Curriculum, Modules, Badges, & Metrics)
// ============================================================================

export const MOCK_LEARNING_PATH = {
	id: 'lp-1',
	slug: 'fullstack-ai-web-architecture',
	title: 'Full-Stack AI-Powered Web Architecture',
	badge: 'LEARNING PATH',
	category: 'AI & Web Architecture',
	level: 'Menengah',
	description:
		'Kurikulum end-to-end terstruktur untuk merancang, mengoptimalkan, dan mengoperasikan sistem modern Full-Stack & Generative AI berbasis Retrieval-Augmented Generation (RAG) kelas enterprise dari nol hingga production deployment.',
	metrics: {
		moduleCount: 6,
		totalHours: '5.0 Jam',
		enrolledCount: '2,540 Enrolled',
		rating: 4.95,
		reviewsCount: 382,
		updatedAt: 'Sep 2026',
		completedModules: 2,
		progressPercent: 33,
		averageQuizScore: 91,
		currentStreakDays: 5,
	},
	instructor: {
		name: 'Dr. Reza Fauzi',
		title: 'AI Engineering Lead @ Google & Ex-DeepMind',
		avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=240&q=80',
		rating: 4.95,
		coursesCount: 12,
		bio: 'Ex-DeepMind Researcher with 10+ years specializing in Distributed Systems, LLMs, and Vector Retrieval Architectures.',
	},
	learningObjectives: [
		'Merancang arsitektur Retrieval-Augmented Generation (RAG) tangguh & scalable.',
		'Menguasai strategi semantic chunking dan hybrid search (BM25 + Dense Vectors).',
		'Mengintegrasikan Vector Databases (Qdrant, Pinecone, pgvector) dengan latensi sub-100ms.',
		'Menerapkan Guardrails, hallucination detection, dan metrik RAG Triad evaluation.',
		'Optimasi Fine-Tuning LoRA/QLoRA untuk model embedding dan open-source LLM.',
		'Men-deploy pipeline AI ke cloud Kubernetes dengan CI/CD otomatis & smart contract certification.',
	],
	modules: [
		{
			id: 'mod-1',
			number: 1,
			title: 'LLM Fundamentals & Modern Prompt Engineering',
			duration: '45 min',
			lessonCount: 4,
			status: 'completed', // completed | in_progress | locked
			description:
				'Konsep dasar arsitektur Transformer, attention mechanism, Chain-of-Thought, ReAct framework, dan zero-shot in-context learning.',
			lessons: [
				{
					type: 'video',
					title: 'Transformer Core & Attention Mechanism',
					duration: '12 min',
					completed: true,
				},
				{
					type: 'article',
					title: 'Structured Prompting Strategies',
					duration: '10 min',
					completed: true,
				},
				{
					type: 'quiz',
					title: 'Checkpoint 1: In-Context Learning Quiz',
					duration: '8 min',
					completed: true,
				},
				{
					type: 'reflection',
					title: 'SRL Reflection: Prompt Design Habit',
					duration: '5 min',
					completed: true,
				},
			],
		},
		{
			id: 'mod-2',
			number: 2,
			title: 'Vector Databases, Embeddings & Semantic Indexing',
			duration: '50 min',
			lessonCount: 4,
			status: 'completed',
			description:
				'Embedding model embeddings, similarity distance metrics (Cosine vs Dot Product), HNSW graphs, dan konfigurasi vector indexing.',
			lessons: [
				{
					type: 'video',
					title: 'Embedding Models & Vector Spaces',
					duration: '15 min',
					completed: true,
				},
				{
					type: 'article',
					title: 'Comparing HNSW, IVFFlat, & ScaNN',
					duration: '12 min',
					completed: true,
				},
				{
					type: 'quiz',
					title: 'Vector Indexing Assessment (Score: 92/100)',
					duration: '10 min',
					completed: true,
				},
				{
					type: 'reflection',
					title: 'SRL Reflection: Knowledge Representation',
					duration: '5 min',
					completed: true,
				},
			],
		},
		{
			id: 'mod-3',
			number: 3,
			title: 'Advanced RAG System Architecture & Hybrid Retrieval',
			duration: '60 min',
			lessonCount: 4,
			status: 'in_progress',
			description:
				'Arsitektur RAG modern: recursive character chunking, parent document retrieval, hybrid search (Sparse BM25 + Dense Vectors), dan cross-encoder re-ranking.',
			lessons: [
				{
					type: 'video',
					title: 'Chunking Strategies: Semantic vs Sliding Window',
					duration: '5 min',
					completed: true,
				},
				{
					type: 'article',
					title: 'Hybrid Retrieval & Cross-Encoder Re-Ranking',
					duration: '12 min',
					completed: false,
				},
				{
					type: 'quiz',
					title: 'Quiz: Production RAG Diagnostic Assessment',
					duration: '10 min',
					completed: false,
				},
				{
					type: 'reflection',
					title: 'Reflection Session: Self-Regulated Learning Review',
					duration: '5 min',
					completed: false,
				},
			],
		},
		{
			id: 'mod-4',
			number: 4,
			title: 'Fine-Tuning Domain LLMs with LoRA & QLoRA',
			duration: '45 min',
			lessonCount: 4,
			status: 'locked',
			description:
				'Teknik parameter-efficient fine-tuning (PEFT), kuantisasi 4-bit, unsloth acceleration, dan dataset curation untuk downstream tasks.',
			lessons: [
				{
					type: 'video',
					title: 'PEFT, LoRA & Quantization Fundamentals',
					duration: '15 min',
					completed: false,
				},
				{
					type: 'article',
					title: 'Data Cleaning & Instruction Dataset Formatting',
					duration: '12 min',
					completed: false,
				},
				{
					type: 'quiz',
					title: 'Model Adaptation Evaluation',
					duration: '10 min',
					completed: false,
				},
				{
					type: 'reflection',
					title: 'SRL Reflection: Technical Mastery',
					duration: '5 min',
					completed: false,
				},
			],
		},
		{
			id: 'mod-5',
			number: 5,
			title: 'LLM Evaluation, RAG Triad & Guardrails Security',
			duration: '40 min',
			lessonCount: 4,
			status: 'locked',
			description:
				'Evaluasi otomatis dengan Ragas dan TruLens (Context Relevance, Groundedness, Answer Relevance), serta deteksi prompt injection & PII leaks.',
			lessons: [
				{
					type: 'video',
					title: 'RAG Triad Metrics & Benchmark Curation',
					duration: '12 min',
					completed: false,
				},
				{
					type: 'article',
					title: 'Implementing NeMo Guardrails & Llama Guard',
					duration: '10 min',
					completed: false,
				},
				{
					type: 'quiz',
					title: 'Security & Robustness Assessment',
					duration: '10 min',
					completed: false,
				},
				{
					type: 'reflection',
					title: 'SRL Reflection: Ethical AI & Safety',
					duration: '5 min',
					completed: false,
				},
			],
		},
		{
			id: 'mod-6',
			number: 6,
			title: 'Production Deployment, CI/CD & Observability',
			duration: '50 min',
			lessonCount: 4,
			status: 'locked',
			description:
				'Containerization dengan Docker, serving throughput tinggi via vLLM / Ollama, OpenTelemetry tracing, dan smart contract blockchain graduation.',
			lessons: [
				{
					type: 'video',
					title: 'vLLM Architecture & High-Throughput Serving',
					duration: '15 min',
					completed: false,
				},
				{
					type: 'article',
					title: 'Kubernetes Helm Deployment & Tracing Setup',
					duration: '15 min',
					completed: false,
				},
				{
					type: 'quiz',
					title: 'Final Comprehensive Exam',
					duration: '15 min',
					completed: false,
				},
				{
					type: 'reflection',
					title: 'Final SRL Capstone & Smart Contract Issuance',
					duration: '5 min',
					completed: false,
				},
			],
		},
	],
	badges: [
		{ name: 'LLM Core', color: '#028090', bg: '#e0f2fe', icon: 'Brain', unlocked: true },
		{ name: 'RAG Expert', color: '#6c5ce7', bg: '#f5f3ff', icon: 'Layers', unlocked: true },
		{
			name: 'Fast Learner',
			color: '#f59e0b',
			bg: '#fef3c7',
			icon: 'Flame',
			unlocked: true,
		},
		{
			name: 'AI Builder',
			color: '#10b981',
			bg: '#ecfdf5',
			icon: 'Sparkles',
			unlocked: false,
		},
		{
			name: 'Deployed ML',
			color: '#3b82f6',
			bg: '#eff6ff',
			icon: 'ShieldCheck',
			unlocked: false,
		},
		{
			name: 'Path Completer',
			color: '#ec4899',
			bg: '#fdf2f8',
			icon: 'Award',
			unlocked: false,
		},
	],
};

// Aliases for Learning Path lookup
export const LEARNING_PATHS_REGISTRY = {
	'lp-1': MOCK_LEARNING_PATH,
	'lp-rag-ai': MOCK_LEARNING_PATH,
};

export const getLearningPath = (pathId) => {
	return LEARNING_PATHS_REGISTRY[pathId] || MOCK_LEARNING_PATH;
};
