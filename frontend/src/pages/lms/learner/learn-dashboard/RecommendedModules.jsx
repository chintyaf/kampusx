import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Row, Col } from 'react-bootstrap';
import Icon from './Icon';
import LmsGridCard from '@/components/lms/LmsGridCard';

const RecommendedModules = ({ modules = [], onOpen, onExploreAll }) => {
	const navigate = useNavigate();

	return (
		<section>
			<div className="ld-section-head">
				<div>
					<h2 className="ld-title">Rekomendasi untuk Kamu</h2>
					<p className="ld-sub">
						Disusun dari kecocokan konten, pola belajar member lain, dan tingkat
						kesiapanmu
					</p>
				</div>
				<button
					type="button"
					className="ld-link"
					onClick={() =>
						onExploreAll ? onExploreAll() : navigate('/explore-microlearning')
					}
				>
					Jelajahi semua <Icon name="arrow-right" size={14} />
				</button>
			</div>

			{modules.length === 0 ? (
				<p className="ld-empty">Belum ada rekomendasi untuk saat ini.</p>
			) : (
				<Row className="g-3">
					{modules.map((m) => (
						<Col key={m.id} xs={12} md={6} xl={3}>
							<LmsGridCard item={m} onNavigate={onOpen} />
						</Col>
					))}
				</Row>
			)}
		</section>
	);
};

export default RecommendedModules;
