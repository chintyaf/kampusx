import React, { useState, useEffect } from 'react';
import { Form, Alert, Badge, Button, InputGroup } from 'react-bootstrap';
import { Globe, Link2, AlertTriangle, CheckCircle2, XCircle, ChevronRight } from 'lucide-react';
import { useParams } from 'react-router-dom';
import api from '../../../api/axios';
import { notify } from '../../../utils/notify';

// ─── PublishForm ───────────────────────────────────────────────────────────────

const PublishForm = ({ onCancel, onConfirm, show }) => {
	const [slug, setSlug] = useState('');
	const [slugTouched, setTouched] = useState(false);
	const [apiErrors, setApiErrors] = useState([]);
	const [isLoading, setIsLoading] = useState(false);
	const { eventId } = useParams();

	const convertToSlug = (text) => {
		return text
			.toLowerCase()
			.trim()
			.replace(/[^\w\s-]/g, '') // Hapus karakter non-word (kecuali spasi dan dash)
			.replace(/[\s_-]+/g, '-') // Ganti spasi, underscore, dan dash berulang menjadi satu dash
			.replace(/^-+|-+$/g, ''); // Hapus dash di awal dan akhir
	};

	// Fungsi Helper di dalam komponen (atau pindahkan ke file utils)
	const handleSlugChange = (value) => {
		setSlug(convertToSlug(value));
	};

	// 1. Fetch data dari API saat modal dibuka (show === true)
	useEffect(() => {
		if (!show || !eventId) return;

		setIsLoading(true);
		// Reset state internal saat modal baru dibuka
		setTouched(false);
		setApiErrors([]);

		const fetchMissingData = async () => {
			if (!show || !eventId) return;

			setIsLoading(true);
			try {
				const response = await api.get(`/events/${eventId}/check-status`);
				const result = response.data;

				if (result.status === 'success') {
					setApiErrors(result.data.missing_data || []);

					// PRIORITAS: Isi slug hanya jika slug saat ini masih kosong
					if (result.data.event_title && slug === '') {
						const generatedSlug = convertToSlug(result.data.event_title);
						setSlug(generatedSlug);
						console.log('Generated slug from event title:', generatedSlug);
					}
				}
			} catch (error) {
				console.error('Error fetching publish status:', error);
				notify('Gagal mengecek status publikasi', 'error');
			} finally {
				setIsLoading(false);
			}
		};

		fetchMissingData();

		// CLEANUP: Kosongkan slug saat modal DITUTUP (show === false)
		if (!show) {
			setSlug('');
		}
	}, [show, eventId]);

	const hasSlugError = slug.trim() === '';
	const showSlugErr = slugTouched && hasSlugError;

	// 3. Gabungkan Error: Props Luar + API Missing Data + Local Slug Error
	const allErrors = [...apiErrors, ...(showSlugErr ? ['Slug / URL event belum diisi'] : [])];

	// Tombol disable jika masih ada error atau sedang loading
	const isDisabled = allErrors.length > 0 || hasSlugError || isLoading;

	const handleSubmit = async () => {
		setTouched(true);
		if (isDisabled) return;

		try {
			const response = await api.post(`/events/${eventId}/publish`, { slug });
			const result = response.data;

			if (result.status === 'success') {
				notify('success', 'Berhasil', result.message);
				onConfirm();
			}
		} catch (error) {
			console.error('Error saat publish event:', error);
			notify('error', 'Terdapata salah', 'Gagal mempublish event. Coba lagi nanti.');
		}
	};

	return (
		<>
			{/* ① Warning banner */}
			<Alert
				className="d-flex gap-2 align-items-start mb-3"
				style={{
					backgroundColor: 'var(--warning-bg)',
					borderColor: 'var(--warning-border)',
					borderRadius: 10,
					padding: '12px 14px',
				}}>
				<AlertTriangle size={16} color="#d97706" className="flex-shrink-0 mt-1" />
				<div>
					<div
						className="fw-bold mb-1"
						style={{ fontSize: 13, color: 'var(--warning-heading)' }}>
						Pengecekan Terakhir: URL Event Akan Dikunci.
					</div>
					<p className="m-0" style={{ fontSize: 12, color: 'var(--warning-text)' }}>
						{isLoading
							? 'Sedang memvalidasi kelengkapan data...'
							: 'Setelah publish, slug/URL tidak dapat diubah untuk menjaga validitas link yang disebar.'}
					</p>
				</div>
			</Alert>

			{/* ② Error box — Menampilkan gabungan data dari API dan local */}
			{allErrors.length > 0 && !isLoading && (
				<div
					className="mb-3 p-3"
					style={{
						backgroundColor: 'var(--error-bg)',
						border: '1.5px solid var(--error-border)',
						borderRadius: 10,
					}}>
					<div className="d-flex align-items-center justify-content-between mb-2">
						<div
							className="d-flex align-items-center gap-1 fw-bold"
							style={{ fontSize: 13, color: 'var(--error-heading)' }}>
							<XCircle size={15} />
							Tidak bisa publish
						</div>
						<Badge bg="danger" pill style={{ fontSize: 10 }}>
							{allErrors.length} masalah
						</Badge>
					</div>
					<ul className="list-unstyled m-0 d-flex flex-column gap-1">
						{allErrors.map((msg, i) => (
							<li
								key={i}
								className="d-flex align-items-center gap-2 px-2 py-1"
								style={{
									fontSize: 12,
									color: 'var(--error-text)',
									backgroundColor: 'var(--error-text-bg)',
									borderRadius: 6,
								}}>
								<ChevronRight size={12} className="flex-shrink-0" />
								{msg}
							</li>
						))}
					</ul>
				</div>
			)}
			{/* ③ Slug field */}
			<Form.Group>
				<Form.Label
					className="fw-semibold d-flex align-items-center gap-2 mb-2"
					style={{ fontSize: 11, color: 'var(--color-secondary)' }}>
					<Link2 size={13} color="var(--bahama-blue-700)" />
					Event Slug / URL
				</Form.Label>

				<InputGroup
					style={{
						borderRadius: 10,
						overflow: 'hidden',
						border: `1.5px solid ${showSlugErr ? '#ef4444' : 'var(--color-border)'}`,
					}}>
					<InputGroup.Text
						className="border-0 border-end rounded-0 fw-medium"
						style={{
							backgroundColor: 'var(--bahama-blue-50)',
							color: 'var(--bahama-blue-700)',
							fontSize: 11,
						}}>
						<Globe size={11} className="me-1" /> kampusx.com/event/
					</InputGroup.Text>
					<Form.Control
						type="text"
						name="slug"
						placeholder="nama-event-kamu"
						value={slug}
						className="border-0 shadow-none font-monospace"
						style={{
							fontSize: 13,
							letterSpacing: '-0.2px',
							backgroundColor: '#fff',
							color: '#0f172a',
						}}
						onChange={(e) => handleSlugChange(e.target.value)}
						disabled={isLoading}
						isInvalid={showSlugErr}
						required
					/>
				</InputGroup>

				{showSlugErr ? (
					<div
						className="mt-2 d-flex align-items-center gap-1"
						style={{ fontSize: 11, color: '#ef4444' }}>
						<XCircle size={12} /> Slug wajib diisi sebelum publish
					</div>
				) : (
					<div
						className="mt-2 d-flex align-items-center gap-1"
						style={{ fontSize: 11, color: '#64748b' }}>
						<CheckCircle2 size={12} color="#0089cb" /> Slug ini akan menjadi URL
						permanen untuk event Anda.
					</div>
				)}
			</Form.Group>

			{/* ④ Footer buttons */}
			<div
				className="d-flex justify-content-end gap-2 mt-4 pt-3 border-top"
				style={{
					marginLeft: -24,
					marginRight: -24,
					paddingLeft: 24,
					paddingRight: 24,
					borderColor: 'rgba(88,101,122,0.18)',
				}}>
				<Button
					variant="light"
					onClick={onCancel}
					className="fw-medium border"
					style={{
						fontSize: 13,
						borderRadius: 9,
						color: '#64748b',
						borderColor: '#c7cdd8',
					}}>
					Batal
				</Button>
				<Button
					onClick={handleSubmit}
					disabled={isDisabled || isLoading}
					className="fw-semibold border-0 d-flex align-items-center gap-2"
					style={{
						fontSize: 13,
						borderRadius: 9,
						background:
							isDisabled || isLoading
								? 'linear-gradient(135deg, #94a3b8 0%, #64748b 100%)'
								: 'linear-gradient(135deg, #0089cb 0%, #00699e 100%)',
						boxShadow:
							isDisabled || isLoading ? 'none' : '0 2px 8px rgba(0,105,158,0.30)',
						opacity: isDisabled || isLoading ? 0.75 : 1,
					}}>
					{isLoading ? (
						<>
							<span
								className="spinner-border spinner-border-sm"
								role="status"
								aria-hidden="true"></span>
							Memproses...
						</>
					) : isDisabled ? (
						<>
							<XCircle size={14} /> Lengkapi Data Dulu
						</>
					) : (
						<>
							<Globe size={14} /> Ya, Publish Sekarang
						</>
					)}
				</Button>
			</div>
		</>
	);
};

export default PublishForm;
