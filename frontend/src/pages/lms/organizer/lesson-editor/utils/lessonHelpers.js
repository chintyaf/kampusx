import { useState, useEffect } from 'react';

export const uid = () => Math.random().toString(36).slice(2, 9);

export const makeOption = (text = '') => ({ id: uid(), text });

export const makeQuestion = () => ({
	id: uid(),
	text: '',
	options: [makeOption(), makeOption(), makeOption(), makeOption()],
	correct: null,
	explanation: '',
});

export const makeBlank = (title = '') => ({
	title,
	summary: '',
	body: '',
	attachments: [],
	format: 'article',
	duration: 5,
	xp: 10,
	prerequisite: false,
	tags: [],
	status: 'draft',
	quiz: { passingScore: 70, maxAttempts: 3, graded: true, questions: [] },
});

export const wordCount = (s) => (s && s.trim() ? s.trim().split(/\s+/).length : 0);

export const questionComplete = (q) =>
	!!q.text.trim() &&
	q.options.filter((o) => o.text.trim()).length >= 2 &&
	!!q.correct &&
	q.options.some((o) => o.id === q.correct && o.text.trim());

export const formatSize = (bytes) =>
	bytes >= 1048576
		? `${(bytes / 1048576).toFixed(1)} MB`
		: `${Math.max(1, Math.round(bytes / 1024))} KB`;

export const useMediaQuery = (query) => {
	const [matches, setMatches] = useState(() => window.matchMedia(query).matches);
	useEffect(() => {
		const mq = window.matchMedia(query);
		const handler = (e) => setMatches(e.matches);
		mq.addEventListener('change', handler);
		return () => mq.removeEventListener('change', handler);
	}, [query]);
	return matches;
};

export default {
	uid,
	makeOption,
	makeQuestion,
	makeBlank,
	wordCount,
	questionComplete,
	formatSize,
	useMediaQuery,
};
