import React, { useState, useEffect, useCallback } from 'react';
import EventLayout from '@/layouts/EventLayout';
import { Form, Collapse, Button } from 'react-bootstrap';
import { Users } from 'lucide-react';
import { useParams } from 'react-router-dom';

import SpeakerForm from './sections/event-speaker/SpeakerForm';
import SpeakerCard from './sections/event-speaker/SpeakerCard';

import SectionPlaceholder from '@/components/form/SectionPlaceholder';

import api from '@/api/axios';
import { notify } from '@/utils/notify';

const EventSpeaker = () => {
	const { eventId } = useParams();
	const [errors, setErrors] = useState({});

	const [showAddForm, setShowAddForm] = useState(false);
	const [editingSpeakerId, setEditingSpeakerId] = useState(null);
	const [speakers, setSpeakers] = useState([]);

	// 1. Ekstrak fungsi fetch ke luar useEffect pakai useCallback
	// agar bisa dipanggil ulang setelah berhasil nge-save
	const fetchEventSpeakers = useCallback(async () => {
		if (!eventId) return;

		try {
			const response = await api.get(`event-dashboard/${eventId}/info-utama/speaker`);
			const result = response.data;

			if ((result.status === 'success' || result.success) && result.data) {
				setSpeakers(result.data);
			}
		} catch (error) {
			console.error('Gagal mengambil data speaker:', error);
			notify('error', 'Terjadi kesalahan saat memuat data pembicara.');
		}
	}, [eventId]);

	useEffect(() => {
		fetchEventSpeakers();
	}, [fetchEventSpeakers]);

	const handleAddClick = () => {
		setEditingSpeakerId(null);
		setShowAddForm(true);
	};

	const handleEditClick = (speakerId) => {
		setShowAddForm(false);
		if (editingSpeakerId === speakerId) {
			setEditingSpeakerId(null);
		} else {
			setEditingSpeakerId(speakerId);
		}
	};

	const handleSaveSpeaker = async (data) => {
		const formData = new FormData();
		const cleanId = typeof data.id === 'string' && data.id.startsWith('temp_') ? '' : data.id;

		formData.append('speakers[0][id]', cleanId || '');
		formData.append('speakers[0][name]', data.name || '');
		formData.append('speakers[0][role]', data.role || '');
		formData.append('speakers[0][bio]', data.bio || '');

		// Social links (array of objects)
		const socialLinks = data.social_link || [];
		socialLinks.forEach((link, linkIndex) => {
			formData.append(
				`speakers[0][social_link][${linkIndex}][platform]`,
				link.platform || '',
			);
			formData.append(`speakers[0][social_link][${linkIndex}][url]`, link.url || '');
		});

		// Expertise
		const expertise = data.expertise || [];
		expertise.forEach((tag, tagIndex) => {
			formData.append(
				`speakers[0][expertise][${tagIndex}]`,
				typeof tag === 'string' ? tag : tag.label || tag.value || '',
			);
		});

		// Sessions (array of IDs)
		const sessions = data.sessions ? data.sessions.map((s) => s.id || s.value || s) : [];
		sessions.forEach((sessionId, sessionIndex) => {
			formData.append(`speakers[0][sessions][${sessionIndex}]`, sessionId);
		});

		// Append image file jika ada (dari SpeakerForm via _imageFile)
		if (data._imageFile) {
			formData.append('speakers_image_0', data._imageFile);
		}

		try {
			await api.post(`event-dashboard/${eventId}/info-utama/speaker`, formData, {
				headers: {
					'Content-Type': 'multipart/form-data',
				},
			});

			notify('success', 'Berhasil!', 'Data pembicara berhasil disimpan.');

			setEditingSpeakerId(null);
			setShowAddForm(false);
			// Panggil ulang fetch untuk mendapatkan ID asli & relasi nama sesi dari DB
			fetchEventSpeakers();
		} catch (error) {
			const serverResponse = error.response?.data;
			const errorMsg = serverResponse?.message || 'Terjadi kesalahan pada server.';

			if (serverResponse?.errors) {
				console.table(serverResponse.errors);
			}

			notify('error', 'Gagal!', errorMsg);
		}
	};

	const handleDeleteSpeaker = async (idToDelete) => {
		// Cek apakah pembicara baru (belum masuk DB)
		if (typeof idToDelete === 'string' && idToDelete.startsWith('temp_')) {
			setSpeakers(speakers.filter((speaker) => speaker.id !== idToDelete));
			if (editingSpeakerId === idToDelete) setEditingSpeakerId(null);
			notify('success', 'Berhasil', 'Pembicara dihapus dari daftar.');
			return;
		}

		const confirmDelete = window.confirm('Apakah Anda yakin ingin menghapus speaker ini?');
		if (!confirmDelete) return;

		try {
			await api.delete(`event-dashboard/${eventId}/info-utama/speaker/${idToDelete}`);

			setSpeakers(speakers.filter((speaker) => speaker.id !== idToDelete));
			if (editingSpeakerId === idToDelete) setEditingSpeakerId(null);
			notify('success', 'Berhasil!', 'Pembicara berhasil dihapus dari database.');
		} catch (error) {
			console.error('Gagal menghapus pembicara:', error);
			notify('error', 'Gagal!', 'Gagal menghapus pembicara dari database.');
		}
	};

	const handleSave = async () => {
		if (speakers.length === 0) {
			notify(
				'error',
				'Wajib Diisi!',
				'Sebuah event setidaknya harus memiliki 1 pembicara (Speaker). Silakan tambah pembicara terlebih dahulu.',
			);
			throw new Error('Speaker wajib diisi');
		}
		notify('success', 'Berhasil!', 'Konfigurasi pembicara telah selesai.');
	};

	return (
		<EventLayout
			heading="Manajemen Pembicara & Narasumber *"
			subheading="Kelola profil pengisi acara dan hubungkan mereka dengan sesi yang relevan."
			nextPath={'formulir'}
			onSave={handleSave}
			prevPath={'sesi'}
			isFormDirty={showAddForm || editingSpeakerId !== null}
			formDirtyMessage="Terdapat form speaker yang belum disimpan atau dibatalkan. Harap selesaikan terlebih dahulu."
			isCurrentStepCompleted={speakers.length > 0}
		>
			<Form className="form">
				{speakers.length > 0 ? (
					speakers.map((speaker) => (
						<div key={speaker.id}>
							<SpeakerCard
								data={speaker}
								onEdit={() => handleEditClick(speaker.id)}
								onDelete={() => handleDeleteSpeaker(speaker.id)}
							/>

							<Collapse in={editingSpeakerId === speaker.id}>
								<div>
									{editingSpeakerId === speaker.id && (
										<div className="mb-4 ms-4 border-start border-primary border-3 ps-3">
											<SpeakerForm
												initialData={speaker}
												onSave={handleSaveSpeaker}
												onCancel={() => setEditingSpeakerId(null)}
												eventId={eventId}
											/>
										</div>
									)}
								</div>
							</Collapse>
						</div>
					))
				) : (
					<SectionPlaceholder
						title="Belum ada pembicara"
						subtitle="Klik tombol di bawah untuk menambahkan pembicara baru ke event ini."
					/>
				)}

				{showAddForm ? (
					<Collapse in={showAddForm}>
						<div>
							<SpeakerForm
								initialData={null}
								onSave={handleSaveSpeaker}
								onCancel={() => setShowAddForm(false)}
								eventId={eventId}
							/>
						</div>
					</Collapse>
				) : (
					<Button
						variant="outline-primary"
						className="w-100 py-3 border-dashed"
						onClick={handleAddClick}
					>
						+ Tambah Speaker
					</Button>
				)}
			</Form>
		</EventLayout>
	);
};

export default EventSpeaker;
