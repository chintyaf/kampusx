import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ClipboardCheck, ClipboardList, ChevronRight } from 'lucide-react';

const LessonQuizLink = ({ to, subtitle = 'Uji pemahamanmu' }) => {
	const [isHovered, setIsHovered] = useState(false);

	return (
		<div style={{ fontFamily: 'var(--font)' }}>
			{/* Label section: dibuat sejajar dengan kolom ikon row lesson */}
			<div
				style={{
					paddingTop: '20px',
					paddingBottom: '8px',
					paddingLeft: 'calc(var(--border-w-lg) + 0.5rem)',
					fontSize: '10px',
					fontWeight: 700,
					letterSpacing: '0.08em',
					textTransform: 'uppercase',
					color: 'var(--text-muted)',
					opacity: 0.8,
				}}
			>
				Evaluasi
			</div>

			<Link
				to={to}
				onMouseEnter={() => setIsHovered(true)}
				onMouseLeave={() => setIsHovered(false)}
				onFocus={() => setIsHovered(true)}
				onBlur={() => setIsHovered(false)}
				className="d-flex align-items-center justify-content-between px-2 py-3 text-decoration-none"
				style={{
					backgroundColor: isHovered ? 'var(--bg-2)' : 'var(--white)',
					transition: 'all 0.15s ease',
					borderLeft: 'var(--border-w-lg) solid transparent',
					borderTop: 'var(--border-w-xs) solid var(--neutral-border)',
					borderBottom: 'var(--border-w-xs) solid var(--neutral-border)',
				}}
			>
				<div className="d-flex align-items-start gap-2 flex-grow-1 me-2" style={{ minWidth: 0 }}>
					{/* Ikon (ukuran sama dengan ikon status lesson) */}
					<div className="flex-shrink-0">
						<ClipboardCheck size={18} style={{ color: 'var(--primary)' }} />
					</div>

					{/* Konten */}
					<div className="flex-grow-1" style={{ minWidth: 0 }}>
						<div
							className="fw-medium mb-1"
							style={{
								color: 'var(--text)',
								fontSize: 'var(--font-xs)',
								lineHeight: '1.35',
							}}
						>
							Kuis Modul
						</div>

						<div
							className="d-flex align-items-center gap-2 flex-wrap"
							style={{ fontSize: '11px', color: 'var(--text-muted)' }}
						>
							<span className="d-inline-flex align-items-center gap-1">
								<ClipboardList size={13} style={{ color: 'var(--text-muted)' }} />
								<span>Kuis</span>
							</span>
							<span>•</span>
							<span>{subtitle}</span>
						</div>
					</div>
				</div>

				{/* Chevron */}
				<div className="flex-shrink-0" style={{ opacity: isHovered ? 1 : 0.3 }}>
					<ChevronRight
						size={15}
						style={{ color: isHovered ? 'var(--primary)' : 'var(--text-muted)' }}
					/>
				</div>
			</Link>
		</div>
	);
};

export default LessonQuizLink;