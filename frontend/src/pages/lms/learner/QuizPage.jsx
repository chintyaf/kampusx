import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Alert, Button } from 'react-bootstrap';
import {
	QuizHeader,
	QuestionNavigator,
	QuestionCard,
	SubmitConfirmModal,
	QuizLoading,
	QuizError,
	useQuizSession,
} from './quiz';
import './quiz/quiz.css';

const QuizPage = () => {
	const navigate = useNavigate();
	const s = useQuizSession();
	const goBack = () => navigate(s.moduleUrl);

	if (s.loading) return <QuizLoading />;
	if (s.error || !s.quiz || !s.question) {
		return <QuizError message={s.error ?? 'Kuis belum tersedia.'} onBack={goBack} />;
	}

	return (
		<div className="qz-page">
			<QuizHeader
				title={s.quiz.title}
				timeLeft={s.timeLeft}
				submitting={s.submitting}
				canSubmit={s.canSubmit}
				onBack={goBack}
				onSubmit={() => s.setShowSubmitModal(true)}
			/>

			<Container style={{ paddingTop: 28 }}>
				{s.submitError && (
					<Alert variant="danger" dismissible onClose={s.dismissSubmitError}>
						<div className="d-flex align-items-center justify-content-between gap-3">
							<span>{s.submitError}</span>
							<Button size="sm" variant="outline-danger" onClick={s.submit}>
								Coba lagi
							</Button>
						</div>
					</Alert>
				)}

				<Row className="g-4">
					<Col lg={3}>
						<QuestionNavigator
							questions={s.questions}
							current={s.current}
							answers={s.answers}
							flags={s.flags}
							answeredCount={s.answeredCount}
							progressPercent={s.progressPercent}
							onSelect={s.goTo}
						/>
					</Col>
					<Col lg={9}>
						<QuestionCard
							question={s.question}
							index={s.current}
							total={s.questions.length}
							passingScore={s.quiz.passing_score}
							selectedOptionId={s.selectedOptionId}
							isFlagged={s.isFlagged}
							canSubmit={s.canSubmit}
							onSelect={s.selectOption}
							onPrev={s.prev}
							onNext={s.next}
							onToggleFlag={s.toggleFlag}
							onSubmit={() => s.setShowSubmitModal(true)}
						/>
					</Col>
				</Row>
			</Container>

			<SubmitConfirmModal
				show={s.showSubmitModal}
				answeredCount={s.answeredCount}
				total={s.questions.length}
				submitting={s.submitting}
				onHide={() => s.setShowSubmitModal(false)}
				onConfirm={s.submit}
			/>
		</div>
	);
};

export default QuizPage;
