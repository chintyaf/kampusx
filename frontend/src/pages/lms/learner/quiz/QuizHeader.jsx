import React from 'react';
import { Container, Button } from 'react-bootstrap';
import { ChevronLeft, Clock, Send } from 'lucide-react';
import { formatTime, LOW_TIME_SECONDS } from './useQuizSession';

const QuizHeader = ({ title, timeLeft, submitting, canSubmit, onBack, onSubmit }) => (
	<div className="qz-header">
		<Container>
			<div className="d-flex align-items-center justify-content-between flex-wrap gap-2">
				<div className="d-flex align-items-center gap-3">
					<button className="qz-back" onClick={onBack}>
						<ChevronLeft size={18} /> Silabus
					</button>
					<div className="qz-divider" />
					<div>
						<span className="badge fw-bold text-uppercase me-2 qz-type-badge">
							Summative Quiz
						</span>
						<span className="qz-title">{title}</span>
					</div>
				</div>

				<div className="d-flex align-items-center gap-3">
					{timeLeft != null && (
						<div
							className={`qz-timer ${timeLeft <= LOW_TIME_SECONDS ? 'is-low' : ''}`}
							title="Waktu Tersisa"
						>
							<Clock size={16} />
							<span>{formatTime(timeLeft)}</span>
						</div>
					)}
					<span title={canSubmit ? '' : 'Jawab semua soal untuk mengirim'}>
						<Button
							size="sm"
							className="qz-btn shadow-sm border-0"
							disabled={submitting || !canSubmit}
							onClick={onSubmit}
						>
							<Send size={14} />
							{submitting ? 'Mengirim...' : 'Kirim Jawaban'}
						</Button>
					</span>
				</div>
			</div>
		</Container>
	</div>
);

export default QuizHeader;
