import React from 'react';

const DemoButton = () => {
	return (
		<div
			style={{
				position: 'fixed',
				bottom: 24,
				right: 24,
				zIndex: 9999,
				display: 'flex',
				flexDirection: 'column',
				alignItems: 'flex-end',
				gap: 10,
			}}
		>
			{isSwitcherOpen && (
				<div
					style={{
						background: '#0F172A',
						padding: '14px 16px',
						borderRadius: 16,
						boxShadow: '0 12px 30px -5px rgba(0,0,0,0.3)',
						border: '1px solid #334155',
						display: 'flex',
						flexDirection: 'column',
						gap: 8,
						minWidth: 220,
					}}
				>
					<div
						style={{
							display: 'flex',
							justifyContent: 'space-between',
							alignItems: 'center',
						}}
					>
						<span
							style={{
								color: '#94A3B8',
								fontSize: '0.72rem',
								fontWeight: 700,
								letterSpacing: '0.05em',
							}}
						>
							🧪 PREVIEW OUTCOME
						</span>
						<button
							onClick={() => setIsSwitcherOpen(false)}
							style={{
								background: 'none',
								border: 'none',
								color: '#64748B',
								fontSize: 12,
								cursor: 'pointer',
							}}
						>
							✕
						</button>
					</div>

					<Button
						size="sm"
						style={{
							backgroundColor:
								selectedOutcomeKey === 'outcome1' ? '#EF4444' : '#1E293B',
							borderColor: selectedOutcomeKey === 'outcome1' ? '#EF4444' : '#334155',
							color: '#FFF',
							fontSize: '0.78rem',
							fontWeight: 600,
							textAlign: 'left',
							borderRadius: 8,
						}}
						onClick={() => setSelectedOutcomeKey('outcome1')}
					>
						1. Outcome 1 (Belum Siap)
					</Button>

					<Button
						size="sm"
						style={{
							backgroundColor:
								selectedOutcomeKey === 'outcome2' ? '#F59E0B' : '#1E293B',
							borderColor: selectedOutcomeKey === 'outcome2' ? '#F59E0B' : '#334155',
							color: '#FFF',
							fontSize: '0.78rem',
							fontWeight: 600,
							textAlign: 'left',
							borderRadius: 8,
						}}
						onClick={() => setSelectedOutcomeKey('outcome2')}
					>
						2. Outcome 2 (Cukup Siap)
					</Button>

					<Button
						size="sm"
						style={{
							backgroundColor:
								selectedOutcomeKey === 'outcome3' ? '#10B981' : '#1E293B',
							borderColor: selectedOutcomeKey === 'outcome3' ? '#10B981' : '#334155',
							color: '#FFF',
							fontSize: '0.78rem',
							fontWeight: 600,
							textAlign: 'left',
							borderRadius: 8,
						}}
						onClick={() => setSelectedOutcomeKey('outcome3')}
					>
						3. Outcome 3 (Siap)
					</Button>
				</div>
			)}

			<Button
				style={{
					backgroundColor: '#0F172A',
					borderColor: '#334155',
					color: '#FFF',
					borderRadius: '50px',
					padding: '10px 18px',
					boxShadow: '0 8px 20px rgba(0,0,0,0.2)',
					display: 'flex',
					alignItems: 'center',
					gap: 8,
					fontSize: '0.82rem',
					fontWeight: 700,
				}}
				onClick={() => setIsSwitcherOpen(!isSwitcherOpen)}
			>
				<Layers size={16} />
				<span>Switch Outcome</span>
			</Button>
		</div>
	);
};

export default DemoButton;
