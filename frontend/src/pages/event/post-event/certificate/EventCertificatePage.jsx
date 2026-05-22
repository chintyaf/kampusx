import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Spinner, Modal, Button } from 'react-bootstrap';
import { toast, Toaster } from 'react-hot-toast';
import api from '@/api/axios';
import { STORAGE_URL } from '@/api/storage';
import html2pdf from 'html2pdf.js';
import './EventCertificatePage.css';

// Mengimpor komponen-komponen yang telah dipisah
import Topbar from './Topbar';
import CanvasArea from './CanvasArea';
import SidebarList from './SidebarList';
import SidebarEdit from './SidebarEdit';
import { FIELDS, QR_PATTERN } from './constants';
import EventLayout from '@/layouts/EventLayout';

const EventCertificatePage = () => {
	const { eventId } = useParams();

	// Global State
	const [templateFile, setTemplateFile] = useState(null);
	const [backgroundPath, setBackgroundPath] = useState('');
	const [elements, setElements] = useState([]);
	const [selectedId, setSelectedId] = useState(null);
	const [saved, setSaved] = useState(false);
	const [showPreview, setShowPreview] = useState(false);

	const previewContainerRef = useRef(null);
	const [previewWidth, setPreviewWidth] = useState(900);

	useEffect(() => {
		if (!showPreview || !previewContainerRef.current) return;
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
	}, [showPreview, templateFile]);

	const [isLoading, setIsLoading] = useState(true);
	const [isSaving, setIsSaving] = useState(false);
	const [isUploading, setIsUploading] = useState(false);

	// Derived State
	const selectedEl = elements.find((e) => e.id === selectedId) ?? null;

	// Mapping functions
	const mapDbToElement = useCallback((el) => {
		let fieldId = 'f7'; // fallback to teks kustom
		if (el.element_type === 'nama_peserta') fieldId = 'f1';
		else if (el.element_type === 'id_sertifikat') fieldId = 'f2';
		else if (el.element_type === 'qr_code') fieldId = 'f3';
		else if (el.element_type === 'nama_event') fieldId = 'f4';
		else if (el.element_type === 'tanggal') fieldId = 'f5';
		else if (el.element_type === 'instansi') fieldId = 'f6';
		else if (el.element_type === 'teks_kustom') fieldId = 'f7';

		const field = FIELDS.find((f) => f.id === fieldId);

		// Parse bold from font_family
		const bold = el.font_family ? el.font_family.includes('|bold') : false;

		return {
			id: el.id ? `db-${el.id}` : `ce-${Date.now()}-${Math.random()}`,
			fieldId,
			label: field?.key || '{ Kustom }',
			x: el.position_x,
			y: el.position_y,
			fontSize: el.font_size || (fieldId === 'f1' ? 64 : 24),
			bold: bold,
			color: el.font_color || '#0f172a',
		};
	}, []);

	const mapElementToDb = (el) => {
		let element_type = 'teks_kustom';
		if (el.fieldId === 'f1') element_type = 'nama_peserta';
		else if (el.fieldId === 'f2') element_type = 'id_sertifikat';
		else if (el.fieldId === 'f3') element_type = 'qr_code';
		else if (el.fieldId === 'f4') element_type = 'nama_event';
		else if (el.fieldId === 'f5') element_type = 'tanggal';
		else if (el.fieldId === 'f6') element_type = 'instansi';
		else if (el.fieldId === 'f7') element_type = 'teks_kustom';

		return {
			element_type,
			position_x: el.x,
			position_y: el.y,
			font_size: el.fontSize || 14,
			font_color: el.color || '#0f172a',
			font_family: `Arial${el.bold ? '|bold' : ''}`,
			text_align: 'center',
			custom_value: null,
		};
	};

	// 1. Fetch Template data on Mount
	useEffect(() => {
		const fetchTemplate = async () => {
			setIsLoading(true);
			try {
				const response = await api.get(`/event-dashboard/${eventId}/certificate`);
				const template = response.data.data;
				if (template) {
					// Resolve background image URL menggunakan blob untuk menghindari isu CORS
					let bgUrl = '';
					if (template.background_path) {
						try {
							const imgRes = await api.get(`/event-dashboard/${eventId}/certificate/background-file`, {
								responseType: 'blob'
							});
							bgUrl = URL.createObjectURL(imgRes.data);
						} catch (err) {
							console.error('Gagal memuat blob background gambar:', err);
							// Fallback ke public storage URL
							const cleanPath = template.background_path.startsWith('/')
								? template.background_path.slice(1)
								: template.background_path;
							bgUrl = `${STORAGE_URL}/${cleanPath}`;
						}
					}
					setTemplateFile(bgUrl);
					setBackgroundPath(template.background_path);

					// Map elements to fields
					if (template.elements && template.elements.length > 0) {
						const mappedFields = template.elements.map(mapDbToElement);
						setElements(mappedFields);
					} else {
						setElements([]);
					}
				} else {
					setElements([]);
				}
			} catch (error) {
				console.error('Gagal memuat template sertifikat:', error);
				toast.error('Gagal memuat data template sertifikat.');
			} finally {
				setIsLoading(false);
			}
		};

		fetchTemplate();
	}, [eventId, mapDbToElement]);

	// Handlers
	const handleFileSelect = async (file) => {
		if (!file) return;
		const formData = new FormData();
		formData.append('background', file);

		setIsUploading(true);
		try {
			const response = await api.post(
				`/event-dashboard/${eventId}/certificate/upload-background`,
				formData,
				{
					headers: {
						'Content-Type': 'multipart/form-data',
					},
				}
			);

			const data = response.data.data;
			let bgUrl = URL.createObjectURL(file); // Langsung gunakan blob URL dari file lokal!
			setTemplateFile(bgUrl);
			setBackgroundPath(data.background_path);
			toast.success('Gambar template berhasil diunggah!');
		} catch (error) {
			console.error('Gagal mengunggah template:', error);
			toast.error('Gagal mengunggah gambar template.');
		} finally {
			setIsUploading(false);
		}
	};

	const handleSave = async () => {
		if (!backgroundPath) {
			toast.error('Silakan unggah gambar template terlebih dahulu.');
			return;
		}

		setIsSaving(true);
		const elementsPayload = elements.map(mapElementToDb);

		try {
			await api.post(`/event-dashboard/${eventId}/certificate`, {
				event_id: eventId,
				background_path: backgroundPath,
				canvas_width: 1920,
				canvas_height: 1080,
				elements: elementsPayload,
			});

			toast.success('Template Sertifikat berhasil disimpan!');
			setSaved(true);
			setTimeout(() => setSaved(false), 2000);
		} catch (error) {
			console.error('Gagal menyimpan template sertifikat:', error);
			toast.error('Gagal menyimpan template sertifikat.');
			throw error;
		} finally {
			setIsSaving(false);
		}
	};

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
				logging: false
			},
			jsPDF: { 
				unit: 'pt', 
				format: [pdfWidth, pdfHeight],
				orientation: pdfWidth > pdfHeight ? 'landscape' : 'portrait'
			},
			pagebreak: { mode: 'avoid-all' } // Avoid splitting content into multiple pages
		};

		// Run html2pdf
		toast.promise(
			html2pdf().set(opt).from(element).save(),
			{
				loading: 'Menyiapkan berkas PDF...',
				success: 'Sertifikat PDF berhasil diunduh!',
				error: 'Gagal mengunduh berkas PDF.',
			}
		);
	};

	const addField = (field) => {
		const el = {
			id: `ce-${Date.now()}-${Math.random()}`,
			fieldId: field.id,
			label: field.key,
			x: 30 + Math.random() * 40,
			y: 30 + Math.random() * 40,
			fontSize: field.id === 'f1' ? 64 : 24,
			bold: field.id === 'f1',
			color: '#0f172a',
		};
		setElements((p) => [...p, el]);
		setSelectedId(el.id);
	};

	const updateEl = useCallback((id, patch) => {
		setElements((p) => p.map((e) => (e.id === id ? { ...e, ...patch } : e)));
	}, []);

	const deleteEl = (id) => {
		setElements((p) => p.filter((e) => e.id !== id));
		setSelectedId(null);
	};

	if (isLoading) {
		return (
			<EventLayout
				title="Buat Sertifikat"
				description="Klik elemen untuk mengedit · Tarik untuk memindahkan"
			>
				<Toaster position="top-right" />
				<div className="d-flex flex-column align-items-center justify-content-center py-5">
					<Spinner animation="border" variant="primary" className="mb-2" />
					<span className="text-muted">Memuat data template sertifikat...</span>
				</div>
			</EventLayout>
		);
	}

	return (
		<EventLayout
			title="Buat Sertifikat"
			description="Klik elemen untuk mengedit · Tarik untuk memindahkan"
			onSave={handleSave}
			sidebar={
				selectedEl ? (
					<SidebarEdit
						selectedEl={selectedEl}
						updateEl={updateEl}
						deleteEl={deleteEl}
						clearSelection={() => setSelectedId(null)}
					/>
				) : (
					<SidebarList
						elements={elements}
						addField={addField}
						deleteEl={deleteEl}
						setSelectedId={setSelectedId}
					/>
				)
			}>
			<Toaster position="top-right" />
			<div className="d-flex flex-column certificate-builder">
				{/* Top Header */}
				<Topbar saved={saved} onSave={handleSave} onPreview={() => setShowPreview(true)} />

				{/* Main Body */}
				{/* Canvas / Gambar Sertifikat */}
				<CanvasArea
					templateFile={templateFile}
					elements={elements}
					selectedId={selectedId}
					onFileSelect={handleFileSelect}
					setSelectedId={setSelectedId}
					updateEl={updateEl}
					isUploading={isUploading}
				/>
			</div>

			{/* Modal Preview Sertifikat */}
			<Modal
				show={showPreview}
				onHide={() => setShowPreview(false)}
				size="xl"
				centered
			>
				<Modal.Header closeButton className="bg-light border-bottom-0 py-3 px-4">
					<Modal.Title className="fw-bold text-dark d-flex align-items-center gap-2">
						Preview E-Sertifikat
					</Modal.Title>
				</Modal.Header>
				<Modal.Body className="d-flex flex-column align-items-center justify-content-center bg-light bg-opacity-50 py-5 px-4 overflow-auto">
					{templateFile ? (
						<div
							className="shadow-lg bg-white overflow-hidden rounded-3 border"
							style={{
								width: '100%',
								maxWidth: '900px',
							}}
						>
							<div
								id="certificate-preview-area"
								ref={previewContainerRef}
								className="position-relative"
								style={{
									display: 'block',
									width: '100%',
									userSelect: 'none',
									breakInside: 'avoid',
									pageBreakInside: 'avoid',
								}}
							>
								<img
									src={templateFile}
									alt="Sertifikat Preview"
									style={{
										width: '100%',
										height: 'auto',
										display: 'block',
										pointerEvents: 'none',
									}}
								/>
								{/* Render preview elements without outline/draggable handles */}
								{elements.map((el) => {
									const field = FIELDS.find((f) => f.id === el.fieldId);
									const displayText = field?.example || el.label;

									return (
										<div
											key={el.id}
											style={{
												position: 'absolute',
												left: `${el.x}%`,
												top: `${el.y}%`,
												transform: 'translate(-50%, -50%)',
												pointerEvents: 'none',
												userSelect: 'none',
											}}
										>
											{el.fieldId === 'f3' ? (
												<div
													style={{
														width: `${(50 / 1920) * previewWidth}px`,
														height: `${(50 / 1920) * previewWidth}px`,
														borderRadius: `${(4 / 1920) * previewWidth}px`,
														backgroundColor: el.color === '#ffffff' ? '#000' : el.color,
														display: 'grid',
														gridTemplateColumns: 'repeat(5, 1fr)',
														gap: `${(2 / 1920) * previewWidth}px`,
														padding: `${(4 / 1920) * previewWidth}px`,
													}}
												>
													{QR_PATTERN.map((on, i) => (
														<div
															key={i}
															style={{
																backgroundColor: on ? '#fff' : 'transparent',
																borderRadius: `${(1 / 1920) * previewWidth}px`,
															}}
														/>
													))}
												</div>
											) : (
												<p
													className="m-0 text-nowrap lh-1 text-center"
													style={{
														fontSize: `${(el.fontSize / 1920) * previewWidth}px`,
														fontWeight: el.bold ? 700 : 400,
														color: el.color,
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
							<p className="m-0 fw-medium">Silakan unggah template terlebih dahulu untuk melihat preview.</p>
						</div>
					)}
				</Modal.Body>
				<Modal.Footer className="bg-light border-top-0 py-3 px-4 d-flex justify-content-between">
					<Button variant="primary" className="px-4 fw-semibold d-flex align-items-center gap-2" onClick={handleDownloadPDF}>
						Download PDF
					</Button>
					<Button variant="secondary" className="px-4 fw-semibold" onClick={() => setShowPreview(false)}>
						Tutup
					</Button>
				</Modal.Footer>
			</Modal>
		</EventLayout>
	);
};

export default EventCertificatePage;
