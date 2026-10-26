import React from 'react';
import { Card, Button } from 'react-bootstrap';
import { Brain, Sparkles, Check, CheckCircle2 } from 'lucide-react';
const LearningSRLGoal = ({
	selectedHours,
	setSelectedHours,
	selectedWeeks,
	setSelectedWeeks,
	goalSaved,
	handleSaveGoal,
	getProjectedDate,
}) => {
	return (
		<Card
			className="border shadow-sm p-4 mb-4"
			style={{
				fontFamily: 'var(--font)',
				backgroundColor: 'var(--card)',
				borderColor: 'var(--border)',
				borderRadius: 'var(--radius-lg)',
			}}
		>
			{/* Header Section */}
			<div className="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-2">
				<div className="d-flex align-items-center gap-3">
					<div
						className="d-flex align-items-center justify-content-center flex-shrink-0"
						style={{
							width: '42px',
							height: '42px',
							backgroundColor: 'var(--bahama-blue-100)',
							color: 'var(--primary)',
							borderRadius: 'var(--radius-full)',
						}}
					>
						<Brain size={22} />
					</div>
					<div>
						<h4
							className="fw-bold mb-1"
							style={{
								fontSize: 'var(--font-lg)',
								color: 'var(--text)',
							}}
						>
							Set Your Learning Goals (SRL Forethought Phase)
						</h4>
						<p
							className="mb-0"
							style={{
								fontSize: 'var(--font-sm)',
								color: 'var(--text-muted)',
							}}
						>
							Rencanakan komitmen mingguanmu untuk menjaga retensi &amp; disiplin
							belajar mandiri.
						</p>
					</div>
				</div>

				<span
					className="badge border px-3 py-2 text-uppercase fw-semibold"
					style={{
						backgroundColor: 'var(--neutral-bg)',
						color: 'var(--neutral-text)',
						borderColor: 'var(--neutral-border)',
						borderRadius: 'var(--radius-full)',
						fontSize: 'var(--font-xs)',
						letterSpacing: '0.5px',
					}}
				>
					Self-Regulation
				</span>
			</div>

			{/* Selector: Weekly Study Commitment */}
			<div className="mb-4">
				<div className="d-flex align-items-center justify-content-between mb-2">
					<span
						className="fw-semibold"
						style={{ fontSize: 'var(--font-sm)', color: 'var(--text)' }}
					>
						Weekly Study Commitment:
					</span>
					<span
						className="fw-bold"
						style={{ fontSize: 'var(--font-sm)', color: 'var(--primary)' }}
					>
						{selectedHours} Hours / Week
					</span>
				</div>
				<div className="d-flex gap-2 flex-wrap">
					{['1', '2', '3', '4', '5+'].map((hrs) => {
						const isSelected = selectedHours === hrs;
						return (
							<button
								key={hrs}
								type="button"
								className="btn btn-sm fw-semibold px-3 py-2"
								style={{
									borderRadius: 'var(--radius-md)',
									fontSize: 'var(--font-sm)',
									backgroundColor: isSelected
										? 'var(--primary)'
										: 'var(--neutral-bg)',
									color: isSelected ? 'var(--color-white)' : 'var(--text)',
									borderColor: isSelected
										? 'var(--primary)'
										: 'var(--neutral-border)',
									boxShadow: isSelected
										? '0 2px 4px rgba(0, 105, 158, 0.2)'
										: 'none',
									transition: 'all 0.2s ease',
								}}
								onClick={() => setSelectedHours(hrs)}
							>
								{hrs} hours/week
							</button>
						);
					})}
				</div>
			</div>

			{/* Selector: Target Completion Weeks */}
			<div className="mb-4">
				<div className="d-flex align-items-center justify-content-between mb-2">
					<span
						className="fw-semibold"
						style={{ fontSize: 'var(--font-sm)', color: 'var(--text)' }}
					>
						Target Completion Timeline:
					</span>
					<span
						className="fw-bold"
						style={{ fontSize: 'var(--font-sm)', color: 'var(--primary)' }}
					>
						{selectedWeeks} Weeks Target
					</span>
				</div>
				<div className="d-flex gap-2 flex-wrap">
					{['2', '4', '6', '8'].map((wks) => {
						const isSelected = selectedWeeks === wks;
						return (
							<button
								key={wks}
								type="button"
								className="btn btn-sm fw-semibold px-3 py-2"
								style={{
									borderRadius: 'var(--radius-md)',
									fontSize: 'var(--font-sm)',
									backgroundColor: isSelected
										? 'var(--primary)'
										: 'var(--neutral-bg)',
									color: isSelected ? 'var(--color-white)' : 'var(--text)',
									borderColor: isSelected
										? 'var(--primary)'
										: 'var(--neutral-border)',
									boxShadow: isSelected
										? '0 2px 4px rgba(0, 105, 158, 0.2)'
										: 'none',
									transition: 'all 0.2s ease',
								}}
								onClick={() => setSelectedWeeks(wks)}
							>
								{wks} weeks
							</button>
						);
					})}
				</div>
			</div>

			{/* AI Projection Alert Banner */}
			<div
				className="p-3 mb-4 d-flex align-items-start gap-2 border"
				style={{
					backgroundColor: 'var(--bahama-blue-50)',
					borderColor: 'var(--bahama-blue-200)',
					borderRadius: 'var(--radius-md)',
				}}
			>
				<Sparkles
					size={18}
					className="flex-shrink-0 mt-1"
					style={{ color: 'var(--primary)' }}
				/>
				<div
					style={{
						color: 'var(--bahama-blue-900)',
						fontSize: 'var(--font-sm)',
						lineHeight: '1.5',
					}}
				>
					<strong>💡 AI Projection:</strong> At{' '}
					<strong>{selectedHours} hours/week</strong>, you'll complete this Masterclass by{' '}
					<strong>{getProjectedDate(selectedWeeks)}</strong> — on track with 2 modules
					already completed!
				</div>
			</div>

			{/* Action Button & Confirmation */}
			<div className="d-flex align-items-center justify-content-between flex-wrap gap-3">
				<Button
					type="button"
					className="fw-bold px-4 py-2 d-inline-flex align-items-center gap-2 border-0"
					style={{
						backgroundColor: 'var(--primary)',
						color: 'var(--color-white)',
						borderRadius: 'var(--radius-md)',
						fontSize: 'var(--font-sm)',
						boxShadow: '0 2px 6px rgba(0, 105, 158, 0.25)',
					}}
					onClick={handleSaveGoal}
				>
					<Check size={16} />
					<span>Save Learning Plan</span>
				</Button>

				{goalSaved && (
					<span
						className="fw-semibold d-inline-flex align-items-center gap-1.5"
						style={{
							color: 'var(--success-text)',
							fontSize: 'var(--font-sm)',
						}}
					>
						<CheckCircle2 size={16} />
						Target belajar berhasil disimpan ke profil SRL!
					</span>
				)}
			</div>
		</Card>
	);
};

export default LearningSRLGoal;
