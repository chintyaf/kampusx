import React from 'react';
import { Row, Col, Card } from 'react-bootstrap';
import { Linkedin, Twitter, Globe, Instagram, Award } from 'lucide-react';
import { STORAGE_URL } from '@/api/storage';

const EventSpeakers = ({ eventDetails }) => {
	const speakers = eventDetails?.speakers || [];

	if (speakers.length === 0) return null;

	return (
		<div className="bg-white p-4 rounded-4 shadow-sm border mb-4">
			<h4 className="fw-bold mb-4 text-dark">Pembicara & Narasumber</h4>
			<Row className="g-4">
				{speakers.map((speaker, idx) => {
					// Parse social links if they are stored as JSON or stringified JSON
					let socials = {};
					try {
						socials = typeof speaker.social_link === 'string'
							? JSON.parse(speaker.social_link)
							: speaker.social_link || {};
					} catch (e) {
						console.error('Failed to parse speaker socials', e);
					}

					let expertises = [];
					try {
						expertises = typeof speaker.expertise === 'string'
							? JSON.parse(speaker.expertise)
							: speaker.expertise || [];
					} catch (e) {
						console.error('Failed to parse speaker expertise', e);
					}

					return (
						<Col key={speaker.id || idx} md={6} lg={4}>
							<Card className="h-100 border-0 shadow-sm bg-light rounded-4 text-center p-3 hover-lift" style={{ transition: 'transform 0.2s ease-in-out' }}>
								<div className="position-relative mx-auto mb-3" style={{ width: '100px', height: '100px' }}>
									<img
										src={
											speaker.image_path
												? `${STORAGE_URL}/${speaker.image_path}`
												: `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(speaker.name)}`
										}
										alt={speaker.name}
										className="rounded-circle border border-3 border-white shadow-sm object-fit-cover w-100 h-100"
									/>
								</div>
								
								<h5 className="fw-bold mb-1 text-dark" style={{ fontSize: '1.1rem' }}>
									{speaker.name}
								</h5>
								
								{speaker.role && (
									<div className="small text-primary fw-semibold mb-2">
										{speaker.role}
									</div>
								)}

								{speaker.bio && (
									<p className="text-muted small mb-3 text-start" style={{ display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden', height: '54px', lineHeight: 1.5 }}>
										{speaker.bio}
									</p>
								)}

								{/* Expertises Badges */}
								{expertises.length > 0 && (
									<div className="d-flex flex-wrap justify-content-center gap-1 mb-3">
										{expertises.map((exp, i) => (
											<span key={i} className="badge bg-white text-secondary border px-2 py-1 rounded-pill fw-medium" style={{ fontSize: '0.7rem' }}>
												<Award size={10} className="me-1 text-warning" />
												{exp}
											</span>
										))}
									</div>
								)}

								{/* Social Icons */}
								<div className="d-flex justify-content-center gap-2 mt-auto border-top pt-2">
									{socials.linkedin && (
										<a href={socials.linkedin} target="_blank" rel="noopener noreferrer" className="text-secondary hover-primary transition p-1" title="LinkedIn">
											<Linkedin size={16} />
										</a>
									)}
									{socials.twitter && (
										<a href={socials.twitter} target="_blank" rel="noopener noreferrer" className="text-secondary hover-primary transition p-1" title="Twitter">
											<Twitter size={16} />
										</a>
									)}
									{socials.instagram && (
										<a href={socials.instagram} target="_blank" rel="noopener noreferrer" className="text-secondary hover-primary transition p-1" title="Instagram">
											<Instagram size={16} />
										</a>
									)}
									{socials.website && (
										<a href={socials.website} target="_blank" rel="noopener noreferrer" className="text-secondary hover-primary transition p-1" title="Website">
											<Globe size={16} />
										</a>
									)}
								</div>
							</Card>
						</Col>
					);
				})}
			</Row>
		</div>
	);
};

export default EventSpeakers;
