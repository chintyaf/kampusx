import React, { useMemo } from 'react';
import Icon from './Icon';
import { formatMinutes, formatSessionDate, getWeeklyStudyMinutes } from './learningUtils';

/**
 * Widget sidebar: grafik waktu belajar 7 hari terakhir + saran untuk sesi berikutnya
 * (diambil dari rencana perbaikan pada Self-Reflection sesi terakhir).
 */
const StudyInsightsWidget = ({ sessions = [] }) => {
	const days = useMemo(() => getWeeklyStudyMinutes(sessions), [sessions]);
	const latest = useMemo(
		() => [...sessions].sort((a, b) => new Date(b.startedAt) - new Date(a.startedAt))[0],
		[sessions]
	);
	const max = Math.max(...days.map((d) => d.minutes), 1);
	const total = days.reduce((t, d) => t + d.minutes, 0);

	return (
		<>
			<section className="ld-card">
				<h2 className="ld-title">Waktu belajar 7 hari terakhir</h2>
				<p className="ld-sub">Total {formatMinutes(total)}</p>

				<div className="ld-bars">
					{days.map((d, i) => {
						const today = i === days.length - 1;
						return (
							<div key={i} className="ld-bar-col" title={`${Math.round(d.minutes)} menit`}>
								<div className="ld-bar-wrap">
									<div
										className={`ld-bar ${today ? 'is-today' : ''}`}
										style={{ height: `${Math.max(4, (d.minutes / max) * 100)}%` }}
									/>
								</div>
								<small className={today ? 'is-today' : ''}>{d.label}</small>
							</div>
						);
					})}
				</div>
			</section>
		</>
	);
};

export default StudyInsightsWidget;
