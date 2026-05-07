import React from 'react';
import FormHeading from '@/components/dashboard/FormHeading';
import Table from '@/components/table/Table';
import { CheckCircle2, XCircle } from 'lucide-react';

import { Row, Col } from 'react-bootstrap';
import StatCard from '@/components/dashboard/StatCard';
import { Users, Clock } from 'lucide-react';

/* ── Main ────────────────────────────────────────────────────── */
const CertificateListPage = () => {
	const tableColumns = [
		{ label: 'PARTICIPANT', sortable: false },
		{ label: 'ATTENDANCE', sortable: false },
		{ label: 'FEEDBACK', sortable: false },
		{ label: 'STATUS', sortable: false },
	];

	// Mock data berdasarkan gambar
	const participantsData = [
		{
			name: 'Andi Wijaya',
			email: 'andi@email.com',
			attendance: 85,
			required: 75,
			feedback: true,
			status: 'Eligible',
		},
		{
			name: 'Budi Santoso',
			email: 'budi@email.com',
			attendance: 90,
			required: 75,
			feedback: true,
			status: 'Eligible',
		},
		{
			name: 'Citra Dewi',
			email: 'citra@email.com',
			attendance: 65,
			required: 75,
			feedback: false,
			status: 'Not Eligible',
		},
		{
			name: 'Dimas Pratama',
			email: 'dimas@email.com',
			attendance: 80,
			required: 75,
			feedback: false,
			status: 'Not Eligible',
		},
		{
			name: 'Eka Putri',
			email: 'eka@email.com',
			attendance: 95,
			required: 75,
			feedback: true,
			status: 'Eligible',
		},
	];

	// Hitung jumlah eligible untuk header
	const eligibleCount = participantsData.filter((p) => p.status === 'Eligible').length;

	return (
		<>
			<FormHeading heading="Buat Sertifikat" subheading="aidk" />
			{/* ── Stat Cards ── */}
			<div className='d-flex flex-column gap-3 mt-3'>
				<Row className="g-3">
					<Col xs={12} sm={3}>
						<StatCard Icon={Users} label="Total Peserta" value={10} />
					</Col>
					<Col xs={12} sm={3}>
						<StatCard Icon={CheckCircle2} label="Eligible" value={10} type="green" />
					</Col>
					<Col xs={12} sm={3}>
						<StatCard Icon={Clock} label="NotEligible" value={10} type="yellow" />
					</Col>
					<Col xs={12} sm={3}>
						<StatCard Icon={Clock} label="Tidak Datang????" value={10} type="red" />
					</Col>
				</Row>

				<div
					className="table-card"
					style={{
						border: '1px solid #e2e8f0',
						borderRadius: '8px',
						overflow: 'hidden',
					}}>
					{/* Header Card */}
					<div
						className="d-flex justify-content-between align-items-center px-4 py-3"
						style={{ borderBottom: '1px solid #e2e8f0', backgroundColor: '#fff' }}>
						<h4 className="m-0" style={{ fontWeight: '600', fontSize: '1rem' }}>
							Participants
						</h4>
						<span className="text-muted">
							{eligibleCount} of {participantsData.length} eligible
						</span>
					</div>

					{/* Table */}
					<div
						className="p-0 table-responsive"
						style={{ backgroundColor: 'var(--color-white)' }}>
						<Table
							columns={tableColumns}
							data={participantsData}
							emptyMessage="No participants found."
							renderRow={(participant, idx) => {
								const isEligible = participant.status === 'Eligible';
								const isAttendancePass =
									participant.attendance >= participant.required;

								return (
									<tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
										{/* Nama & Email */}
										<td className="px-4 py-3">
											<div style={{ fontWeight: '500', color: '#1e293b' }}>
												{participant.name}
											</div>
											<div className="text-muted small">
												{participant.email}
											</div>
										</td>

										{/* Attendance */}
										<td className="py-3">
											<div
												style={{
													fontWeight: 'bold',
													// fontSize: '1.1rem',
													color: isAttendancePass ? '#16a34a' : '#dc2626',
												}}>
												{participant.attendance}%
											</div>
											{/* <div className="text-muted" style={{ fontSize: '0.7rem' }}>
											Required: {participant.required}%
										</div> */}
										</td>

										{/* Feedback */}
										<td className="py-3">
											{participant.feedback ? (
												<CheckCircle2
													size={22}
													color="#16a34a"
													strokeWidth={1.5}
												/>
											) : (
												<XCircle
													size={22}
													color="#dc2626"
													strokeWidth={1.5}
												/>
											)}
										</td>

										{/* Status */}
										<td className="py-3">
											<span
												style={{
													display: 'inline-flex',
													alignItems: 'center',
													gap: '6px',
													padding: '4px 12px',
													borderRadius: '20px',
													fontSize: 'var(--font-xs)',
													fontWeight: '500',
													backgroundColor: isEligible
														? '#dcfce7'
														: '#fee2e2',
													color: isEligible ? '#166534' : '#991b1b',
												}}>
												{isEligible ? (
													<CheckCircle2 size={16} strokeWidth={2} />
												) : (
													<XCircle size={16} strokeWidth={2} />
												)}
												{participant.status}
											</span>
										</td>
									</tr>
								);
							}}
						/>
					</div>
				</div>
			</div>
		</>
	);
};

export default CertificateListPage;
