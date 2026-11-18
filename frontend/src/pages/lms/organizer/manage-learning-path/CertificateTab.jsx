import React, { useState } from 'react';
import { Row, Col } from 'react-bootstrap';
import BadgeForm from './certificate-tab/BadgeForm';
import CriteriaManager from './certificate-tab/CriteriaManager';
import BadgeList from './certificate-tab/BadgeList';
import { INITIAL_BADGES, T } from './certificate-tab/config';

// id: learningId (disimpan di tiap badge, siap dipakai untuk API)
const CertificateTab = ({ id: learningId }) => {
	const [badges, setBadges] = useState(INITIAL_BADGES);
	const [criteria, setCriteria] = useState({
		minScore: 75,
		forethought: true,
		reflection: true,
		autoMint: true,
	});

	const handleCreate = (values) =>
		setBadges([{ id: Date.now(), learningId, issued: 0, ...criteria, ...values }, ...badges]);

	return (
		<div className="d-grid gap-4">
			<div>
				<h2 className="h5 fw-bold m-0">Certificate & Badges</h2>
				<p className="m-0" style={{ color: T.muted, fontSize: T.fsm }}>
					Atur kriteria kelulusan, lalu terbitkan badge dan sertifikat untuk peserta Learning Path ini.
				</p>
			</div>

			<Row className="g-4">
				<Col lg={8} className="d-grid gap-4 align-content-start">
					<BadgeForm onCreate={handleCreate} />
					<CriteriaManager
						criteria={criteria}
						onChange={(patch) => setCriteria({ ...criteria, ...patch })}
					/>
				</Col>
				<Col lg={4}>
					<BadgeList badges={badges} />
				</Col>
			</Row>
		</div>
	);
};

export default CertificateTab;
