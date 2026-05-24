import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Modal, Button } from 'react-bootstrap';
import { toast } from 'react-hot-toast';
import html2pdf from 'html2pdf.js';
import QRCode from 'react-qr-code';
import { FIELDS } from './constants';

const PreviewModal = ({ show, onHide, templateFile, elements }) => {
	const { eventId } = useParams();
	const previewContainerRef = useRef(null);
	const [previewWidth, setPreviewWidth] = useState(900);

	useEffect(() => {
		if (!show || !previewContainerRef.current) return;
		const observer = new ResizeObserver((entries) => {
			for (let entry of entries) {
				const width = entry.contentRect.width;
				if (width > 0) {
					setPreviewWidth(width);
				}
			}
		});
		observer.observe(previewContainerRef.current);
		return () => observer.disconnect();
	}, [show, templateFile]);

	const handleDownloadPDF = () => {
		const element = document.getElementById('certificate-preview-area');
		if (!element) return;

		const width = element.offsetWidth;
		const height = element.offsetHeight;

		const pdfWidth = Math.round(width * 0.75);
		// Add a tiny 2pt safety buffer to prevent float rounding overflows from triggering an extra blank page
		const pdfHeight = Math.round(height * 0.75) + 2;

		// Options for html2pdf
		const opt = {
			margin: 0,
			filename: `sertifikat_${eventId}.pdf`,
			image: { type: 'jpeg', quality: 0.98 },
			html2canvas: {
				scale: 2, // High resolution rendering
				useCORS: true, // Crucial to load background images from local domain/storage
				logging: false,
			},
			jsPDF: {
				unit: 'pt',
				format: [pdfWidth, pdfHeight],
				orientation: pdfWidth > pdfHeight ? 'landscape' : 'portrait',
			},
			pagebreak: { mode: 'avoid-all' }, // Avoid splitting content into multiple pages
		};

		// Run html2pdf
		toast.promise(html2pdf().set(opt).from(element).save(), {
			loading: 'Menyiapkan berkas PDF...',
			success: 'Sertifikat PDF berhasil diunduh!',
			error: 'Gagal mengunduh berkas PDF.',
		});
	};

	return (
		<Modal show={show} onHide={onHide} size="xl" centered>
			<Modal.Header closeButton className="bg-light border-bottom-0 py-3 px-4">
				<Modal.Title className="fw-bold text-dark d-flex align-items-center gap-2">
					Preview E-Sertifikat
				</Modal.Title>
			</Modal.Header>
			<Modal.Body className="d-flex flex-column align-items-center justify-content-center bg-light bg-opacity-50 py-5 px-4 overflow-auto">
				{templateFile ? (
					<div className="shadow-lg bg-white overflow-hidden rounded-3 border cert-preview-wrapper">
						<div
							id="certificate-preview-area"
							ref={previewContainerRef}
							className="position-relative cert-preview-area"
						>
							<img
								src={templateFile}
								alt="Sertifikat Preview"
								className="cert-preview-bg"
							/>
							{/* Render preview elements without outline/draggable handles */}
							{elements.map((el) => {
								const field = FIELDS.find((f) => f.id === el.fieldId);
								const displayText = field?.example || el.label;

								return (
									<div
										key={el.id}
										className="cert-preview-element"
										style={{
											left: `${el.x}%`,
											top: `${el.y}%`,
										}}
									>
										{el.fieldId === 'f3' ? (
											<div
												className="cert-preview-qr"
												style={{
													width: `${((el.fontSize || 80) / 1920) * previewWidth}px`,
													height: `${((el.fontSize || 80) / 1920) * previewWidth}px`,
													borderRadius: `${(4 / 1920) * previewWidth}px`,
													backgroundColor: '#ffffff',
													padding: `${(4 / 1920) * previewWidth}px`,
													display: 'flex',
													alignItems: 'center',
													justifyContent: 'center',
													boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
												}}
											>
												<QRCode
													value={`${window.location.origin}/test-chin/sertifikat/${eventId || 'PREVIEW-TEMP'}`}
													size={Math.max(16, Math.round(((el.fontSize || 80) / 1920) * previewWidth) - 8)}
													fgColor={el.color === '#ffffff' ? '#000000' : el.color}
													bgColor="#ffffff"
													style={{ height: '100%', width: '100%' }}
												/>
											</div>
										) : (
											<p
												className="m-0 text-nowrap lh-1 text-center"
												style={{
													fontSize: `${(el.fontSize / 1920) * previewWidth}px`,
													fontWeight: el.bold ? 700 : 400,
													color: el.color,
													fontFamily: el.fontFamily || 'Arial',
												}}
											>
												{displayText}
											</p>
										)}
									</div>
								);
							})}
						</div>
					</div>
				) : (
					<div className="text-center py-5 text-muted">
						<p className="m-0 fw-medium">
							Silakan unggah template terlebih dahulu untuk melihat preview.
						</p>
					</div>
				)}
			</Modal.Body>
			<Modal.Footer className="bg-light border-top-0 py-3 px-4 d-flex justify-content-between">
				<Button
					variant="primary"
					className="px-4 fw-semibold d-flex align-items-center gap-2"
					onClick={handleDownloadPDF}
				>
					Download PDF
				</Button>
				<Button variant="secondary" className="px-4 fw-semibold" onClick={onHide}>
					Tutup
				</Button>
			</Modal.Footer>
		</Modal>
	);
};

export default PreviewModal;
