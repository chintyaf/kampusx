import React from 'react';
import { Card, Badge, Button } from 'react-bootstrap';
import { MessageSquare, CheckCircle2, Users, Star, ChevronRight } from 'lucide-react';

const SurveyCard = ({ survey, setSelectedSurveyId, setCurrentView }) => {
	return (
		<Card
			className="border rounded-4 overflow-hidden mb-3 shadow-sm"
			style={{ cursor: 'pointer', transition: 'all 0.2s', borderColor: '#e9ecef' }}
			onClick={() => {
				setSelectedSurveyId(survey.id);
				setCurrentView('detail');
			}}
			onMouseEnter={(e) => {
				e.currentTarget.classList.replace('shadow-sm', 'shadow');
			}}
			onMouseLeave={(e) => {
				e.currentTarget.classList.replace('shadow', 'shadow-sm');
			}}
		>
			<Card.Body className="p-4">
				<div className="d-flex align-items-start gap-3 align-content-center">
					{/* Ikon Kiri */}
					<div
						className={`p-3 rounded-3 d-flex align-items-center justify-content-center ${
							survey.status === 'aktif'
								? 'bg-primary-subtle text-primary'
								: 'bg-light text-secondary border'
						}`}
						style={{ minWidth: '56px', minHeight: '56px' }}
					>
						<MessageSquare size={24} />
					</div>

					{/* Informasi Utama */}
					<div className="flex-grow-1">
						<div className="d-flex align-items-center gap-2 mb-1 flex-wrap">
							<h5 className="mb-0 text-dark fw-bold">{survey.title}</h5>
							{survey.status === 'aktif' ? (
								<Badge
									bg="success-subtle"
									className="text-success rounded-pill d-flex align-items-center gap-1 border border-success-subtle fw-medium"
									style={{ padding: '0.35em 0.65em' }}
								>
									<CheckCircle2 size={12} />
									Aktif
								</Badge>
							) : (
								<Badge
									bg="light"
									className="text-secondary border rounded-pill text-dark fw-medium"
									style={{ padding: '0.35em 0.65em' }}
								>
									Draft
								</Badge>
							)}
						</div>
						<p className="text-muted small mb-3">{survey.description}</p>

						{/* Statistik / Detail Tambahan */}
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

					{/* Ikon Kanan (Panah) */}
					<div className="text-muted mt-2 d-none d-sm-block">
						<ChevronRight size={20} />
					</div>
				</div>
			</Card.Body>

			{/* Footer Kartu */}
			<div className="bg-light px-4 py-2 border-top d-flex justify-content-between align-items-center">
				<span className="small text-muted" style={{ fontSize: '0.8rem' }}>
					Dibuat pada {survey.createdAt}
				</span>
				<Button
					variant="outline-primary"
					size="sm"
					className="rounded-3 py-1 px-3 small fw-semibold primary-hover d-flex align-items-center gap-1"
					onClick={(e) => {
						e.stopPropagation();
						setSelectedSurveyId(survey.id);
						setCurrentView('responses');
					}}
				>
					Lihat Respon &rarr;
				</Button>
			</div>
		</Card>
	);
};

export default SurveyCard;
