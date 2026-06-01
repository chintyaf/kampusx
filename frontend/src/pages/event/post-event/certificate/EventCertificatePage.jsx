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

// ==========================================
// PURE FUNCTIONS (Dipindah ke luar komponen)
// ==========================================
const typeToFieldId = {
	nama_peserta: 'f1',
	id_sertifikat: 'f2',
	qr_code: 'f3',
	nama_event: 'f4',
	tanggal: 'f5',
	instansi: 'f6',
	teks_kustom: 'f7',
};

const fieldIdToType = Object.fromEntries(Object.entries(typeToFieldId).map(([k, v]) => [v, k]));

const mapDbToElement = (el) => {
	const fieldId = typeToFieldId[el.element_type] || 'f7';
	const field = FIELDS.find((f) => f.id === fieldId);

	const rawFont = el.font_family || 'Arial';
	const bold = rawFont.includes('|bold');
	const fontFamily = rawFont.replace('|bold', '');

	return {
		id: el.id ? `db-${el.id}` : `ce-${Date.now()}-${Math.random()}`,
		fieldId,
		label: fieldId === 'f7' ? (el.custom_value || 'Teks Kustom') : (field?.key || '{ Kustom }'),
		x: el.position_x,
		y: el.position_y,
		fontSize: el.font_size || (fieldId === 'f1' ? 64 : fieldId === 'f3' ? 80 : 24),
		bold,
		fontFamily,
		color: el.font_color || '#0f172a',
	};
};

const mapElementToDb = (el) => ({
	element_type: fieldIdToType[el.fieldId] || 'teks_kustom',
	position_x: el.x,
	position_y: el.y,
	font_size: el.fontSize || (el.fieldId === 'f3' ? 80 : 14),
	font_color: el.color || '#0f172a',
	font_family: `${el.fontFamily || 'Arial'}${el.bold ? '|bold' : ''}`,
	text_align: 'center',
	custom_value: el.fieldId === 'f7' ? el.label : null,
});

// ==========================================
// MAIN COMPONENT
// ==========================================
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

	const selectedEl = elements.find((e) => e.id === selectedId) ?? null;

	// Fetch Template data on Mount
	useEffect(() => {
		const fetchTemplate = async () => {
			setIsLoading(true);
			try {
				const response = await api.get(`/event-dashboard/${eventId}/certificate`);
				const template = response.data.data;
				if (template) {
					let bgUrl = '';
					if (template.background_path) {
						try {
							const imgRes = await api.get(
								`/event-dashboard/${eventId}/certificate/background-file?v=${new Date().getTime()}`,
								{ responseType: 'blob' },
							);
							bgUrl = URL.createObjectURL(imgRes.data);
						} catch (err) {
							console.error('Gagal memuat blob background gambar:', err);
							const cleanPath = template.background_path.startsWith('/')
								? template.background_path.slice(1)
								: template.background_path;
							bgUrl = `${STORAGE_URL}/${cleanPath}`;
						}
					}
					setTemplateFile(bgUrl);
					setBackgroundPath(template.background_path);
					setElements(
						template.elements?.length ? template.elements.map(mapDbToElement) : [],
					);
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
	}, [eventId]);

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
				{ headers: { 'Content-Type': 'multipart/form-data' } },
			);

			setTemplateFile(URL.createObjectURL(file));
			setBackgroundPath(response.data.data.background_path);
		} catch (error) {
			console.error('Gagal mengunggah template:', error);
		} finally {
			setIsUploading(false);
		}
	};

	const handleSave = async () => {
		if (!backgroundPath) {
			return notify(
				'error',
				'Validasi Gagal',
				'Silakan unggah gambar template terlebih dahulu.',
			);
		}

		if (!elements.some((el) => el.fieldId === 'f3')) {
			return notify(
				'error',
				'Validasi Gagal',
				'QR Code wajib dimasukkan ke dalam template sertifikat.',
			);
		}

		if (!elements.some((el) => el.fieldId === 'f1')) {
			return notify(
				'error',
				'Validasi Gagal',
				'Nama peserta wajib dimasukkan ke dalam template sertifikat.',
			);
		}

		setIsSaving(true);
		try {
			await api.post(`/event-dashboard/${eventId}/certificate`, {
				event_id: eventId,
				background_path: backgroundPath,
				canvas_width: 1920,
				canvas_height: 1080,
				elements: elements.map(mapElementToDb),
			});

			notify('success', 'Berhasil', 'Template Sertifikat berhasil disimpan!');
			setSaved(true);
			setTimeout(() => setSaved(false), 2000);
		} catch (error) {
			console.error('Gagal menyimpan template sertifikat:', error);
			notify('error', 'Gagal', 'Tidak bisa menyimpan template sertifikat');
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
				<Topbar
					saved={saved}
					onSave={handleSave}
					onPreview={() => setShowPreview(true)}
					templateFile={templateFile}
					onFileTrigger={() => fileInputRef.current?.click()}
					isSaving={isSaving}
				/>

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

			<PreviewModal
				show={showPreview}
				onHide={() => setShowPreview(false)}
				templateFile={templateFile}
				elements={elements}
				previewData={{
					f1: 'Nama Peserta',
					f2: 'ID Sertifikat',
					f3: `${window.location.origin}/verify/ID-SERTIFIKAT`,
					f4: 'Nama Event',
					f5: 'Tanggal Acara',
					f6: 'Instansi/Organisasi',
					f7: 'Teks Kustom',
				}}
			/>
		</EventLayout>
	);
};

export default EventCertificatePage;
