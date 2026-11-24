import React from 'react';
import Icon from './Icon';
// import { Collumn } from 'react-bootstrap';

const getGreeting = () => {
	const h = new Date().getHours();
	if (h < 11) return 'Selamat pagi';
	if (h < 15) return 'Selamat siang';
	if (h < 18) return 'Selamat sore';
	return 'Selamat malam';
};

/**
 * Header pusat microlearning: sapaan, streak belajar, dan ringkasan learning analytics.
 * stats: [{ icon, label, value, tone }]
 */
const LearningHeader = ({ user, streak = 0, stats = [] }) => {
	const name = user?.name || user?.full_name || user?.username || 'Member';
	const firstName = String(name).split(' ')[0];
	const today = new Date().toLocaleDateString('id-ID', {
		weekday: 'long',
		day: 'numeric',
		month: 'long',
		year: 'numeric',
	});

	return (
		<header className="ld-header">
			<div className="ld-header-top">
				<div className="col-8">
					<span className="ld-date">
						<Icon name="calendar" size={14} /> {today}
					</span>
					<h1 className="ld-h1">
						{getGreeting()}, {firstName}
					</h1>
					<p className="ld-lead">
						Pusat microlearning kamu: rencanakan target, pelajari materi ringkas, lalu
						refleksikan hasilnya.
					</p>
				</div>
				<div
					className="ld-streak"
					title={`Kamu sudah belajar ${streak} hari berturut-turut. Pertahankan!`}
				>
					<Icon name="flame" size={16} />
					<span className="ld-streak__text">
						<span className="ld-streak__count">{streak}</span>
						<span className="ld-streak__label">hari</span>
					</span>
				</div>
			</div>

			<div className="ld-stats">
				{stats.map((s) => (
					<div className="ld-stat" key={s.label}>
						<span className={`ld-stat-icon is-${s.tone || 'primary'}`}>
							<Icon name={s.icon} size={18} />
						</span>
						<div>
							<strong>{s.value}</strong>
							<small>{s.label}</small>
						</div>
					</div>
				))}
			</div>
		</header>
	);
};

export default LearningHeader;
