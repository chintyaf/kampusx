import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { quizApi } from './quizApi';

export const LOW_TIME_SECONDS = 120;

export const formatTime = (s) =>
	`${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

const errorMessage = (err) =>
	err?.response?.data?.message || err?.message || 'Terjadi kesalahan. Silakan coba lagi.';

export const useQuizSession = () => {
	const { slug, moduleId } = useParams();
	const navigate = useNavigate();
	// Sesuai LmsRoutes: /learner/learning-paths/:slug/modules/:moduleId
	const moduleUrl = `/learner/learning-paths/${slug}/modules/${moduleId}`;

	const [quiz, setQuiz] = useState(null);
	const [attemptId, setAttemptId] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [submitError, setSubmitError] = useState(null);
	const [current, setCurrent] = useState(0);
	const [answers, setAnswers] = useState({}); // { [questionId]: optionId }
	const [flags, setFlags] = useState({}); // { [questionId]: true }
	const [timeLeft, setTimeLeft] = useState(null); // null = tanpa batas waktu
	const [submitting, setSubmitting] = useState(false);
	const [showSubmitModal, setShowSubmitModal] = useState(false);

	const answersRef = useRef(answers);
	answersRef.current = answers;
	const deadline = useRef(null);
	const busy = useRef(false);

	// Mulai / lanjutkan attempt
	useEffect(() => {
		let cancelled = false;
		quizApi
			.start(moduleId)
			.then(({ quiz, attempt }) => {
				if (cancelled) return;
				setQuiz(quiz);
				setAttemptId(attempt.id);
				setAnswers(attempt.answers ?? {});
				setTimeLeft(attempt.remaining_seconds);
				deadline.current =
					attempt.remaining_seconds == null
						? null
						: Date.now() + attempt.remaining_seconds * 1000;
			})
			.catch((err) => !cancelled && setError(errorMessage(err)))
			.finally(() => !cancelled && setLoading(false));
		return () => {
			cancelled = true;
		};
	}, [moduleId]);

	// Timer berbasis deadline (tidak drift saat tab di-throttle)
	useEffect(() => {
		if (loading || deadline.current == null) return;
		const tick = () =>
			setTimeLeft(Math.max(0, Math.ceil((deadline.current - Date.now()) / 1000)));
		tick();
		const id = setInterval(tick, 1000);
		return () => clearInterval(id);
	}, [loading, attemptId]);

	const submit = useCallback(async () => {
		if (busy.current || !attemptId || !quiz) return;

		// Submit manual hanya boleh jika semua soal terjawab.
		// Saat waktu habis, jawaban yang ada tetap dikirim (auto-submit).
		const allAnswered = quiz.questions.every((q) => answersRef.current[q.id] != null);
		const timeUp = deadline.current != null && Date.now() >= deadline.current;
		if (!allAnswered && !timeUp) return;

		busy.current = true;
		setSubmitting(true);
		setSubmitError(null);
		setShowSubmitModal(false);

		try {
			const res = await quizApi.submit(moduleId, attemptId, answersRef.current);

			// Bentuk lama dipertahankan agar ReflectionPage tetap kompatibel
			const userAnswers = {};
			quiz.questions.forEach((q, i) => {
				const opt = q.options.find((o) => o.id === answersRef.current[q.id]);
				if (opt) userAnswers[i] = opt.key;
			});
			const quizResult = {
				moduleId,
				moduleTitle: quiz.title,
				attemptId,
				score: res.score,
				correctCount: res.correct_count,
				totalQuestions: res.total_questions,
				passingScore: res.passing_score,
				isPassed: res.is_passed,
				userAnswers,
				completedAt: res.completed_at,
			};

			try {
				localStorage.setItem(`kampusx_quiz_result_${moduleId}`, JSON.stringify(quizResult));
			} catch (e) {
				console.error('Error saving quiz result', e);
			}
			navigate(`${moduleUrl}/reflection`, { replace: true, state: quizResult });
		} catch (err) {
			busy.current = false;
			setSubmitting(false);
			setSubmitError(errorMessage(err));
		}
	}, [attemptId, quiz, moduleId, moduleUrl, navigate]);

	// Auto-submit saat waktu habis
	useEffect(() => {
		if (timeLeft === 0) submit();
	}, [timeLeft, submit]);

	// Peringatan sebelum menutup tab saat kuis berjalan
	useEffect(() => {
		if (!attemptId || submitting) return;
		const warn = (e) => e.preventDefault();
		window.addEventListener('beforeunload', warn);
		return () => window.removeEventListener('beforeunload', warn);
	}, [attemptId, submitting]);

	const questions = quiz?.questions ?? [];
	const question = questions[current] ?? null;

	const selectOption = (optionId) => {
		setAnswers((prev) => ({ ...prev, [question.id]: optionId }));
		// Autosave; submit tetap mengirim seluruh jawaban sebagai sumber akhir
		quizApi.saveAnswer(moduleId, attemptId, question.id, optionId).catch(() => {});
	};

	const toggleFlag = () => setFlags((prev) => ({ ...prev, [question.id]: !prev[question.id] }));

	const answeredCount = questions.filter((q) => answers[q.id] != null).length;
	const canSubmit = questions.length > 0 && answeredCount === questions.length;

	return {
		moduleUrl,
		quiz,
		questions,
		question,
		current,
		answers,
		flags,
		timeLeft,
		loading,
		error,
		submitError,
		submitting,
		showSubmitModal,
		answeredCount,
		canSubmit,
		progressPercent: questions.length ? Math.round((answeredCount / questions.length) * 100) : 0,
		selectedOptionId: question ? (answers[question.id] ?? null) : null,
		isFlagged: question ? !!flags[question.id] : false,
		selectOption,
		toggleFlag,
		goTo: setCurrent,
		next: () => setCurrent((i) => Math.min(i + 1, questions.length - 1)),
		prev: () => setCurrent((i) => Math.max(i - 1, 0)),
		submit,
		setShowSubmitModal,
		dismissSubmitError: () => setSubmitError(null),
	};
};
