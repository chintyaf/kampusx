import React, { useState } from 'react';
// ❌ Hapus Modal dari import react-bootstrap karena sudah di-handle oleh StaffForm
import { Button, Table, Card, Row, Col } from 'react-bootstrap';
import EventLayout from '../../../../layouts/EventLayout';
import FormHeading from '../../../../components/dashboard/FormHeading';
import StatCard from '@/components/dashboard/StatCard';
import StaffTable from './StaffTable';
import StaffForm from './StaffForm'; // <-- Import komponen StaffForm kamu
import { UserPlus, ShieldCheck, Trash2, Users, Clock, Mail, CheckCircle2 } from 'lucide-react';

/* ── Main ────────────────────────────────────────────────────── */
const EventStaffManagementPage = () => {
	const [staffList, setStaffList] = useState([
		{
			id: 1,
			name: 'Reverie Vale',
			email: 'reverie@univ.ac.id',
			role: 'Koordinator',
			status: 'Aktif',
		},
		{
			id: 2,
			name: 'Galen Gale',
			email: 'galen@univ.ac.id',
			role: 'Administrasi',
			status: 'Pending',
		},
		{
			id: 3,
			name: 'Sinta Dewi',
			email: 'sinta@univ.ac.id',
			role: 'Dokumentasi',
			status: 'Aktif',
		},
	]);

	// ✅ State-nya bernama showForm
	const [showForm, setShowForm] = useState(false);

	const pendingCount = staffList.filter((s) => s.status === 'Pending').length;
	const activeCount = staffList.filter((s) => s.status === 'Aktif').length;

	const handleDelete = (id) => setStaffList((prev) => prev.filter((s) => s.id !== id));

	return (
		<div className="d-flex flex-column gap-3">
			{/* ── Header ── */}
			<FormHeading
				heading="Manajemen Staf Administrasi"
				subheading="Kelola akses dan peran tim panitia Anda di sini."
			/>

			{/* ── Stat Cards ── */}
			<Row className="g-3">
				<Col xs={12} sm={4}>
					<StatCard Icon={Users} label="Total Panitia" value={`${staffList.length}`} />
				</Col>
				<Col xs={12} sm={4}>
					<StatCard
						Icon={CheckCircle2}
						label="Staf Aktif"
						value={`${activeCount}`}
						type="green"
					/>
				</Col>
				<Col xs={12} sm={4}>
					<StatCard
						Icon={Clock}
						label="Undangan Pending"
						value={`${pendingCount}`}
						type="yellow"
					/>
				</Col>
			</Row>

			{/* ── Staff Table ── */}
			<StaffTable
				staffList={staffList}
				handleDelete={handleDelete}
				onAddStaff={() => setShowForm(true)}
			/>

			{/* ✅ Panggil StaffForm LANGSUNG (karena di dalamnya sudah ada Modal) */}
			<StaffForm show={showForm} onHide={() => setShowForm(false)} />
		</div>
	);
};

export default EventStaffManagementPage;
