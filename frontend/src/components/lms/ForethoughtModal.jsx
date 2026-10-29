import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Button, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, GraduationCap, X, Plus, Sparkle } from 'lucide-react';

const defaultStrategies = [
	'Pomodoro',
	'Matikan notifikasi',
	'Catat poin penting',
	'Musik fokus',
];

const ForethoughtModal = () => {
	const navigate = useNavigate();
	const [isOpen, setIsOpen] = useState(false);

	const [sessionGoal, setSessionGoal] = useState('');
	const [selectedStrategies, setSelectedStrategies] = useState([]);
	const [customStrategies, setCustomStrategies] = useState([]);
	const [newStrategy, setNewStrategy] = useState('');
	const [estimatedTime, setEstimatedTime] = useState(25);
	const [confidence, setConfidence] = useState(3);

	const allStrategies = [...defaultStrategies, ...customStrategies];

	const toggleStrategy = (strategy) => {
		setSelectedStrategies((prev) =>
			prev.includes(strategy)
				? prev.filter((s) => s !== strategy)
				: [...prev, strategy]
		);
	};

	const addCustomStrategy = () => {
		const trimmed = newStrategy.trim();
		if (trimmed && !allStrategies.includes(trimmed)) {
			setCustomStrategies((prev) => [...prev, trimmed]);
			setSelectedStrategies((prev) => [...prev, trimmed]);
			setNewStrategy('');
		}
	};

	const moduleId = 1;

	const handleClose = () => {
		setIsOpen(false);
		setSessionGoal('');
		setSelectedStrategies([]);
		setNewStrategy('');
		setConfidence(3);
		setEstimatedTime(25);
	};

	const handleSubmit = (e) => {
		e.preventDefault();
		handleClose();
		navigate(`/learner/modules/${moduleId}`);
	};

	return (
		<>
			{/* Floating Icon Button */}
			<AnimatePresence>
				{!isOpen && (
					<OverlayTrigger
						placement="left"
						overlay={<Tooltip>Mulai Sesi Pembelajaran</Tooltip>}
					>
						<motion.button
							initial={{ scale: 0, opacity: 0 }}
							animate={{ scale: 1, opacity: 1 }}
							exit={{ scale: 0, opacity: 0 }}
							whileHover={{ scale: 1.1 }}
							whileTap={{ scale: 0.9 }}
							onClick={() => setIsOpen(true)}
							style={{
								position: 'fixed',
								bottom: 28,
								right: 28,
								zIndex: 1050,
								background: '#005a87',
								color: '#fff',
								border: 'none',
								borderRadius: '50%',
								width: 52,
								height: 52,
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'center',
								boxShadow: '0 4px 20px rgba(0,90,135,0.3)',
								cursor: 'pointer',
							}}
						>
							<GraduationCap size={22} />
						</motion.button>
					</OverlayTrigger>
				)}
			</AnimatePresence>

			{/* Modal */}
			<AnimatePresence>
				{isOpen && (
					<>
						<motion.div
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
							onClick={handleClose}
							style={{
								position: 'fixed',
								inset: 0,
								background: 'rgba(0,0,0,0.4)',
								zIndex: 1060,
							}}
						/>

						<motion.div
							initial={{ opacity: 0, y: 30 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0, y: 30 }}
							transition={{ type: 'spring', damping: 28, stiffness: 320 }}
							style={{
								position: 'fixed',
								inset: 0,
								zIndex: 1070,
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'center',
								padding: 20,
								pointerEvents: 'none',
							}}
						>
							<div style={{
								width: '100%',
								maxWidth: 480,
								maxHeight: 'calc(100vh - 40px)',
								overflowY: 'auto',
								background: '#fff',
								borderRadius: 16,
								boxShadow: '0 16px 48px rgba(0,0,0,0.15)',
								pointerEvents: 'auto',
							}}>
								{/* Header */}
								<div style={{
									padding: '20px 24px 0',
									display: 'flex',
									justifyContent: 'space-between',
									alignItems: 'center',
								}}>
									<div>
										<h5 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#0f172a' }}>
											Persiapkan Sesi Belajarmu
										</h5>
										<p style={{ margin: '2px 0 0', fontSize: 12, color: '#94a3b8' }}>
											Rencanakan agar belajar lebih efektif
										</p>
									</div>
									<button
										onClick={handleClose}
										style={{
											background: 'none', border: 'none',
											cursor: 'pointer', padding: 4,
											color: '#94a3b8',
										}}
									>
										<X size={18} />
									</button>
								</div>

								{/* Form */}
								<Form onSubmit={handleSubmit} style={{ padding: '20px 24px 24px' }}>
									<Form.Group className="mb-3">
										<Form.Label style={{ fontWeight: 600, fontSize: 12, color: '#334155', marginBottom: 6 }}>
											Target sesi ini
										</Form.Label>
										<Form.Control
											type="text"
											required
											placeholder="Apa yang ingin kamu kuasai?"
											value={sessionGoal}
											onChange={(e) => setSessionGoal(e.target.value)}
											style={{ borderRadius: 8, padding: '10px 12px', fontSize: 13, border: '1px solid #e2e8f0' }}
										/>
									</Form.Group>

									<Form.Group className="mb-3">
										<Form.Label style={{ fontWeight: 600, fontSize: 12, color: '#334155', marginBottom: 6 }}>
											Strategi fokus
										</Form.Label>
										<div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
											{allStrategies.map((s) => {
												const active = selectedStrategies.includes(s);
												return (
													<button
														type="button"
														key={s}
														onClick={() => toggleStrategy(s)}
														style={{
															padding: '6px 12px',
															borderRadius: 20,
															border: active ? '1.5px solid #005a87' : '1px solid #e2e8f0',
															background: active ? '#f0f9ff' : '#fff',
															color: active ? '#005a87' : '#64748b',
															fontWeight: 500,
															fontSize: 12,
															cursor: 'pointer',
															transition: 'all 0.15s ease',
														}}
													>
														{s}
													</button>
												);
											})}
										</div>
										<div style={{ display: 'flex', gap: 6 }}>
											<Form.Control
												type="text"
												placeholder="Tambah strategi sendiri..."
												value={newStrategy}
												onChange={(e) => setNewStrategy(e.target.value)}
												onKeyDown={(e) => {
													if (e.key === 'Enter') {
														e.preventDefault();
														addCustomStrategy();
													}
												}}
												style={{ borderRadius: 8, padding: '8px 12px', fontSize: 12, border: '1px solid #e2e8f0', flex: 1 }}
											/>
											<button
												type="button"
												onClick={addCustomStrategy}
												style={{
													background: '#f8fafc',
													border: '1px solid #e2e8f0',
													borderRadius: 8,
													padding: '0 10px',
													cursor: 'pointer',
													display: 'flex',
													alignItems: 'center',
													color: '#64748b',
												}}
											>
												<Plus size={14} />
											</button>
										</div>
									</Form.Group>

									<Form.Group className="mb-3">
										<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
											<Form.Label style={{ fontWeight: 600, fontSize: 12, color: '#334155', margin: 0 }}>
												Estimasi waktu
											</Form.Label>
											<span style={{ fontSize: 12, fontWeight: 600, color: '#005a87' }}>
												{estimatedTime} menit
											</span>
										</div>
										<Form.Range
											min={5} max={60} step={5}
											value={estimatedTime}
											onChange={(e) => setEstimatedTime(Number(e.target.value))}
										/>
									</Form.Group>

									<Form.Group className="mb-4">
										<Form.Label style={{ fontWeight: 600, fontSize: 12, color: '#334155', marginBottom: 6 }}>
											Tingkat keyakinan
										</Form.Label>
										<div style={{ display: 'flex', gap: 6 }}>
											{[1, 2, 3, 4, 5].map((num) => (
												<button
													type="button"
													key={num}
													onClick={() => setConfidence(num)}
													style={{
														flex: 1,
														padding: '8px 0',
														borderRadius: 8,
														border: confidence === num ? '1.5px solid #005a87' : '1px solid #e2e8f0',
														background: confidence === num ? '#f0f9ff' : '#fff',
														color: confidence === num ? '#005a87' : '#94a3b8',
														fontWeight: 600,
														fontSize: 11,
														cursor: 'pointer',
														transition: 'all 0.15s ease',
													}}
												>
													{num}
												</button>
											))}
										</div>
										<div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#cbd5e1', marginTop: 4 }}>
											<span>Kurang yakin</span>
											<span>Sangat yakin</span>
										</div>
									</Form.Group>

									<Button
										type="submit"
										style={{
											width: '100%',
											background: '#005a87',
											border: 'none',
											borderRadius: 10,
											padding: '12px',
											fontWeight: 600,
											fontSize: 13,
											display: 'flex',
											alignItems: 'center',
											justifyContent: 'center',
											gap: 8,
										}}
									>
										Mulai Belajar <ArrowRight size={14} />
									</Button>
								</Form>
							</div>
						</motion.div>
					</>
				)}
			</AnimatePresence>
		</>
	);
};

export default ForethoughtModal;
