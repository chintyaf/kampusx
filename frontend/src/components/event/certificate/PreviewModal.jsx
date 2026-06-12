import React, { useState, useEffect, useRef } from 'react';
import { Modal, Button } from 'react-bootstrap';
import { toast } from 'react-hot-toast';
import html2pdf from 'html2pdf.js';
import QRCode from 'react-qr-code';
import { Award, Download } from 'lucide-react';
// Hapus import FIELDS jika tidak digunakan lagi di sini

const PreviewModal = ({ show, onHide, templateFile, elements, previewData = {} }) => {
	const previewContainerRef = useRef(null);
	const [previewWidth, setPreviewWidth] = useState(720);

	// ==========================================
	// 1. OBSERVER: Menyesuaikan ukuran responsif
	// ==========================================
	useEffect(() => {
		if (!show || !previewContainerRef.current) return;

		const observer = new ResizeObserver((entries) => {
			for (let entry of entries) {
				const width = entry.contentRect.width;
				if (width > 0) setPreviewWidth(width);
			}
		});

		observer.observe(previewContainerRef.current);
		return () => observer.disconnect();
	}, [show, templateFile]);

	// ==========================================
	// 2. ACTION: Mengunduh PDF
	// ==========================================
	const handleDownloadPDF = () => {
		const element = document.getElementById('certificate-preview-area');
		if (!element) {
			toast.error('Gagal mendeteksi area sertifikat.');
			return;
		}

		const width = element.offsetWidth;
		const height = element.offsetHeight;
		const pdfWidth = Math.round(width * 0.75);
		const pdfHeight = Math.round(height * 0.75) + 2;

		const opt = {
			margin: 0,
			filename: `Sertifikat - ${previewData?.f4 || 'Event'} - ${previewData?.f1 || 'Peserta'}.pdf`,
			image: { type: 'jpeg', quality: 1.0 },
			html2canvas: {
				scale: 3,
				useCORS: true,
				allowTaint: true,
				logging: false,
			},
			jsPDF: {
				unit: 'pt',
				format: [pdfWidth, pdfHeight],
				orientation: pdfWidth > pdfHeight ? 'landscape' : 'portrait',
			},
			pagebreak: { mode: 'avoid-all' },
		};

		toast.promise(html2pdf().from(element).set(opt).save(), {
			loading: 'Sedang memproses unduhan sertifikat...',
			success: 'Sertifikat PDF berhasil diunduh!',
			error: 'Gagal mengunduh sertifikat.',
		});
	};

	// ==========================================
	// 3. KOMPONEN UTAMA (JSX Utama)
	// ==========================================
	return (
		<Modal show={show} onHide={onHide} size="lg" centered>
			<Modal.Header closeButton className="border-0 pb-3">
				<Modal.Title className="fw-bold d-flex align-items-center gap-2 mb-0 fs-3 text-dark">
					<Award className="text-primary" size={24} strokeWidth={2.5} />
					Preview E-Sertifikat
				</Modal.Title>
			</Modal.Header>

			<Modal.Body className="text-center py-4">
				{templateFile ? (
					<div className="d-flex flex-column align-items-center">
						<div
							className="bg-white overflow-hidden border rounded-4 shadow-sm w-100 mb-4"
							style={{ maxWidth: '720px' }}
						>
							<div
								id="certificate-preview-area"
								ref={previewContainerRef}
								className="position-relative w-100 overflow-hidden"
							>
								<img
									src={templateFile}
									alt="Certificate Background"
									className="w-100 h-100"
									crossOrigin={
										templateFile && templateFile.startsWith('blob:')
											? undefined
											: 'anonymous'
									}
									style={{ display: 'block', objectFit: 'fill' }}
								/>

								{elements.map((el) => {
									const xPct = el.x;
									const yPct = el.y;

									// Prioritas 1: Data dari Parent (previewData)
									// Prioritas 2: Label bawaan dari Database (el.label)
									const displayContent = previewData[el.fieldId] || el.label;

									if (el.fieldId === 'f3') {
										const qrSize = (el.fontSize / 1920) * previewWidth;
										const qrPadding = (4 / 1920) * previewWidth;
										return (
											<div
												key={el.id}
												className="position-absolute bg-white"
												style={{
													left: `${xPct}%`,
													top: `${yPct}%`,
													transform: 'translate(-50%, -50%)',
													borderRadius: `${qrPadding}px`,
													boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
													width: `${qrSize}px`,
													height: `${qrSize}px`,
													padding: `${qrPadding}px`,
													display: 'flex',
													alignItems: 'center',
													justifyContent: 'center',
												}}
											>
												<QRCode
													value={displayContent || '-'}
													size={Math.max(16, Math.round(qrSize) - 8)}
													fgColor={
														el.color === '#ffffff'
															? '#000000'
															: el.color
													}
													bgColor="#ffffff"
													style={{ height: '100%', width: '100%' }}
												/>
											</div>
										);
									} else {
										const scaledFontSize = (el.fontSize / 1920) * previewWidth;
										return (
											<div
												key={el.id}
												className="position-absolute text-nowrap lh-1 text-center"
												style={{
													left: `${xPct}%`,
													top: `${yPct}%`,
													transform: 'translate(-50%, -50%)',
													fontSize: `${scaledFontSize}px`,
													color: el.color || '#000',
													fontFamily: el.fontFamily || 'Arial',
													fontWeight: el.bold ? 'bold' : 'normal',
													textAlign: el.textAlign || 'center',
												}}
											>
												{displayContent}
											</div>
										);
									}
								})}
							</div>
						</div>

						<div className="d-flex gap-2 w-100 justify-content-center">
							<Button
								variant="primary"
								onClick={handleDownloadPDF}
								className="rounded-pill py-2.5 px-4 fw-bold shadow-sm d-flex align-items-center justify-content-center gap-2"
							>
								<Download size={18} /> Unduh PDF Resmi
							</Button>
						</div>
					</div>
				) : (
					<div className="text-center py-5 text-muted">
						<div className="bg-light text-secondary rounded-circle p-4 d-inline-flex mb-4 border border-2 border-dashed">
							<Award size={48} className="opacity-75" />
						</div>
						<p className="m-0 fw-medium">
							Silakan unggah template terlebih dahulu untuk melihat preview.
						</p>
					</div>
				)}
			</Modal.Body>
		</Modal>
	);
};

export default PreviewModal;
