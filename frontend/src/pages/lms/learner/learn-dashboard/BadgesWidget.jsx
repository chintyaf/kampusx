import React from 'react';
import Icon from './Icon';

// Status pengiriman payload kredensial ke modul Smart Contract.
const CREDENTIAL_STATUS = {
	recorded: { label: 'Tercatat', tone: 'success', icon: 'shield' },
	processing: { label: 'Diproses', tone: 'warning', icon: 'link' },
	pending: { label: 'Menunggu', tone: 'neutral', icon: 'clock' },
};

/**
 * Badge pencapaian dan kredensial digital (sertifikat + status pencatatan Smart Contract).
 */
const BadgesWidget = ({ data, onViewCertificate }) => {
	const earned = data.badges.filter((b) => b.earned).length;

	return (
		<section className="ld-card">
			<div className="ld-card-head">
				<div>
					<h2 className="ld-title">Pencapaian</h2>
					<p className="ld-sub">
						{/* {earned} dari {data.badges.length} badge diraih */}
					</p>
				</div>
			</div>

			{/* <div className="ld-badges">
				{data.badges.map((b) => (
					<div key={b.id} className={`ld-badge ${b.earned ? 'is-earned' : ''}`}>
						<span className="ld-badge-icon">
							<Icon name={b.earned ? b.icon : 'lock'} size={20} />
						</span>
						<small>{b.name}</small>
					</div>
				))}
			</div> */}
{/*
			<h3 className="ld-subtitle mb-4">
				<Icon name="award" size={14} /> Sertifikat & kredensial digital
			</h3> */}

			<div className="ld-creds">
				{data.credentials.map((c) => {
					const st = CREDENTIAL_STATUS[c.status];
					return (
						<button
							key={c.id}
							type="button"
							className="ld-cred"
							onClick={() => onViewCertificate?.(c)}
						>
							<span className="ld-cred-info">
								<strong>{c.module}</strong>
								<small>Skor akhir {c.score}</small>
							</span>
							<span className={`ld-chip is-${st.tone}`}>
								<Icon name={st.icon} size={12} /> {st.label}
							</span>
						</button>
					);
				})}
			</div>
		</section>
	);
};

export default BadgesWidget;
