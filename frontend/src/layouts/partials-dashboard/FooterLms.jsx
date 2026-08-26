import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { Globe } from 'lucide-react';
import LogoKampusX from "../../assets/images/logo/Logo_KampusX_White_Text.png";

const FooterLms = () => {
	return (
		<footer
			style={{
				background: '#091524',
				color: '#b0bccb',
				padding: '12px 0',
				fontSize: 'var(--font-sm)',
				borderTop: '1px solid rgba(255, 255, 255, 0.05)',
			}}
		>
			<Container>
				<Row className="align-items-center">
					<Col sm={6} className="text-center text-sm-start mb-2 mb-sm-0">
						<div className="d-flex align-items-center justify-content-center justify-content-sm-start gap-3">
							<img src={LogoKampusX} alt="KampusX" width="80" />
							<span style={{ fontSize: '12px', color: '#7c8b9e' }}>
								© 2026 KampusX. All rights reserved.
							</span>
						</div>
					</Col>
					<Col sm={6} className="text-center text-sm-end">
						<span className="d-inline-flex align-items-center gap-1" style={{ fontSize: '12px', color: '#7c8b9e' }}>
							<Globe size={12} /> Bahasa Indonesia
						</span>
					</Col>
				</Row>
			</Container>
		</footer>
	);
};

export default FooterLms;
