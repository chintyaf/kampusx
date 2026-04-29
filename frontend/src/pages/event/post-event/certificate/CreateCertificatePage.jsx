import React, { useState } from 'react';
import { Container, Row, Col, Card, Button, Form } from 'react-bootstrap';
import { Upload, User, Hash, QrCode, Eye, Save, Info } from 'lucide-react'; // Tetap gunakan lucide untuk icon agar estetik
import FormHeading from '@/components/dashboard/FormHeading';

const CreateCertificatePage = () => {
	const [templateImage, setTemplateImage] = useState(null);

	const handleUpload = (e) => {
		const file = e.target.files[0];
		if (file) {
			setTemplateImage(URL.createObjectURL(file));
		}
	};

	return (
		<>
			<FormHeading
				heading="Certificate Template Editor"
				subheading="Upload template dan atur posisi field dinamis"
			/>

			<Row className="mt-4">
				{/* Sidebar Kiri */}
				<Col lg={3}>
					<div className="d-grid gap-4">
						{/* Section: Upload */}
						<Card className="border-0 border p-3">
							<Card.Title className="fs-6 fw-bold mb-3">Upload Template</Card.Title>
							<Form.Group>
								<Form.Label
									htmlFor="upload-file"
									className="btn btn-primary w-100 d-flex align-items-center justify-content-center gap-2 py-2 text-white">
									<Upload size={18} /> Choose File
								</Form.Label>
								<Form.Control
									type="file"
									id="upload-file"
									className="d-none"
									onChange={handleUpload}
									accept="image/*"
								/>
							</Form.Group>
						</Card>

						{/* Section: Dynamic Fields */}
						<Card className="border-0 border p-3">
							<Card.Title className="fs-6 fw-bold mb-3">Dynamic Fields</Card.Title>
							<div className="d-grid gap-2">
								<DynamicField icon={<User size={16} />} label="Nama Peserta" />
								<DynamicField icon={<Hash size={16} />} label="ID Sertifikat" />
								<DynamicField icon={<QrCode size={16} />} label="QR Code" />
							</div>
						</Card>

						{/* Section: Actions */}
						<Card className="border-0 border p-3">
							<Card.Title className="fs-6 fw-bold mb-3">Actions</Card.Title>
							<div className="d-grid gap-2">
								<Button
									variant="light"
									className="d-flex align-items-center justify-content-center gap-2 border text-secondary border py-2">
									<Eye size={18} /> Preview
								</Button>
								<Button
									variant="success"
									className="d-flex align-items-center justify-content-center gap-2 border py-2">
									<Save size={18} /> Save Template
								</Button>
							</div>
						</Card>

						{/* Tip Box */}
						<div
							className="p-3 rounded-3"
							style={{ backgroundColor: '#eef6ff', borderLeft: '4px solid #0d6efd' }}>
							<p className="small text-primary mb-0">
								<strong>Tip:</strong> Seret field dari panel ke template untuk
								mengatur posisi data dinamis.
							</p>
						</div>
					</div>
				</Col>

				{/* Main Canvas Area */}
				<Col lg={9}>
					<Card className="border-0 border overflow-hidden">
						<Card.Header className="bg-white py-3 d-flex justify-content-between align-items-center border-bottom-0">
							<h5 className="mb-0 fw-bold text-dark">Canvas</h5>
							<small className="text-muted">Fields: 0</small>
						</Card.Header>

						<Card.Body
							className="bg-light d-flex align-items-center justify-content-center p-5"
							style={{ minHeight: '600px' }}>
							{templateImage ? (
								<div className="position-relative shadow-lg rounded overflow-hidden bg-white">
									<img
										src={templateImage}
										alt="Template"
										className="img-fluid"
										style={{ maxHeight: '80vh' }}
									/>
									{/* Placeholder untuk field yang di-drop bisa ditaruh di sini */}
								</div>
							) : (
								<div
									className="w-100 d-flex flex-column align-items-center justify-content-center border border-2 border-dashed rounded-4 text-muted bg-white border"
									style={{ maxWidth: '800px', aspectRatio: '1.41/1' }}>
									<Upload size={48} className="mb-3 opacity-25" />
									<p className="mb-0">Upload template sertifikat</p>
								</div>
							)}
						</Card.Body>
					</Card>
				</Col>
			</Row>
		</>
	);
};

/**
 * Komponen pembantu untuk item field dinamis
 */
const DynamicField = ({ icon, label }) => (
	<div
		className="d-flex align-items-center gap-2 p-2 rounded border border-info-subtle bg-info-subtle text-info-emphasis cursor-pointer hover-shadow"
		style={{ cursor: 'grab', borderStyle: 'solid' }}>
		{icon}
		<span className="small fw-semibold">{label}</span>
	</div>
);

export default CreateCertificatePage;
