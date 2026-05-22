import React, { useState } from 'react';
import { Container, Row, Col, Card, Button, Form, Badge, InputGroup } from 'react-bootstrap';
import {
	Menu,
	Home,
	Calendar,
	Users,
	FileText,
	Award,
	Package,
	BarChart3,
	Megaphone,
	ChevronDown,
	ChevronRight,
	Bell,
	Plus,
	MessageSquare,
	CheckCircle2,
	Search,
	Star,
	CheckCheck,
} from 'lucide-react';
import SurveyDetailPage from './SurveyDetailPage';
import EventLayout from '@/layouts/EventLayout';

const SurveyCard = ({ survey, setSelectedSurveyId, setCurrentView }) => {
	return (
		<>
			<Card
				key={survey.id}
				className="border rounded-4 overflow-hidden"
				style={{ cursor: 'pointer', transition: 'all 0.2s' }}
				onClick={() => {
					setSelectedSurveyId(survey.id);
					setCurrentView('detail');
				}}
			>
				<Card.Body className="p-4">
					<div className="d-flex align-items-start gap-3 align-content-center">
						<div
							className={`p-3 rounded-3 ${survey.status === 'aktif' ? 'bg-primary-subtle text-primary' : 'bg-light text-secondary'} d-flex align-items-center justify-content-center`}
						>
							<MessageSquare size={20} />
						</div>
						<div className="flex-grow-1">
							<div className="d-flex align-items-center gap-2 mb-1">
								<h5 className="mb-0 text-dark fw-bold">{survey.title}</h5>
								{survey.status === 'aktif' ? (
									<Badge
										bg="success-subtle"
										className="text-success rounded-pill d-flex align-items-center gap-1"
									>
										<CheckCircle2 size={12} />
										Aktif
									</Badge>
								) : (
									<Badge
										bg="light"
										className="text-secondary border rounded-pill text-dark"
									>
										Draft
									</Badge>
								)}
							</div>
							<p className="text-muted small mb-3">{survey.description}</p>

							{survey.responses > 0 ? (
								<div className="d-flex align-items-center gap-3 small text-muted flex-wrap">
									<div className="d-flex align-items-center gap-1">
										<Users size={14} /> {survey.responses} respons
									</div>
									<div className="d-flex align-items-center gap-1">
										<CheckCircle2 size={14} /> {survey.completionRate}% selesai
									</div>
									{survey.avgRating !== null && (
										<div className="d-flex align-items-center gap-1 text-warning fw-medium">
											<Star size={14} className="fill-warning text-warning" />{' '}
											{survey.avgRating} avg
										</div>
									)}
									{survey.session && (
										<Badge
											bg="primary-subtle"
											className="text-primary rounded-pill fw-normal"
										>
											{survey.session}
										</Badge>
									)}
								</div>
							) : (
								<div className="d-flex align-items-center gap-1 small text-muted">
									<Users size={14} /> 0 respons
								</div>
							)}
						</div>
						<div className="text-muted mt-2">
							<ChevronRight size={20} />
						</div>
					</div>
				</Card.Body>
				<div className="bg-light px-4 py-2 border-top">
					<span className="small text-muted">Dibuat {survey.createdAt}</span>
				</div>
			</Card>
		</>
	);
};

export default SurveyCard;
