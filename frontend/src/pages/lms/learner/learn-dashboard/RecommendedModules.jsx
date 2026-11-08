import React from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from './Icon';
import ModuleThumb from './ModuleThumb';

// Alasan rekomendasi mengikuti tindak lanjut Readiness Level (Tabel 3.6).
const REASON = {
	lanjut: { label: 'Materi berikutnya', tone: 'primary' },
	pendukung: { label: 'Materi pendukung', tone: 'warning' },
	remedial: { label: 'Remedial', tone: 'danger' },
};

// Sumber skor hybrid filtering (CBF + item-based CF).
const SOURCE = {
	cbf: 'Mirip dengan minat belajarmu',
	cf: 'Banyak dipelajari member dengan pola serupa',
	hybrid: 'Cocok dengan profil & pola belajarmu',
};

const RecommendedModules = ({ modules = [], onOpen, onExploreAll }) => {
	const navigate = useNavigate();

	const handleOpen = (m) => {
		if (onOpen) {
			onOpen(m);
		} else {
			// Navigasi ke modul terkait
			const targetId = m.targetModuleId || m.moduleId || (m.id === 'rec-1' || m.id === 'rec-2' ? 'mod-arch-101' : m.id);
			navigate(`/learner/modules/${targetId}`);
		}
	};

	const handleExploreAll = () => {
		if (onExploreAll) {
			onExploreAll();
		} else {
			navigate('/explore-microlearning');
		}
	};

	return (
		<section>
			<div className="ld-section-head">
				<div>
					<h2 className="ld-title">Rekomendasi untuk Kamu</h2>
					<p className="ld-sub">
						Disusun dari kecocokan konten, pola belajar member lain, dan tingkat kesiapanmu
					</p>
				</div>
				<button type="button" className="ld-link" onClick={handleExploreAll}>
					Jelajahi semua <Icon name="arrow-right" size={14} />
				</button>
			</div>

			<div className="ld-rec-grid">
				{modules.map((m) => {
					const reason = REASON[m.reason] || REASON.lanjut;
					return (
						<article key={m.id} className="ld-card ld-rec">
							<div
								style={{ cursor: 'pointer' }}
								onClick={() => handleOpen(m)}
								title={`Lihat detail ${m.title}`}
							>
								<ModuleThumb module={m} className="ld-rec-thumb" />
							</div>
							<div className="ld-rec-body">
								<span className={`ld-chip is-${reason.tone}`}>{reason.label}</span>
								<h3
									className="ld-rec-title"
									style={{ cursor: 'pointer' }}
									onClick={() => handleOpen(m)}
								>
									{m.title}
								</h3>

								<div className="ld-rec-meta">
									<span>
										{m.lessons} lesson · {m.level}
									</span>
									<span>
										<Icon name="clock" size={13} /> {m.duration} menit
									</span>
								</div>

								<button
									type="button"
									className="ld-btn ld-btn-outline"
									onClick={() => handleOpen(m)}
									aria-label={`Buka modul ${m.title}`}
								>
									Lihat Modul <Icon name="arrow-right" size={14} />
								</button>
							</div>
						</article>
					);
				})}
			</div>
		</section>
	);
};

export default RecommendedModules;