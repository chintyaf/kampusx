import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Spinner } from 'react-bootstrap';
import api from '@/api/axios';
import { STORAGE_URL } from '@/api/storage';
import './EventCertificatePage.css';
import { notify } from '@/utils/notify';

// Mengimpor komponen-komponen yang telah dipisah
import Topbar from './Topbar';
import CanvasArea from './CanvasArea';
import SidebarList from './SidebarList';
import SidebarEdit from './SidebarEdit';
import { FIELDS } from './constants';
import EventLayout from '@/layouts/EventLayout';
import PreviewModal from '@/components/event/certificate/PreviewModal';

const EventCertificatePage = () => {
	const { eventId } = useParams();
	const fileInputRef = useRef(null);

	// Global State
	const [templateFile, setTemplateFile] = useState(null);
	const [backgroundPath, setBackgroundPath] = useState('');
	const [elements, setElements] = useState([]);
	const [selectedId, setSelectedId] = useState(null);
	const [saved, setSaved] = useState(false);
	const [showPreview, setShowPreview] = useState(false);

	const [isLoading, setIsLoading] = useState(true);
	const [isSaving, setIsSaving] = useState(false);
	const [isUploading, setIsUploading] = useState(false);

	// Memuat Google Fonts premium ketika halaman dibuka
	useEffect(() => {
		const link = document.createElement('link');
		link.rel = 'stylesheet';
		link.href =
			'https://fonts.googleapis.com/css2?family=Alex+Brush&family=Cinzel:wght@400;700&family=Great+Vibes&family=Montserrat:wght@400;700&family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Inter:wght@400;700&display=swap';
		document.head.appendChild(link);
		return () => {
			document.head.removeChild(link);
		};
	}, []);

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

		// Parse bold dan fontFamily dari font_family
		const rawFont = el.font_family || 'Arial';
		const bold = rawFont.includes('|bold');
		const fontFamily = rawFont.replace('|bold', '');

		return {
			id: el.id ? `db-${el.id}` : `ce-${Date.now()}-${Math.random()}`,
			fieldId,
			label: field?.key || '{ Kustom }',
			x: el.position_x,
			y: el.position_y,
			fontSize: el.font_size || (fieldId === 'f1' ? 64 : fieldId === 'f3' ? 80 : 24),
			bold: bold,
			fontFamily: fontFamily,
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
			font_size: el.fontSize || (el.fieldId === 'f3' ? 80 : 14),
			font_color: el.color || '#0f172a',
			font_family: `${el.fontFamily || 'Arial'}${el.bold ? '|bold' : ''}`,
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
							const imgRes = await api.get(
								`/event-dashboard/${eventId}/certificate/background-file`,
								{
									responseType: 'blob',
								},
							);
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
				},
			);

			const data = response.data.data;
			let bgUrl = URL.createObjectURL(file); // Langsung gunakan blob URL dari file lokal!
			setTemplateFile(bgUrl);
			setBackgroundPath(data.background_path);
		} catch (error) {
			console.error('Gagal mengunggah template:', error);
		} finally {
			setIsUploading(false);
		}
	};

	const handleSave = async () => {
		console.log('1. Tombol save ditekan!');

		if (!backgroundPath) {
			// Tambahkan parameter kedua untuk Title, dan ketiga untuk Message
			notify('error', 'Validasi Gagal', 'Silakan unggah gambar template terlebih dahulu.');
			return;
		}

		const hasQr = elements.some((el) => el.fieldId === 'f3');
		if (!hasQr) {
			notify(
				'error',
				'Validasi Gagal',
				'QR Code wajib dimasukkan ke dalam template sertifikat.',
			);
			return;
		}

		const hasName = elements.some((el) => el.fieldId === 'f1');
		if (!hasName) {
			notify(
				'error',
				'Validasi Gagal',
				'Nama peserta wajib dimasukkan ke dalam template sertifikat.',
			);
			return;
		}

		const elementsPayload = elements.map(mapElementToDb);

		setIsSaving(true);
		try {
			await api.post(`/event-dashboard/${eventId}/certificate`, {
				event_id: eventId,
				background_path: backgroundPath,
				canvas_width: 1920,
				canvas_height: 1080,
				elements: elementsPayload,
			});

			notify('success', 'Berhasil', 'Template Sertifikat berhasil disimpan!');

			setSaved(true);
			setTimeout(() => setSaved(false), 2000);
		} catch (error) {
			console.error('Gagal menyimpan template sertifikat:', error);
			notify('error', 'Gagal', 'Tidak bisa menyimpan template sertifikat');
			throw error;
		} finally {
			setIsSaving(false);
		}
	};

	const addField = (field) => {
		const el = {
			id: `ce-${Date.now()}-${Math.random()}`,
			fieldId: field.id,
			label: field.key,
			x: 30 + Math.random() * 40,
			y: 30 + Math.random() * 40,
			fontSize: field.id === 'f1' ? 64 : field.id === 'f3' ? 80 : 24,
			bold: field.id === 'f1',
			fontFamily: 'Arial',
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
				<div className="d-flex flex-column align-items-center justify-content-center py-5">
					<Spinner animation="border" variant="primary" className="mb-2" />
					<span className="text-muted">Memuat data template sertifikat...</span>
				</div>
			</EventLayout>
		);
	}

	return (
		<EventLayout
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
			}
		>
			<div className="d-flex flex-column certificate-builder">
				{/* Top Header */}
				<Topbar
					saved={saved}
					onSave={handleSave}
					onPreview={() => setShowPreview(true)}
					templateFile={templateFile}
					onFileTrigger={() => fileInputRef.current?.click()}
					isSaving={isSaving}
				/>

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
					onFileTrigger={() => fileInputRef.current?.click()}
				/>
			</div>

			<input
				ref={fileInputRef}
				type="file"
				accept="image/*"
				className="d-none"
				onChange={(e) => {
					const f = e.target.files?.[0];
					if (f) handleFileSelect(f);
					e.target.value = '';
				}}
			/>

			{/* Modal Preview Sertifikat */}
			<PreviewModal
				show={showPreview}
				onHide={() => setShowPreview(false)}
				templateFile={templateFile}
				elements={elements}
			/>
		</EventLayout>
	);
};

export default EventCertificatePage;
