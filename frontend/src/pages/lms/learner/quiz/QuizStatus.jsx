import React from 'react';
import { Spinner, Button } from 'react-bootstrap';
import { AlertTriangle } from 'lucide-react';

export const QuizLoading = () => (
	<div className="qz-page">
		<div className="qz-center">
			<Spinner animation="border" variant="primary" />
			<span>Menyiapkan kuis...</span>
		</div>
	</div>
);

export const QuizError = ({ message, onBack }) => (
	<div className="qz-page">
		<div className="qz-center">
			<AlertTriangle size={32} color="var(--danger-text)" />
			<div>
				<h5 className="fw-bold mb-1 text-dark">Kuis tidak dapat dibuka</h5>
				<p>{message}</p>
			</div>
			<Button className="qz-btn border-0 px-4" onClick={onBack}>
				Kembali ke modul
			</Button>
		</div>
	</div>
);
