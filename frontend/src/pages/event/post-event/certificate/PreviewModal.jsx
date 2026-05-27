import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Modal, Button } from 'react-bootstrap';
import { toast } from 'react-hot-toast';
import html2pdf from 'html2pdf.js';
import QRCode from 'react-qr-code';
import { FIELDS } from './constants';

// Konstanta dasar untuk ukuran desain sertifikat (mencegah magic numbers)
const BASE_WIDTH = 1920;

const PreviewModal = ({ show, onHide, templateFile, elements }) => {
	const { eventId } = useParams();
	const previewContainerRef = useRef(null);
	const [previewWidth, setPreviewWidth] = useState(900);

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
	// 2. HELPER: Menghitung skala elemen
	// ==========================================
	// Fungsi ini menggantikan rumus matematika berulang di inline styles
	const scale = (value, defaultVal = 0) => {
		return ((value || defaultVal) / BASE_WIDTH) * previewWidth;
	};

	// ==========================================
	// 3. ACTION: Mengunduh PDF
	// ==========================================
	const handleDownloadPDF = () => {
		const element = document.getElementById('certificate-preview-area');
		if (!element) return;

		const width = element.offsetWidth;
		const height = element.offsetHeight;

		const pdfWidth = Math.round(width * 0.75);
		// Tambahan 2pt untuk mencegah overflow pembulatan yang bisa membuat halaman kosong ekstra
		const pdfHeight = Math.round(height * 0.75) + 2;

		const opt = {
			margin: 0,
			filename: `sertifikat_${eventId}.pdf`,
			image: { type: 'jpeg', quality: 0.98 },
			html2canvas: {
				scale: 2,
				useCORS: true,
				logging: false,
			},
			jsPDF: {
				unit: 'pt',
				format: [pdfWidth, pdfHeight],
				orientation: pdfWidth > pdfHeight ? 'landscape' : 'portrait',
			},
			pagebreak: { mode: 'avoid-all' },
		};

		toast.promise(html2pdf().set(opt).from(element).save(), {
			loading: 'Menyiapkan berkas PDF...',
			success: 'Sertifikat PDF berhasil diunduh!',
			error: 'Gagal mengunduh berkas PDF.',
		});
	};

	// ==========================================
	// 4. RENDERER: Merender elemen spesifik
	// ==========================================
	const renderElement = (el) => {
		const field = FIELDS.find((f) => f.id === el.fieldId);
		const displayText = field?.example || el.label;
		const isQRCode = el.fieldId === 'f3';

		// Gaya dasar posisi container
		const containerStyle = {
			left: `${el.x}%`,
			top: `${el.y}%`,
			position: 'absolute',
		};

		// Render QR Code
		if (isQRCode) {
			const qrSize = scale(el.fontSize, 80);
			const qrPadding = scale(4);

			return (
				<div key={el.id} className="cert-preview-element" style={containerStyle}>
					<div
						className="cert-preview-qr"
						style={{
							width: `${qrSize}px`,
							height: `${qrSize}px`,
							borderRadius: `${qrPadding}px`,
							backgroundColor: '#ffffff',
							padding: `${qrPadding}px`,
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
							boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
						}}
					>
						<QRCode
							value={`${window.location.origin}/certificate/verify/PREVIEW-TICKET`}
							size={Math.max(16, Math.round(qrSize) - 8)}
							fgColor={el.color === '#ffffff' ? '#000000' : el.color}
							bgColor="#ffffff"
							style={{ height: '100%', width: '100%' }}
						/>
					</div>
				</div>
			);
		}

		// Render Teks Biasa
		return (
			<div key={el.id} className="cert-preview-element" style={containerStyle}>
				<p
					className="m-0 text-nowrap lh-1 text-center"
					style={{
						fontSize: `${scale(el.fontSize)}px`,
						fontWeight: el.bold ? 700 : 400,
						color: el.color,
						fontFamily: el.fontFamily || 'Arial',
					}}
				>
					{displayText}
				</p>
			</div>
		);
	};

	// ==========================================
	// 5. KOMPONEN UTAMA (JSX Utama)
	// ==========================================
	return (
		<Modal show={show} onHide={onHide} size="xl" centered>
			<Modal.Header closeButton className="bg-light border-bottom-0 py-3 px-4">
				<label className="fw-bold text-dark d-flex align-items-center gap-2">
					Preview E-Sertifikat
				</label>
			</Modal.Header>

			<Modal.Body className="d-flex flex-column align-items-center justify-content-center bg-light bg-opacity-50 py-2 px-4 overflow-auto">
				{templateFile ? (
					<div
						className="bg-white overflow-hidden rounded-3 border cert-preview-wrapper"
						style={{ maxWidth: '700px' }}
					>
						<div
							id="certificate-preview-area"
							ref={previewContainerRef}
							className="position-relative cert-preview-area"
						>
							<img
								src={templateFile}
								alt="Sertifikat Preview"
								className="cert-preview-bg"
								style={{ width: '100%', height: 'auto', display: 'block' }}
							/>
							{/* Pemanggilan elemen jadi sangat bersih */}
							{elements.map(renderElement)}
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
