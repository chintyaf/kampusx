import React from 'react';
import { Users, Clock, LogIn, LogOut, Percent } from 'lucide-react';
import StatCard from '@/components/dashboard/StatCard';

const ParticipantStats = ({ summary }) => {
	const attendedTotal = summary.checked_in + summary.checked_out;
	const attendanceRate =
		summary.total > 0 ? Math.round((attendedTotal / summary.total) * 100) : 0;

	return (
		<div className="participant-stats mb-4">
			<StatCard
				Icon={Users}
				label="Total Peserta"
				value={`${summary.total}`}
				type="blue"
			/>

			<StatCard
				Icon={Clock}
				label="Belum Hadir"
				value={`${summary.not_attended}`}
				type="yellow"
			/>

			<StatCard
				Icon={LogIn}
				label="Check-in"
				value={`${summary.checked_in}`}
				type="green"
			/>

			<StatCard
				Icon={LogOut}
				label="Check-out"
				value={`${summary.checked_out}`}
				iconBg="#ede9fe"
				iconColor="#5b21b6"
			/>

			{/* Standard StatCard for Attendance Rate */}
			<StatCard
				Icon={Percent}
				label={`Tingkat Kehadiran (${attendedTotal}/${summary.total})`}
				value={`${attendanceRate}%`}
				type="green"
			/>
		</div>
	);
};

export default ParticipantStats;
