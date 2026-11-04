import React from 'react';
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

const RecommendedModules = ({ modules = [], onOpen, onExploreAll }) => (
	<section>
		<div className="ld-section-head">
			<div>
				<h2 className="ld-title">Rekomendasi untuk Kamu</h2>
				<p className="ld-sub">
					Disusun dari kecocokan konten, pola belajar member lain, dan tingkat kesiapanmu
				</p>
			</div>
			<button type="button" className="ld-link" onClick={onExploreAll}>
				Jelajahi semua <Icon name="arrow-right" size={14} />
			</button>
		</div>

		<div className="ld-rec-grid">
			{modules.map((m) => {
				const reason = REASON[m.reason] || REASON.lanjut;
				const pct = Math.round(m.score * 100);
				return (
					<article key={m.id} className="ld-card ld-rec">
						<ModuleThumb module={m} className="ld-rec-thumb" />
						<div className="ld-rec-body">
							<span className={`ld-chip is-${reason.tone}`}>{reason.label}</span>
							<h3 className="ld-rec-title">{m.title}</h3>

							<div className="ld-rec-meta">
								<span>
									{m.lessons} lesson · {m.level}
								</span>
								<span>
									<Icon name="clock" size={13} /> {m.duration} menit
								</span>
							</div>
{/* 
							<div className="ld-progress-row">
								<span>Kecocokan</span>
								<strong>{pct}%</strong>
							</div>
							<div className="ld-progress is-thin">
								<div className="ld-progress-bar" style={{ width: `${pct}%` }} />
							</div>
							<p className="ld-rec-source">{SOURCE[m.source]}</p>

							<div className="ld-chips">
								{m.skills.map((s) => (
									<span key={s} className="ld-chip is-neutral">
										{s}
									</span>
								))}
							</div> */}

							<button type="button" className="ld-btn ld-btn-outline" onClick={() => onOpen?.(m)}>
								Lihat Modul <Icon name="arrow-right" size={14} />
							</button>
						</div>
					</article>
				);
			})}
		</div>
	</section>
);

export default RecommendedModules;
