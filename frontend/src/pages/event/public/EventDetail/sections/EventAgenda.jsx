import React from 'react';
import { Accordion } from 'react-bootstrap';

const EventAgenda = ({ eventDetails }) => {
	return (
		<div className="bg-white p-4 rounded-4 shadow-sm border mb-4">
			<h4 className="fw-bold mb-4" style={{ color: 'var(--color-text)' }}>
				Jadwal & Agenda
			</h4>

			{eventDetails.sessions && eventDetails.sessions.length > 0 ? (
				(() => {
					const sessionsByDay = eventDetails.sessions.reduce(
						(acc, session) => {
							const day = session.day_number || 1;
							if (!acc[day]) acc[day] = [];
							acc[day].push(session);
							return acc;
						},
						{},
					);

					return (
						<Accordion defaultActiveKey="day-1">
							{Object.keys(sessionsByDay).map((day) => {
								const firstSessionDate = sessionsByDay[day][0]?.date;
								const formattedDate = firstSessionDate 
									? new Date(firstSessionDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) 
									: null;
								
								return (
								<Accordion.Item
									eventKey={`day-${day}`}
									key={day}
									className="mb-3 border rounded"
								>
									<Accordion.Header>
										<div className="d-flex align-items-center">
											<span className="fw-bold">Hari {day}</span>
											{formattedDate && (
												<span className="ms-2 text-secondary fw-medium" style={{ fontSize: '0.9rem' }}>
													— {formattedDate}
												</span>
											)}
										</div>
									</Accordion.Header>
									<Accordion.Body>
										<ul className="list-unstyled m-0">
											{sessionsByDay[day]
												.sort((a, b) =>
													(
														a.start_time || ''
													).localeCompare(
														b.start_time || '',
													),
												)
												.map((session, index) => {
													
													// Mapping ID prasyarat ke judul sesi
													const prerequisites = session.prerequisite_session_ids && Array.isArray(session.prerequisite_session_ids) 
														? session.prerequisite_session_ids.map(id => {
															const found = eventDetails.sessions.find(s => s.id === id);
															return found ? found.title : `Sesi ID ${id}`;
														})
														: [];

													return (
													<li
														key={session.id || index}
														className="d-flex mb-4 align-items-start"
													>
														<div
															className="fw-bold me-3 pt-1"
															style={{
																minWidth: '100px',
																color: 'var(--color-primary)',
																fontSize:
																	'var(--font-sm)',
															}}
														>
															{session.start_time
																? session.start_time.substring(
																		0,
																		5,
																	)
																: '09:00'}{' '}
															-{' '}
															{session.end_time
																? session.end_time.substring(
																		0,
																		5,
																	)
																: '10:00'}
														</div>
														<div className="flex-grow-1">
															<div
																className="fw-semibold text-dark mb-1"
																style={{
																	fontSize:
																		'1rem',
																}}
															>
																{session.title}
															</div>
															{session.description && (
																<p className="text-muted small mb-2" style={{ lineHeight: 1.5 }}>
																	{
																		session.description
																	}
																</p>
															)}
															
															{/* Render Prerequisites jika ada */}
															{prerequisites.length > 0 && (
																<div className="bg-warning-subtle text-dark-emphasis p-2 rounded-3 border border-warning-subtle mb-2 d-flex flex-column" style={{ fontSize: '0.85rem' }}>
																	<span className="fw-bold mb-1">⚠️ Syarat Sesi:</span>
																	<span>Wajib mengikuti: <strong>{prerequisites.join(' & ')}</strong></span>
																</div>
															)}

															{session.speakers &&
																session.speakers
																	.length > 0 && (
																	<div className="d-flex flex-wrap gap-2 mt-2">
																		{session.speakers.map(
																			(
																				speaker,
																				idx,
																			) => (
																				<span
																					key={
																						speaker.id ||
																						idx
																					}
																					className="badge bg-light text-dark border small py-1 px-2 fw-medium"
																					style={{
																						borderRadius:
																							'6px',
																					}}
																				>
																					🎤{' '}
																					{
																						speaker.name
																					}{' '}
																					<span className="text-secondary fw-normal">
																					(
																					{speaker.role ||
																						'Pembicara'}
																					)
																					</span>
																				</span>
																			),
																		)}
																	</div>
																)}
														</div>
													</li>
												)})}
										</ul>
									</Accordion.Body>
								</Accordion.Item>
							)})}
						</Accordion>
					);
				})()
			) : (
				<p className="text-muted small m-0">
					Rundown sesi belum diumumkan oleh penyelenggara.
				</p>
			)}
		</div>
	);
};

export default EventAgenda;
