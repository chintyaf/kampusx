import React, { useState } from 'react';
import { Modal, Form, Button, Alert } from 'react-bootstrap';

// Data statis didefinisikan di luar komponen untuk mencegah re-allocation saat render
const STRATEGY_OPTIONS = [
	{ id: 'Catat Poin', label: 'Catat Poin' },
	{ id: 'Fokus Membaca', label: 'Fokus Membaca' },
	{ id: 'Langsung Kuis', label: 'Langsung Kuis' },
];

const QUICK_GOALS = ['Pahami Konsep Dasar', 'Tuntaskan Semua Unit', 'Siap Skor Kuis 100%'];

const EFFICACY_LEVELS = [
	{ level: 1, emoji: '😟', label: 'Masih asing' },
	{ level: 2, emoji: '😐', label: 'Tahu sedikit' },
	{ level: 3, emoji: '🙂', label: 'Cukup mengerti' },
	{ level: 4, emoji: '😊', label: 'Sudah paham' },
	{ level: 5, emoji: '🚀', label: 'Sangat menguasai' },
];

/**
 * SRLForethoughtModal
 * Pop-up interseptor metakognitif (Fase 1 Forethought Self-Regulated Learning).
 */
export const SRLForethoughtModal = ({
	isOpen,
	onClose,
	onComplete,
	enrollmentId = 1,
	recommendedTime = 15,
	moduleTitle = '',
}) => {
	const [goal, setGoal] = useState('');
	const [plan, setPlan] = useState(String(recommendedTime));
	const [strategy, setStrategy] = useState('Fokus Membaca');
	const [selfEfficacy, setSelfEfficacy] = useState(4);
	const [errorMessage, setErrorMessage] = useState('');

	const handleSubmit = (e) => {
		e.preventDefault();
		const trimmedGoal = goal.trim();

		if (!trimmedGoal) {
			setErrorMessage('Tentukan tujuan belajar Anda sebelum memulai.');
			return;
		}

		setErrorMessage('');

		const payload = {
			enrollment_id: enrollmentId,
			goal: trimmedGoal,
			plan: `${plan} menit`,
			strategy,
			motivation: strategy,
			self_efficacy: Number(selfEfficacy),
			timestamp: new Date().toISOString(),
		};

		if (typeof onComplete === 'function') {
			onComplete(payload);
		}
	};

	return (
		<Modal
			show={isOpen}
			onHide={onClose}
			centered
			backdrop="static"
			keyboard
			contentClassName="shadow border-0 overflow-hidden bg-white"
			style={{
				margin: 'auto',
				fontFamily: 'var(--font)',
				borderRadius: 'var(--radius-lg)',
			}}
		>
			{/* Modal Header */}
			<Modal.Header
				closeButton
				className="py-3 px-4 border-bottom bg-white"
				style={{ borderColor: 'var(--neutral-border)' }}
			>
				<Modal.Title style={{ color: 'var(--text)' }}>
					<div
						className="d-flex align-items-center gap-2"
						style={{ fontSize: 'var(--font-sm)' }}
					>
						<span>Kesiapan Belajar (SRL Forethought)</span>
					</div>
					{moduleTitle && (
						<span
							className="d-block mt-1 fw-normal"
							style={{ fontSize: '10px', color: 'var(--text-muted)' }}
						>
							Modul: {moduleTitle}
						</span>
					)}
				</Modal.Title>
			</Modal.Header>

			<Form onSubmit={handleSubmit}>
				<Modal.Body className="p-4">
					{errorMessage && (
						<Alert
							className="py-2 px-3 mb-3 border"
							style={{
								backgroundColor: 'var(--error-bg)',
								color: 'var(--error-text)',
								borderColor: 'var(--error-border)',
								fontSize: 'var(--font-xs)',
								borderRadius: 'var(--radius-sm)',
							}}
						>
							{errorMessage}
						</Alert>
					)}

					{/* 1. Target Belajar */}
					<Form.Group className="mb-4" controlId="learningGoal">
						<div className="d-flex justify-content-between align-items-center mb-1">
							<Form.Label
								className="fw-bold mb-0"
								style={{ fontSize: 'var(--font-sm)', color: 'var(--text)' }}
							>
								Tentukan target belajar Anda
								<span style={{ color: 'var(--error-text)' }}>*</span>
							</Form.Label>
							<span
								style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)' }}
							>
								Task Analysis
							</span>
						</div>
						<Form.Control
							type="text"
							size="sm"
							className="py-2 px-3"
							placeholder="Contoh: Menguasai state dan hooks..."
							value={goal}
							onChange={(e) => setGoal(e.target.value)}
							style={{
								borderRadius: 'var(--radius-md)',
								borderColor: 'var(--neutral-border)',
								fontSize: 'var(--font-sm)',
								color: 'var(--text)',
							}}
							required
						/>
						<div className="d-flex gap-2 mt-2 flex-wrap">
							{QUICK_GOALS.map((item) => (
								<Button
									key={item}
									type="button"
									variant="light"
									size="sm"
									className="py-1 px-2.5 border"
									style={{
										fontSize: 'var(--font-xs)',
										borderRadius: 'var(--radius-full)',
										backgroundColor: 'var(--color-bg-2)',
										borderColor: 'var(--neutral-border)',
										color: 'var(--text-muted)',
									}}
									onClick={() => setGoal(item)}
								>
									+ {item}
								</Button>
							))}
						</div>
					</Form.Group>

					{/* 2. Alokasi Waktu */}
					<Form.Group className="mb-4" controlId="timePlan">
						<div className="d-flex justify-content-between align-items-center mb-1">
							<Form.Label
								className="fw-bold mb-0"
								style={{ fontSize: 'var(--font-sm)', color: 'var(--text)' }}
							>
								Berapa estimasi waktu yang disiapkan?
							</Form.Label>
						</div>
						<Form.Select
							size="sm"
							className="py-2 px-3"
							value={plan}
							onChange={(e) => setPlan(e.target.value)}
							style={{
								borderRadius: 'var(--radius-md)',
								borderColor: 'var(--neutral-border)',
								fontSize: 'var(--font-sm)',
								color: 'var(--text)',
							}}
						>
							<option value="10">10 Menit — Microlearning Kilat</option>
							<option value="15">15 Menit — Sesuai Rekomendasi Sistem</option>
							<option value="20">20 Menit — Standar Pemahaman Modul</option>
							<option value="30">30 Menit — Deep Focus & Catatan Lengkap</option>
						</Form.Select>
					</Form.Group>

					{/* 3. Taktik Kognitif */}
					<div className="mb-4">
						<div className="d-flex justify-content-between align-items-center mb-2">
							<Form.Label
								className="fw-bold mb-0"
								style={{ fontSize: 'var(--font-sm)', color: 'var(--text)' }}
							>
								Metode belajar apa yang akan kamu gunakan?
							</Form.Label>
						</div>
						<div className="d-flex gap-2">
							{STRATEGY_OPTIONS.map((item) => {
								const isActive = strategy === item.id;
								return (
									<Button
										key={item.id}
										type="button"
										size="sm"
										style={{
											fontSize: 'var(--font-xs)',
											borderRadius: 'var(--radius-full)',
											backgroundColor: isActive
												? 'var(--text)'
												: 'var(--color-bg-2)',
											color: isActive ? 'var(--color-white)' : 'var(--text)',
											borderColor: isActive
												? 'var(--text)'
												: 'var(--neutral-border)',
										}}
										onClick={() => setStrategy(item.id)}
									>
										{item.label}
									</Button>
								);
							})}
						</div>
					</div>

					{/* 4. Efikasi Diri */}
					<div
						className="p-3 border"
						style={{
							backgroundColor: 'var(--color-bg-2)',
							borderRadius: 'var(--radius)',
							borderColor: 'var(--border)',
						}}
					>
						<div className="d-flex justify-content-between align-items-center mb-2">
							<Form.Label
								className="fw-bold mb-0"
								style={{ fontSize: 'var(--font-sm)', color: 'var(--text)' }}
							>
								Seberapa paham kamu dengan materi ini?
							</Form.Label>
						</div>
						<div className="d-flex justify-content-between gap-2">
							{EFFICACY_LEVELS.map((item) => {
								const isSelected = selfEfficacy === item.level;
								return (
									<button
										key={item.level}
										type="button"
										className="flex-fill text-center p-2 border transition-all"
										style={{
											borderRadius: 'var(--radius-md)',
											backgroundColor: isSelected
												? 'var(--text)'
												: 'var(--card)',
											color: isSelected
												? 'var(--color-white)'
												: 'var(--text)',
											borderColor: isSelected
												? 'var(--text)'
												: 'var(--neutral-border)',
											cursor: 'pointer',
										}}
										onClick={() => setSelfEfficacy(item.level)}
										title={`Tingkat ${item.level}: ${item.label}`}
									>
										<div>{item.emoji}</div>
										<div style={{ fontSize: 'var(--font-xs)' }}>
											{item.label}
										</div>
									</button>
								);
							})}
						</div>
					</div>
				</Modal.Body>

				{/* Modal Footer */}
				<Modal.Footer className="border-0 pb-3 px-4 d-flex justify-content-end align-items-center">
					<div className="d-flex gap-2">
						<Button
							type="button"
							variant="light"
							size="sm"
							className="px-3 border"
							onClick={onClose}
							style={{
								backgroundColor: 'var(--card)',
								borderColor: 'var(--neutral-border)',
								color: 'var(--text-muted)',
							}}
						>
							Batal
						</Button>
						<Button type="submit" size="sm" className="px-4 fw-bold border-0">
							Simpan Target & Mulai Belajar
						</Button>
					</div>
				</Modal.Footer>
			</Form>
		</Modal>
	);
};

export default SRLForethoughtModal;
