import { useState, useEffect } from 'react';
import api from '@/api/axios';
import { notify } from '@/utils/notify';

export const useEventSession = (eventId) => {
	// ==========================================
	// 1. STATE MANAGEMENT
	// ==========================================
	const [days, setDays] = useState([]); // Menyimpan daftar hari beserta sesi di dalamnya
	const [activeSessions, setActiveSessions] = useState([]);
	const [selectedRow, setSelectedRow] = useState(null); // Menyimpan sesi yang sedang dipilih/diedit
	const [formData, setFormData] = useState({
		timezone: '',
		startDate: '',
		endDate: '',
	});
	const [isLoading, setIsLoading] = useState(true);

	const [allSpeakers, setAllSpeakers] = useState([]); // Daftar semua pembicara yang tersedia
	const [selectedSpeakerToEdit, setSelectedSpeakerToEdit] = useState(null); // Pembicara spesifik yang sedang diedit

	// ==========================================
	// 2. DATA FETCHING (INITIALIZATION)
	// ==========================================
	useEffect(() => {
		const fetchEventData = async () => {
			if (!eventId) return;

			setIsLoading(true);
			try {
				// Mengambil data sesi dan speaker secara paralel (bersamaan) untuk efisiensi waktu
				const [sessionRes, speakerRes] = await Promise.all([
					api.get(`event-dashboard/${eventId}/info-utama/session`),
					api.get(`event-dashboard/${eventId}/info-utama/speaker`).catch((err) => {
						console.error('Gagal mengambil data speaker:', err);
						// Fallback jika gagal ambil speaker agar fetch event tidak ikut crash entirely
						return { data: { data: [] } };
					}),
				]);

				const sessionResult = sessionRes.data;
				const speakerResult = speakerRes.data;

				// Memproses data pembicara
				let dbSpeakers = [];
				if (
					(speakerResult.status === 'success' || speakerResult.success) &&
					speakerResult.data
				) {
					dbSpeakers = speakerResult.data;
				}

				// Memproses data sesi
				if (sessionResult.status === 'success' && sessionResult.data) {
					const groupedDaysArray = Object.values(sessionResult.data);

					// Membuat Map pembicara agar pencarian/referensi pembicara lebih cepat
					const extractedSpeakersMap = new Map();
					dbSpeakers.forEach((spk) => {
						extractedSpeakersMap.set(spk.id, spk);
					});

					// Utility lokal untuk standarisasi zona waktu Indonesia
					const mapToIndonesianTimezone = (tz) => {
						const mapping = {
							'Asia/Jakarta': 'WIB',
							'Asia/Makassar': 'WITA',
							'Asia/Jayapura': 'WIT',
						};
						return mapping[tz] || tz;
					};
					const dbTimezone = mapToIndonesianTimezone(sessionResult.timezone) || '-';

					// Jika ada data hari yang dikembalikan dari API
					if (groupedDaysArray.length > 0) {
						setFormData((prev) => ({
							...prev,
							startDate: groupedDaysArray[0].date,
							endDate: groupedDaysArray[groupedDaysArray.length - 1].date,
							timezone: dbTimezone,
						}));

						// Memformat ulang struktur nested data (Hari -> Sesi -> Pembicara)
						const formattedDays = groupedDaysArray.map((day) => ({
							...day,
							sessions: day.sessions.map((session) => {
								if (session.speakers) {
									session.speakers.forEach((spk) =>
										extractedSpeakersMap.set(spk.id, spk),
									);
								}
								// Normalisasi penamaan key (snake_case ke camelCase)
								return {
									...session,
									no_speaker:
										session.no_speaker === true ||
										session.no_speaker === 1 ||
										session.no_speaker === '1',
									startTime: session.start_time || session.startTime,
									endTime: session.end_time || session.endTime,
								};
							}),
						}));

						setDays(formattedDays);
						setActiveSessions(formattedDays[0].sessions || []);
					} else {
						// Jika tidak ada data hari, set ke state kosong tapi buatkan 1 hari default
						setFormData((prev) => ({
							...prev,
							timezone: dbTimezone,
						}));
						setDays([{ date: '', sessions: [], day_number: 1 }]);
						setActiveSessions([]);
					}

					// Simpan seluruh pembicara unik yang sudah diekstrak
					setAllSpeakers(Array.from(extractedSpeakersMap.values()));
				}
			} catch (error) {
				console.error('Gagal mengambil data event:', error);
			} finally {
				setIsLoading(false);
			}
		};

		fetchEventData();
	}, [eventId]);

	// ==========================================
	// 3. HANDLERS (SESI & HARI)
	// ==========================================

	// Menyimpan keseluruhan layout acara (flattening dari nested array menjadi satu array panjang)
	const handleSave = async (shouldNotify = false, customDays = null) => {
		const daysToSave = customDays || days;
		const flatSessions = [];

		// Membongkar array `days` menjadi deretan sesi tunggal untuk dikirim ke API
		daysToSave.forEach((day, index) => {
			const dayNumber = day.day_number || index + 1;
			if (day.sessions) {
				day.sessions.forEach((s) => {
					// Abaikan sesi baru yang belum diisi (belum ada judul)
					if (typeof s.id === 'string' && s.id.startsWith('new-') && !s.title) {
						return;
					}
					flatSessions.push({
						id: s.id,
						title: s.title,
						description: s.description,
						day: dayNumber,
						startTime: s.startTime || s.start_time,
						endTime: s.endTime || s.end_time,
						prerequisite_session_ids: s.prerequisite_session_ids || [],
						no_speaker: s.no_speaker || false,
					});
				});
			}
		});

		// Menghitung tanggal mulai dan selesai secara otomatis dari input valid
		const validDates = daysToSave
			.map((d) => d.date)
			.filter((d) => d && d.trim() !== '')
			.sort();

		const calculatedStartDate = validDates[0] || '';
		const calculatedEndDate = validDates[validDates.length - 1] || calculatedStartDate;

		const sessionPayload = {
			...formData,
			startDate: calculatedStartDate,
			endDate: calculatedEndDate,
			sessions: flatSessions,
		};

		try {
			// 1. Simpan sesi & tata letak jadwal
			const response = await api.post(
				`event-dashboard/${eventId}/info-utama/session`,
				sessionPayload,
			);

			// 2. Ambil sesi dari backend untuk mencocokkan ID database aslinya
			const sessionRes = await api.get(`event-dashboard/${eventId}/info-utama/session`);
			let updatedDays = daysToSave;
			if (sessionRes.data?.status === 'success' && sessionRes.data?.data) {
				const backendDays = sessionRes.data.data;
				updatedDays = daysToSave.map((day, dayIdx) => {
					const backendDay = backendDays[dayIdx];
					if (!backendDay) return day;

					return {
						...day,
						sessions: day.sessions.map((session, sessionIdx) => {
							const backendSession = backendDay.sessions?.[sessionIdx];
							if (!backendSession) return session;

							return {
								...session,
								id: backendSession.id, // Update ke ID database asli
							};
						}),
					};
				});
				setDays(updatedDays);
			}

			// 3. Susun batch payload untuk sinkronisasi relasi pembicara & sesi
			const speakersPayload = allSpeakers.map((speaker) => {
				const assignedSessionIds = [];
				updatedDays.forEach((day) => {
					if (day.sessions) {
						day.sessions.forEach((session) => {
							if (session.speakers && session.speakers.some((s) => s.id === speaker.id)) {
								assignedSessionIds.push(session.id);
							}
						});
					}
				});

				return {
					id: speaker.id,
					name: speaker.name,
					role: speaker.role,
					bio: speaker.bio,
					sessions: assignedSessionIds,
					social_link: speaker.social_link || [],
					expertise: speaker.expertise || [],
				};
			});

			// 4. POST ke API /speaker untuk menyimpan relasi pivot secara permanen
			await api.post(`event-dashboard/${eventId}/info-utama/speaker`, {
				speakers: speakersPayload,
			});

			if (response.data?.notified_participants || shouldNotify) {
				notify(
					'success',
					'Berhasil!',
					'Sesi dan relasi pembicara telah disimpan. Peserta terdaftar telah dikirimi notifikasi perubahan.',
				);
			} else {
				notify('success', 'Berhasil!', 'Sesi dan relasi pembicara telah disimpan.');
			}
		} catch (error) {
			console.error('Gagal menyimpan sesi dan pembicara:', error);
			const errorMsg = error.response?.data?.message || 'Terjadi kesalahan pada server.';
			if (error.response?.data?.errors) console.table(error.response.data.errors);
			notify('error', 'Gagal!', errorMsg);
		}
	};

	// Menambah hari baru di array terakhir
	const handleAddDay = () => {
		setDays((prevDays) => [
			...prevDays,
			{ date: '', sessions: [], day_number: prevDays.length + 1 },
		]);
	};

	// Memperbarui/menyimpan sesi lokal. Juga menangani perpindahan sesi jika `dayNumber` diubah
	const handleSaveSession = (updatedSession) => {
		let nextDays = [];
		setDays((prevDays) => {
			// Deep copy array hari dan sesi agar tidak memutasi state secara langsung
			const newDays = [...prevDays.map((d) => ({ ...d, sessions: [...d.sessions] }))];

			let oldDayIndex = -1;
			let oldSessionIndex = -1;

			// Mencari di mana sesi ini sebelumnya berada
			for (let i = 0; i < newDays.length; i++) {
				const sIndex = newDays[i].sessions.findIndex((s) => s.id === updatedSession.id);
				if (sIndex !== -1) {
					oldDayIndex = i;
					oldSessionIndex = sIndex;
					break;
				}
			}

			if (oldDayIndex !== -1) {
				const oldDayNumber = newDays[oldDayIndex].day_number || oldDayIndex + 1;
				const newDayNumber = parseInt(updatedSession.dayNumber);

				// Jika pengguna memindahkan sesi ini ke hari yang berbeda
				if (oldDayNumber !== newDayNumber) {
					newDays[oldDayIndex].sessions.splice(oldSessionIndex, 1); // Hapus dari hari lama

					// Cari index hari yang baru
					const newDayIndex = newDays.findIndex(
						(d) => (d.day_number || newDays.indexOf(d) + 1) === newDayNumber,
					);

					if (newDayIndex !== -1) {
						newDays[newDayIndex].sessions.push(updatedSession); // Masukkan ke hari baru
						newDays[newDayIndex].sessions.sort((a, b) =>
							(a.startTime || '').localeCompare(b.startTime || ''),
						);
					} else {
						// Jika hari baru tidak ditemukan, kembalikan ke hari lama sebagai fallback
						newDays[oldDayIndex].sessions.push(updatedSession);
						newDays[oldDayIndex].sessions.sort((a, b) =>
							(a.startTime || '').localeCompare(b.startTime || ''),
						);
					}
				} else {
					// Jika harinya tetap sama, cukup perbarui datanya dan urutkan ulang berdasarkan waktu
					newDays[oldDayIndex].sessions[oldSessionIndex] = updatedSession;
					newDays[oldDayIndex].sessions.sort((a, b) =>
						(a.startTime || '').localeCompare(b.startTime || ''),
					);
				}
			}
			nextDays = newDays;
			return newDays;
		});
		setSelectedRow(updatedSession);
		notify('success', 'Berhasil!', 'Sesi berhasil diperbarui.');
		handleSave(false, nextDays);
	};

	// Menambahkan objek pembicara ke dalam sesi yang sedang dipilih
	const handleAddSpeakerToSession = (speaker) => {
		if (!selectedRow) return;
		const updatedSession = {
			...selectedRow,
			speakers: [...(selectedRow.speakers || []), speaker],
		};
		handleSaveSession(updatedSession); // Gunakan handler yang sudah ada untuk update state
	};

	const handleDeleteSession = (sessionId, setSidebar) => {
		if (!sessionId) return;
		setDays((prevDays) => {
			const newDays = prevDays.map((day) => ({
				...day,
				sessions: day.sessions.filter((session) => session.id !== sessionId),
			}));
			return newDays;
		});
		setSelectedRow(null);
		if (setSidebar) setSidebar('summary');
	};

	const handleToggleHideSession = (sessionId) => {
		if (!sessionId) return;
		setDays((prevDays) => {
			const newDays = prevDays.map((day) => ({
				...day,
				sessions: day.sessions.map((session) =>
					session.id === sessionId
						? { ...session, isHidden: !session.isHidden }
						: session,
				),
			}));
			return newDays;
		});
		// Update selectedRow jika kebetulan sesi yang disembunyikan sedang dibuka
		setSelectedRow((prev) =>
			prev && prev.id === sessionId ? { ...prev, isHidden: !prev.isHidden } : prev,
		);
		notify('success', 'Berhasil!', 'Status visibilitas sesi diubah.');
	};

	const handleAddSession = (dayIndex, setSidebar) => {
		if (!days[dayIndex]?.date) {
			notify('error', 'Gagal', 'Tanggal pelaksanaan hari harus diisi terlebih dahulu sebelum menambahkan sesi.');
			return;
		}

		// Template skeleton untuk sesi baru
		const newSession = {
			id: `new-${Date.now()}`,
			title: '',
			description: '',
			startTime: '',
			endTime: '',
			speakers: [],
			dayNumber: days[dayIndex].day_number || dayIndex + 1,
			prerequisite_session_ids: [],
		};

		setDays((prevDays) => {
			const newDays = [...prevDays];
			newDays[dayIndex] = {
				...newDays[dayIndex],
				sessions: [...newDays[dayIndex].sessions, newSession],
			};
			return newDays;
		});

		setSelectedRow(newSession);
		if (setSidebar) setSidebar('session-form');
	};

	const handleDeleteDay = (indexToRemove) => {
		setDays((prevDays) => {
			const newDays = prevDays.filter((_, index) => index !== indexToRemove);
			return newDays;
		});
		notify('success', 'Berhasil', 'Hari berhasil dihapus dari daftar.');
	};

	const handleEditDayDate = (indexToEdit, newDate) => {
		setDays((prevDays) => {
			const newDays = [...prevDays];
			newDays[indexToEdit] = { ...newDays[indexToEdit], date: newDate };
			return newDays;
		});
	};

	// ==========================================
	// 4. HANDLERS (PEMBICARA / SPEAKER)
	// ==========================================

	// Menyimpan form pembicara menggunakan FormData (karena mendukung unggahan gambar)
	const handleSaveSpeaker = async (speakerData, setSidebar) => {
		const formData = new FormData();

		// Membersihkan ID sementara (jika pembicara baru dibuat di frontend belum masuk DB)
		const cleanId =
			typeof speakerData.id === 'string' &&
				(speakerData.id.startsWith('spk-') || speakerData.id.startsWith('temp_'))
				? ''
				: speakerData.id;

		if (cleanId) {
			formData.append('speakers[0][id]', cleanId);
		}
		formData.append('speakers[0][name]', speakerData.name || '');
		formData.append('speakers[0][role]', speakerData.role || '');
		formData.append('speakers[0][bio]', speakerData.bio || '');

		// Mapping array social links menjadi key value formData
		const socialLinks = speakerData.social_link || [];
		socialLinks.forEach((link, linkIndex) => {
			if (link.platform && link.url) {
				formData.append(
					`speakers[0][social_link][${linkIndex}][platform]`,
					link.platform || '',
				);
				formData.append(`speakers[0][social_link][${linkIndex}][url]`, link.url || '');
			}
		});

		// Mapping array expertise/keahlian
		const expertise = speakerData.expertise || [];
		expertise.forEach((tag, tagIndex) => {
			formData.append(
				`speakers[0][expertise][${tagIndex}]`,
				typeof tag === 'string' ? tag : tag.label || tag.value || '',
			);
		});

		// Melampirkan sesi mana saja yang diisi oleh pembicara ini
		if (speakerData.sessions) {
			const sessions = speakerData.sessions.map((s) => s.id || s.value || s);
			sessions.forEach((sessionId, sessionIndex) => {
				formData.append(`speakers[0][sessions][${sessionIndex}]`, sessionId);
			});
		}

		// Append file gambar jika user mengunggah foto baru
		if (speakerData._imageFile) {
			formData.append('speakers_image_0', speakerData._imageFile);
		}

		try {
			const response = await api.post(`event-dashboard/${eventId}/info-utama/speaker`, formData, {
				headers: { 'Content-Type': 'multipart/form-data' },
			});

			notify('success', 'Berhasil', 'Pembicara berhasil disimpan ke database.');

			// Tarik ulang list pembicara dari DB agar state tersinkronisasi dengan ID aslinya
			const speakerRes = await api.get(`event-dashboard/${eventId}/info-utama/speaker`);
			let updatedSpeakers = [];
			if (speakerRes.data?.success && speakerRes.data?.data) {
				setAllSpeakers(speakerRes.data.data);
				updatedSpeakers = speakerRes.data.data;
			}

			if (setSidebar) setSidebar('speaker-list');

			// Dapatkan data speaker yang baru disimpan
			const savedSpeaker = response.data?.data?.[0] || updatedSpeakers.find(s => s.name === speakerData.name) || speakerData;

			// Perbarui info pembicara ini secara lokal di semua sesi pada state `days`
			if (savedSpeaker && savedSpeaker.id) {
				setDays((prevDays) => {
					return prevDays.map((day) => ({
						...day,
						sessions: day.sessions.map((session) => {
							if (session.speakers) {
								return {
									...session,
									speakers: session.speakers.map((s) =>
										s.id === savedSpeaker.id ? savedSpeaker : s
									),
								};
							}
							return session;
						}),
					}));
				});
			}

			return savedSpeaker;
		} catch (error) {
			console.error('Gagal menyimpan pembicara:', error);
			const serverResponse = error.response?.data;
			const errorMsg = serverResponse?.message || 'Gagal menyimpan pembicara ke database.';
			notify('error', 'Gagal', errorMsg);
			return null;
		}
	};

	const handleDeleteSpeaker = async (speakerId) => {
		// Validasi: Cek apakah speaker ini masih dijadwalkan pada suatu sesi
		const isAssigned = days.some((day) =>
			day.sessions.some(
				(session) => session.speakers && session.speakers.some((s) => s.id === speakerId),
			),
		);

		if (isAssigned) {
			notify('error', 'Gagal', 'Pembicara tidak dapat dihapus karena sedang mengisi sesi.');
			return;
		}

		// Jika ID hanya sementara (belum masuk database), cukup hapus di UI
		if (
			typeof speakerId === 'string' &&
			(speakerId.startsWith('spk-') || speakerId.startsWith('temp_'))
		) {
			setAllSpeakers((prev) => prev.filter((s) => s.id !== speakerId));
			notify('success', 'Berhasil', 'Pembicara dihapus.');
			return;
		}

		try {
			await api.delete(`event-dashboard/${eventId}/info-utama/speaker/${speakerId}`);
			setAllSpeakers((prev) => prev.filter((s) => s.id !== speakerId));
			notify('success', 'Berhasil', 'Pembicara berhasil dihapus dari database.');
		} catch (error) {
			console.error('Gagal menghapus pembicara:', error);
			notify('error', 'Gagal', 'Gagal menghapus pembicara dari database.');
		}
	};

	const handleEditSpeaker = (speaker, setSidebar) => {
		setSelectedSpeakerToEdit(speaker);
		if (setSidebar) setSidebar('speaker-add');
	};

	// ==========================================
	// 5. VALIDATIONS & COMPUTED VALUES
	// ==========================================

	// Menghitung total sesi di semua hari
	const totalSessions = days.reduce((acc, d) => acc + (d.sessions?.length || 0), 0);

	// Validasi boolean ketat apakah form bisa disubmit atau belum
	const allSessionsComplete = days.every(
		(day) =>
			day.date &&
			day.date.trim() !== '' &&
			day.sessions &&
			day.sessions.length > 0 &&
			day.sessions.every(
				(s) =>
					s.title?.trim() !== '' &&
					(s.startTime || s.start_time) &&
					(s.endTime || s.end_time) &&
					((s.speakers && s.speakers.length > 0) || s.no_speaker),
			),
	);
	const isCurrentStepCompleted = totalSessions > 0 && allSessionsComplete;

	// Menghasilkan daftar pesan error jika pengguna mencoba submit saat data belum valid
	const getStep3ValidationErrors = () => {
		const errorsList = [];
		if (days.length === 0) {
			errorsList.push('Silakan tambahkan minimal satu hari pelaksanaan.');
			return errorsList;
		}

		if (totalSessions === 0) {
			errorsList.push(
				'Silakan tambahkan minimal satu sesi acara dengan informasi yang lengkap.',
			);
		}

		days.forEach((day, dIdx) => {
			const dayLabel = `Hari ke-${dIdx + 1}${day.date ? ` (${day.date})` : ''}`;

			if (!day.date || day.date.trim() === '') {
				errorsList.push(`Tanggal pelaksanaan untuk ${dayLabel} belum ditentukan.`);
			}

			if (!day.sessions || day.sessions.length === 0) {
				errorsList.push(`Silakan tambahkan minimal satu sesi di ${dayLabel}.`);
			} else {
				day.sessions.forEach((s, sIdx) => {
					const sessionLabel = `Sesi ke-${sIdx + 1}${s.title ? ` "${s.title}"` : ''} di ${dayLabel}`;

					if (!s.title || s.title.trim() === '') {
						errorsList.push(`Nama/judul untuk ${sessionLabel} wajib diisi.`);
					}
					if (!s.startTime && !s.start_time) {
						errorsList.push(`Waktu mulai untuk ${sessionLabel} belum ditentukan.`);
					}
					if (!s.endTime && !s.end_time) {
						errorsList.push(`Waktu selesai untuk ${sessionLabel} belum ditentukan.`);
					}
					const hasSpeakers = s.speakers && s.speakers.length > 0;
					if (!hasSpeakers && !s.no_speaker) {
						errorsList.push(
							`${sessionLabel} belum memiliki pembicara (atau centang opsi Tanpa Pembicara jika sesi ini tidak membutuhkannya).`,
						);
					}
				});
			}
		});

		return errorsList;
	};

	return {
		days,
		setDays,
		selectedRow,
		setSelectedRow,
		formData,
		isLoading,
		allSpeakers,
		selectedSpeakerToEdit,
		setSelectedSpeakerToEdit,
		handleSave,
		handleAddDay,
		handleSaveSession,
		handleAddSpeakerToSession,
		handleDeleteSession,
		handleToggleHideSession,
		handleSaveSpeaker,
		handleDeleteSpeaker,
		handleEditSpeaker,
		handleAddSession,
		handleDeleteDay,
		handleEditDayDate,
		isCurrentStepCompleted,
		getStep3ValidationErrors,
	};
};
