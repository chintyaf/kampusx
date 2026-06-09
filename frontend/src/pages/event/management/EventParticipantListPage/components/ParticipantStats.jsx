import React from 'react';
import { Users, Clock, LogIn, LogOut } from 'lucide-react';

const ParticipantStats = ({ summary }) => {
	const attendedTotal = summary.checked_in + summary.checked_out;
	const attendanceRate =
		summary.total > 0 ? Math.round((attendedTotal / summary.total) * 100) : 0;

	return (
		<div className="participant-stats">
			<div className="stat-card">
				<div className="stat-card__icon stat-card__icon--blue">
					<Users size={16} />
				</div>
				<div>
					<p className="stat-card__label">Total Peserta</p>
					<p className="stat-card__value">{summary.total}</p>
				</div>
			</div>

			<div className="stat-card">
				<div className="stat-card__icon stat-card__icon--yellow">
					<Clock size={16} />
				</div>
				<div>
					<p className="stat-card__label">Belum Hadir</p>
					<p className="stat-card__value">{summary.not_attended}</p>
				</div>
			</div>

			<div className="stat-card">
				<div className="stat-card__icon stat-card__icon--green">
					<LogIn size={16} />
				</div>
				<div>
					<p className="stat-card__label">Check-in</p>
					<p className="stat-card__value">{summary.checked_in}</p>
				</div>
			</div>

			<div className="stat-card">
				<div className="stat-card__icon stat-card__icon--purple">
					<LogOut size={16} />
				</div>
				<div>
					<p className="stat-card__label">Check-out</p>
					<p className="stat-card__value">{summary.checked_out}</p>
				</div>
			</div>

			<div className="stat-card stat-card--rate">
				<div className="stat-card__rate-ring">
					<svg viewBox="0 0 36 36" className="rate-ring-svg">
						<circle className="rate-ring-bg" cx="18" cy="18" r="15.9" />
						<circle
							className="rate-ring-fill"
							cx="18"
							cy="18"
							r="15.9"
							strokeDasharray={`${attendanceRate} ${100 - attendanceRate}`}
							strokeDashoffset="25"
						/>
					</svg>
					<span className="rate-ring-label">{attendanceRate}%</span>
				</div>
				<div>
					<p className="stat-card__label">Tingkat Kehadiran</p>
					<p className="stat-card__value--sm">
						{attendedTotal} / {summary.total} hadir
					</p>
				</div>
			</div>
		</div>
	);
};

export default ParticipantStats;
