import React from 'react';
import { Card, Row, Col, Button } from 'react-bootstrap';
import { NavLink } from 'react-router-dom';
import { Target, Users, CheckCircle2, Sparkles } from 'lucide-react';

const DashboardNoEvent = () => {
	const steps = [
		{
			number: 1,
			title: 'Rancang Fondasi Acara',
			description: 'Buat kesan pertama yang kuat agar menarik minat peserta!',
			icon: Target,
		},
		{
			number: 2,
			title: 'Atur Tiket & Peserta',
			description: 'Siapkan kategori tiket dan formulir pendaftaran peserta.',
			icon: Users,
		},
		{
			number: 3,
			title: 'Review & Publikasikan',
			description: 'Cek kembali semua detail, lalu luncurkan acara kamu!',
			icon: CheckCircle2,
		},
	];

	return (
		<>
			{/* Header Section - Outside Card */}
			<div className="mb-4">
				<h3
					className="fw-bold mb-2"
					style={{ color: '#0f172a', fontFamily: 'var(--font)' }}>
					<Sparkles size={28} className="me-2" style={{ color: '#00699e' }} />
					Siap Jangkau Lebih Banyak Mahasiswa, Chintya?
				</h3>
				<p className="text-muted mb-0" style={{ fontSize: '16px', color: '#64748b' }}>
					Atur tiket, targetkan kampus yang tepat, dan kelola presensi dalam satu langkah
					mudah.
				</p>
			</div>

			{/* Main Card */}
			<Card
				className="rounded-4 border shadow-sm"
				style={{
					borderColor: '#3762a739',
					backgroundColor: '#fff',
				}}>
				<Card.Body className="p-4 p-md-5">
					<Row className="g-4 align-items-stretch">
						{/* Left Side - Image Preview */}
						<Col md={5} lg={5}>
							<div
								className="w-100 h-100 rounded-3 d-flex align-items-center justify-content-center"
								style={{
									backgroundColor: '#d9d9d9',
									minHeight: '400px',
									border: '1px solid #767676',
								}}>
								<div className="text-center text-muted p-4">
									<Sparkles size={48} className="mb-3" style={{ opacity: 0.4 }} />
									<p style={{ fontSize: '14px', opacity: 0.6 }}>
										Preview banner acara
									</p>
								</div>
							</div>
						</Col>

						{/* Right Side - Steps */}
						<Col md={7} lg={7} className="d-flex flex-column justify-content-center">
							<h5
								className="fw-bold mb-4"
								style={{
									fontSize: '18px',
									color: '#0f172a',
									fontFamily: 'var(--font)',
								}}>
								Yuk mulai! Siapkan acara pertamamu di KampusX...
							</h5>

							{/* Steps */}
							<div className="mb-4">
								{steps.map((step) => (
									<div key={step.number} className="mb-3">
										<div
											className="p-3 rounded-3 border d-flex align-items-start"
											style={{
												backgroundColor:
													step.number === 1 ? '#fff' : '#f8fafc',
												borderColor:
													step.number === 1 ? '#00699e' : '#3762a739',
												borderWidth: step.number === 1 ? '2px' : '1px',
											}}>
											<div
												className="me-3 rounded-circle d-flex align-items-center justify-content-center"
												style={{
													width: '40px',
													height: '40px',
													backgroundColor:
														step.number === 1 ? '#00699e' : '#e2e8f0',
													flexShrink: 0,
												}}>
												<step.icon
													size={20}
													style={{
														color:
															step.number === 1 ? '#fff' : '#64748b',
													}}
												/>
											</div>
											<div style={{ flex: 1 }}>
												<h6
													className="mb-1 fw-semibold"
													style={{
														fontSize: '15px',
														color:
															step.number === 1
																? '#0f172a'
																: '#64748b',
														fontFamily: 'var(--font)',
													}}>
													{step.number}. {step.title}
												</h6>
												<p
													className="mb-0"
													style={{
														fontSize: '13px',
														color:
															step.number === 1
																? '#64748b'
																: '#94a3b8',
													}}>
													{step.description}
												</p>
											</div>
										</div>
									</div>
								))}
							</div>

							{/* CTA Button */}
							<NavLink to="/organizer/buat-acara" className="text-decoration-none">
								<Button
									className="fw-semibold rounded-3 border-0"
									style={{
										backgroundColor: '#00699e',
										padding: '12px 24px',
										fontSize: '15px',
										fontFamily: 'var(--font)',
										width: 'fit-content',
									}}>
									Buat Event
								</Button>
							</NavLink>
						</Col>
					</Row>
				</Card.Body>
			</Card>
		</>
	);
};

export default DashboardNoEvent;
