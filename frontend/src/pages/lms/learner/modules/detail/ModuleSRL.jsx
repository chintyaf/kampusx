import React, { useState } from 'react';
import { Card, Badge, Button, Form } from 'react-bootstrap';
import { Brain, Target, CheckCircle2 } from 'lucide-react';

const ModuleSRL = () => {
	// --- STATE SRL FASE 1: FORETHOUGHT & PLANNING ---
	const [sessionTime, setSessionTime] = useState('15');
	const [selectedStrategy, setSelectedStrategy] = useState('note_taking');
	const [commitmentCheck, setCommitmentCheck] = useState(true);
	const [forethoughtSaved, setForethoughtSaved] = useState(false);

	const handleSaveForethought = () => {
		setForethoughtSaved(true);
		setTimeout(() => setForethoughtSaved(false), 4000);
	};

	const timeOptions = [
		{ val: '15', label: '15m Quick Bite', icon: '⚡' },
		{ val: '30', label: '30m Standar', icon: '🎯' },
		{ val: '45', label: '45m Deep Focus', icon: '🔥' },
	];

	const strategyOptions = [
		{
			id: 'note_taking',
			title: 'Active Note-Taking',
			desc: 'Mencatat insight penting pada tab catatan.',
		},
		{
			id: 'video_quiz',
			title: 'Watch & Checkpoint',
			desc: 'Menonton video lalu lanjut evaluasi kuis.',
		},
		{
			id: 'direct_lab',
			title: 'Direct Code Lab',
			desc: 'Langsung jalankan & verifikasi kode API.',
		},
	];

	return (
		<Card
			className="shadow-sm border-0 mb-4"
			style={{
				borderRadius: 'var(--radius-lg)',
				border: '1px solid var(--neutral-border)',
				backgroundColor: 'var(--card)',
			}}
		>
			<Card.Body className="p-3 p-md-4">
				{/* Header Module */}
				<div className="d-flex align-items-start justify-content-between gap-2 mb-3">
					<div className="d-flex align-items-center gap-2">
						<div
							className="d-flex align-items-center justify-content-center rounded-circle flex-shrink-0"
							style={{
								width: '36px',
								height: '36px',
								backgroundColor: 'var(--primary-light)',
								color: 'var(--primary)',
							}}
						>
							<Brain size={18} />
						</div>
						<div>
							<h5
								className="fw-bold mb-0"
								style={{ color: 'var(--text)', fontSize: '1rem' }}
							>
								Rencanakan Sesi Belajar
							</h5>
							<span style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>
								Tetapkan niat, durasi, dan strategi belajar.
							</span>
						</div>
					</div>
				</div>

				{/* Target Waktu Sesi */}
				<div className="mb-3">
					<div className="d-flex align-items-center justify-content-between mb-2">
						<span
							className="fw-semibold"
							style={{ color: 'var(--text)', fontSize: '0.82rem' }}
						>
							Target Waktu:
						</span>
						<span
							className="fw-bold"
							style={{ color: 'var(--primary)', fontSize: '0.82rem' }}
						>
							{sessionTime} Menit
						</span>
					</div>
					<div className="d-flex gap-2">
						{timeOptions.map((item) => {
							const active = sessionTime === item.val;
							return (
								<button
									key={item.val}
									type="button"
									onClick={() => setSessionTime(item.val)}
									className="btn btn-sm flex-fill d-flex align-items-center justify-content-center gap-1 rounded-2 transition-all"
									style={{
										backgroundColor: active
											? 'var(--primary)'
											: 'var(--neutral-bg)',
										color: active ? 'var(--color-white)' : 'var(--text)',
										border: `1px solid ${active ? 'var(--primary)' : 'var(--neutral-border)'}`,
										fontSize: '0.76rem',
										padding: '0.35rem 0.4rem',
										fontWeight: active ? '600' : '500',
									}}
								>
									{/* <span>{item.icon}</span> */}
									<span>{item.label}</span>
								</button>
							);
						})}
					</div>
				</div>

				{/* Pilihan Strategi Belajar */}
				<div className="mb-3">
					<span
						className="fw-semibold d-block mb-2"
						style={{ color: 'var(--text)', fontSize: '0.82rem' }}
					>
						Strategi Hari Ini:
					</span>
					<div className="d-flex flex-column gap-2">
						{strategyOptions.map((strat) => {
							const active = selectedStrategy === strat.id;
							return (
								<div
									key={strat.id}
									onClick={() => setSelectedStrategy(strat.id)}
									className="p-2 rounded-2 d-flex align-items-start gap-2"
									style={{
										backgroundColor: active
											? 'var(--primary-light)'
											: 'transparent',
										border: `1px solid ${active ? 'var(--primary-border)' : 'var(--neutral-border)'}`,
										cursor: 'pointer',
										transition: 'all 0.15s ease',
									}}
								>
									<Form.Check
										type="radio"
										id={strat.id}
										name="learning_strategy"
										checked={active}
										onChange={() => setSelectedStrategy(strat.id)}
										className="mt-0.5"
									/>
									<div>
										<label
											htmlFor={strat.id}
											className="fw-bold d-block mb-0"
											style={{
												color: 'var(--text)',
												fontSize: '0.82rem',
												cursor: 'pointer',
											}}
										>
											{strat.title}
										</label>
										<span
											style={{
												color: 'var(--text-muted)',
												fontSize: '0.75rem',
											}}
										>
											{strat.desc}
										</span>
									</div>
								</div>
							);
						})}
					</div>
				</div>

				{/* Komitmen */}
				<div
					className="p-2 rounded-2 mb-3 d-flex align-items-center gap-2"
					style={{
						backgroundColor: 'var(--neutral-bg)',
						border: '1px solid var(--neutral-border)',
					}}
				>
					<Form.Check
						type="checkbox"
						id="srl-commitment"
						checked={commitmentCheck}
						onChange={(e) => setCommitmentCheck(e.target.checked)}
						style={{ cursor: 'pointer' }}
					/>
					<label
						htmlFor="srl-commitment"
						className="mb-0 fw-medium"
						style={{ fontSize: '0.78rem', color: 'var(--text)', cursor: 'pointer' }}
					>
						Fokus penuh <strong>{sessionTime} menit</strong> tanpa distraksi.
					</label>
				</div>

				{/* Tombol Simpan & Feedback */}
				<div className="d-flex flex-column gap-2">
					<Button
						size="sm"
						className="w-100 fw-semibold d-inline-flex align-items-center justify-content-center gap-2 border-0"
						style={{
							backgroundColor: 'var(--primary)',
							color: 'var(--color-white)',
							borderRadius: 'var(--radius-md)',
							padding: '0.5rem',
						}}
						onClick={handleSaveForethought}
					>
						<span>Kunci Rencana Belajar (+15 XP)</span>
					</Button>

					{forethoughtSaved && (
						<div className="text-center">
							<span
								className="fw-semibold d-inline-flex align-items-center gap-1"
								style={{ color: 'var(--success-text)', fontSize: '0.78rem' }}
							>
								<CheckCircle2 size={14} />
								Rencana belajar berhasil disimpan!
							</span>
						</div>
					)}
				</div>
			</Card.Body>
		</Card>
	);
};

export default ModuleSRL;
