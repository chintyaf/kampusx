import React, { useState } from 'react';
import { Button, Row, Col } from 'react-bootstrap';
import FormHeading from '../../../../components/dashboard/FormHeading';
import StatCard from '@/components/dashboard/StatCard';
import PosTable from './PosTable'; // Sebelumnya StaffTable
import PosForm from './PosForm'; // Anggap form sudah disesuaikan namanya
import { Users, CheckCircle2, Box, Ticket, Plus } from 'lucide-react';

/* ── Main ────────────────────────────────────────────────────── */
const EventPosPage = () => {
	// Menyesuaikan data sesuai dengan gambar
	const [posList, setPosList] = useState([
		{
			id: 1,
			name: 'Pintu Masuk Utama',
			pin: '456789',
			status: 'Aktif',
			totalScan: 24,
		},
		{
			id: 2,
			name: 'Registrasi VIP',
			pin: '234567',
			status: 'Aktif',
			totalScan: 8,
		},
	]);

	const [showForm, setShowForm] = useState(false);

	// Perhitungan statistik
	const activeCount = posList.filter((p) => p.status === 'Aktif').length;
	const unusedCount = posList.filter((p) => p.status === 'Belum Digunakan').length; // Default 0 jika tidak ada
	const totalScanCount = posList.reduce((acc, curr) => acc + curr.totalScan, 0);

	const handleDelete = (id) => setPosList((prev) => prev.filter((p) => p.id !== id));

	return (
		<div className="d-flex flex-column gap-3">
			{/* ── Header & Action Button ── */}
			<div className="d-flex justify-content-between align-items-start">
				<FormHeading
					heading="Manajemen Pos Scanner"
					subheading="Kelola akses dan peran tim panitia Anda di sini."
				/>
			
			</div>

			{/* ── Stat Cards ── */}
			<Row className="g-3">
				<Col xs={12} sm={3}>
					<StatCard Icon={Users} label="Total Pos" value={`${posList.length}`} />
				</Col>
				<Col xs={12} sm={3}>
					<StatCard
						Icon={CheckCircle2}
						label="Pos Aktif"
						value={`${activeCount}`}
						type="green"
					/>
				</Col>
				<Col xs={12} sm={3}>
					<StatCard
						Icon={Box}
						label="Belum Digunakan"
						value={`${unusedCount}`}
						type="yellow"
					/>
				</Col>
				<Col xs={12} sm={3}>
					<StatCard
						Icon={Ticket}
						label="Total Scan"
						value={`${totalScanCount}`}
						type="purple"
					/>
				</Col>
			</Row>

			{/* ── Pos Table ── */}
			<PosTable posList={posList} handleDelete={handleDelete} />

			{/* Form Modal */}
			<PosForm show={showForm} onHide={() => setShowForm(false)} />
		</div>
	);
};

export default EventPosPage;