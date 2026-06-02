import React from 'react';
import { Row, Col } from 'react-bootstrap';
import { Users, CheckCircle2, Box, Ticket } from 'lucide-react';
import StatCard from '@/components/dashboard/StatCard';

/**
 * Component: PosStats
 * Renders the statistics row for POS scanners including total count, active count,
 * unused count, and aggregate scan count.
 * 
 * @param {Array} posList - List of POS stations from API
 */
const PosStats = ({ posList = [] }) => {
	// Calculate POS stats dynamically based on the passed list
	const totalPos = posList.length;
	const activeCount = posList.filter((p) => p.status === 'Aktif').length;
	const unusedCount = posList.filter((p) => p.status === 'Tidak Aktif').length;
	const totalScanCount = posList.reduce((acc, curr) => acc + curr.totalScan, 0);

	return (
		<Row className="g-3">
			{/* Total POS Scanner Stations */}
			<Col xs={12} md={6} lg={3}>
				<StatCard
					Icon={Users}
					label="Total Pos"
					value={`${totalPos}`}
				/>
			</Col>

			{/* Active POS Scanner Stations */}
			<Col xs={12} md={6} lg={3}>
				<StatCard
					Icon={CheckCircle2}
					label="Pos Aktif"
					value={`${activeCount}`}
					type="green"
				/>
			</Col>

			{/* Unused POS Scanner Stations */}
			<Col xs={12} md={6} lg={3}>
				<StatCard
					Icon={Box}
					label="Belum Digunakan"
					value={`${unusedCount}`}
					type="yellow"
				/>
			</Col>

			{/* Total scan logs accumulated across all stations */}
			<Col xs={12} md={6} lg={3}>
				<StatCard
					Icon={Ticket}
					label="Total Scan"
					value={`${totalScanCount}`}
					type="purple"
				/>
			</Col>
		</Row>
	);
};

export default PosStats;
