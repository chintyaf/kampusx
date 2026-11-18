// ./linked-events-tab.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Row, Col, Card, Badge, Button } from 'react-bootstrap';
import { Link as LinkIcon, ArrowRight, Calendar, Sparkles } from 'lucide-react';

const INITIAL_EVENTS = [
	{
		id: 'ev-1',
		eventName: 'AI Summit Indonesia 2026',
		date: '15 Maret 2026',
		linkedLearningPath: 'Data Science & Machine Learning Foundations',
		attendeesCount: 450,
		status: 'Active Synced',
	},
	{
		id: 'ev-2',
		eventName: 'KampusX National Hackathon',
		date: '28 Maret 2026',
		linkedLearningPath: 'Web Application Architecture & REST API',
		attendeesCount: 320,
		status: 'Active Synced',
	},
	{
		id: 'ev-3',
		eventName: 'Web3 & Blockchain Career Fair',
		date: '10 April 2026',
		linkedLearningPath: 'Smart Contract & Blockchain Credentialing',
		attendeesCount: 210,
		status: 'Pending Verification',
	},
];

// props:
//   id     : learningId
//   routes : objek ROUTES dari ManageLearningPathPage
const LinkedEventsTab = ({ id, routes }) => {
	const navigate = useNavigate();

	return (
		<div>
			{/* Header */}
			<div
				className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 mb-3"
				style={{
					background: 'var(--card, #ffffff)',
					border: '1px solid var(--neutral-border, #e2e8f0)',
					borderRadius: 'var(--radius-lg, 14px)',
					padding: 20,
				}}
			>
				<div className="d-flex align-items-center gap-3">
					<div
						style={{
							width: 44,
							height: 44,
							borderRadius: 'var(--radius-md, 10px)',
							background: 'var(--bahama-blue-100, #d9edf7)',
							color: 'var(--color-primary, #006699)',
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
							flexShrink: 0,
						}}
					>
						<LinkIcon size={22} />
					</div>
					<div>
						<h2
							style={{ margin: 0, fontSize: 'var(--font-md, 16px)', fontWeight: 700 }}
						>
							Linked Event & Rules
						</h2>
						<p
							style={{
								margin: 0,
								fontSize: 'var(--font-sm, 14px)',
								color: 'var(--neutral-text, #64748b)',
							}}
						>
							Hubungkan materi event ke Learning Path dan tentukan aturan akses.
						</p>
					</div>
				</div>

				<Button
					type="button"
					onClick={() => navigate(routes.events(id))}
					className="d-inline-flex align-items-center gap-2"
					style={{
						backgroundColor: 'var(--color-primary, #006699)',
						borderColor: 'var(--color-primary, #006699)',
						color: 'var(--color-white, #ffffff)',
						borderRadius: 'var(--radius-md, 10px)',
						fontSize: 'var(--font-sm, 14px)',
						fontWeight: 600,
						padding: '9px 18px',
					}}
				>
					Kelola Integrasi Event <ArrowRight size={16} />
				</Button>
			</div>

			{/* Event cards */}
			<Row className="g-3">
				{INITIAL_EVENTS.map((ev) => {
					const synced = ev.status === 'Active Synced';
					return (
						<Col key={ev.id} xs={12} md={6} lg={4}>
							<Card
								className="h-100"
								style={{
									background: 'var(--card, #ffffff)',
									border: '1px solid var(--neutral-border, #e2e8f0)',
									borderRadius: 'var(--radius-lg, 14px)',
								}}
							>
								<Card.Body className="d-flex flex-column justify-content-between gap-3">
									<div>
										<div className="d-flex align-items-center justify-content-between mb-2">
											<Badge
												pill
												bg={synced ? 'success' : 'warning'}
												text={synced ? undefined : 'dark'}
												style={{
													fontSize: 'var(--font-xs, 12px)',
													fontWeight: 600,
												}}
											>
												{ev.status}
											</Badge>
											<span
												className="d-flex align-items-center gap-1"
												style={{
													fontSize: 'var(--font-xs, 12px)',
													color: 'var(--neutral-text, #64748b)',
												}}
											>
												<Calendar size={14} />
												{ev.date}
											</span>
										</div>

										<h3
											style={{
												margin: 0,
												fontSize: 'var(--font-md, 16px)',
												fontWeight: 700,
											}}
										>
											{ev.eventName}
										</h3>

										<div
											className="mt-3"
											style={{
												padding: 12,
												borderRadius: 'var(--radius-md, 10px)',
												background: 'var(--bahama-blue-100, #d9edf7)',
												fontSize: 'var(--font-xs, 12px)',
											}}
										>
											<span
												style={{
													display: 'block',
													color: 'var(--neutral-text, #64748b)',
													fontWeight: 500,
												}}
											>
												Learning Path Terkait:
											</span>
											<span style={{ fontWeight: 600 }}>
												{ev.linkedLearningPath}
											</span>
										</div>
									</div>

									<div
										className="d-flex align-items-center justify-content-between pt-2"
										style={{
											borderTop: '1px solid var(--neutral-border, #e2e8f0)',
											fontSize: 'var(--font-xs, 12px)',
											color: 'var(--neutral-text, #64748b)',
										}}
									>
										<span>{ev.attendeesCount} Peserta Terdaftar</span>
										<Button
											variant="link"
											className="p-0 d-flex align-items-center gap-1 text-decoration-none"
											style={{
												color: 'var(--color-primary, #006699)',
												fontSize: 'var(--font-xs, 12px)',
												fontWeight: 600,
											}}
										>
											Sinkronisasi <Sparkles size={14} />
										</Button>
									</div>
								</Card.Body>
							</Card>
						</Col>
					);
				})}
			</Row>
		</div>
	);
};

export default LinkedEventsTab;
