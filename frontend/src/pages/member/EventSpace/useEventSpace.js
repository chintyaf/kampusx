import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../../api/axios';
import { STORAGE_URL } from '../../../api/storage';

export const useEventSpace = () => {
	const { id } = useParams();
	const [activeTab, setActiveTab] = useState('overview');
	const [showTicketModal, setShowTicketModal] = useState(false);
	const [isLoading, setIsLoading] = useState(true);
	const [apiError, setApiError] = useState(null);
	const [isAccessDenied, setIsAccessDenied] = useState(false);

	// Dynamic states from backend
	const [event, setEvent] = useState(null);
	const [alreadySubmitted, setAlreadySubmitted] = useState(false);
	const [ticketCode, setTicketCode] = useState('TKT-ACTIVE-001');
	const [participantName, setParticipantName] = useState('');

	const [announcements, setAnnouncements] = useState([]);

	// Poin & Reward States
	const [memberPoints, setMemberPoints] = useState(120);
	const [localRewardsCatalog, setLocalRewardsCatalog] = useState([
		{
			id: 1,
			title: 'Kaos Eksklusif KampusX',
			description:
				'Bahan cotton combed 30s premium, sablon discharge rapi, tersedia ukuran S-XXL.',
			points_cost: 100,
			stock: 50,
			limit_per_user: 1,
			reward_type: 'physical',
			image_path: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=300',
			is_active: true,
		},
		{
			id: 2,
			title: 'E-Voucher Gopay Rp50.000',
			description:
				'Saldo Gopay senilai Rp50.000. Kode voucher dikirim otomatis via log penukaran.',
			points_cost: 80,
			stock: 20,
			limit_per_user: 2,
			reward_type: 'digital',
			image_path: 'https://images.unsplash.com/photo-1580828343064-fde4fc206bc6?w=300',
			is_active: true,
		},
		{
			id: 3,
			title: 'Stiker Pack Hologram',
			description: 'Satu pack berisi 5 stiker hologram desain maskot dan ikon KampusX.',
			points_cost: 15,
			stock: 200,
			limit_per_user: 5,
			reward_type: 'physical',
			image_path: 'https://images.unsplash.com/photo-1572375995301-3b9894856aef?w=300',
			is_active: true,
		},
	]);
	const [myRedemptions, setMyRedemptions] = useState([
		{
			id: 1,
			reward_title: 'Stiker Pack Hologram',
			points_spent: 15,
			reward_type: 'physical',
			redeemed_at: new Date(Date.now() - 86400000).toISOString(),
			status: 'claimed',
			notes: 'Diambil langsung di Booth Utama.',
		},
	]);
	const [showRedeemWarningModal, setShowRedeemWarningModal] = useState(false);
	const [pendingRedeemReward, setPendingRedeemReward] = useState(null);

	const handleRedeemReward = (reward) => {
		if (memberPoints < reward.points_cost) {
			toast.error('Saldo poin lokal Anda tidak mencukupi!');
			return;
		}

		if (reward.stock !== null && reward.stock <= 0) {
			toast.error('Stok reward ini telah habis!');
			return;
		}

		const claimCount = myRedemptions.filter(
			(r) => r.reward_title === reward.title && r.status !== 'cancelled',
		).length;
		if (reward.limit_per_user !== null && claimCount >= reward.limit_per_user) {
			toast.error(
				`Anda telah mencapai batas maksimum penukaran (${reward.limit_per_user}x) untuk reward ini.`,
			);
			return;
		}

		// Jika event diselenggarakan online (is_online) dan reward fisik
		if (event?.is_online && reward.reward_type === 'physical') {
			setPendingRedeemReward(reward);
			setShowRedeemWarningModal(true);
		} else {
			executeRedemption(reward);
		}
	};

	const executeRedemption = (reward) => {
		setMemberPoints((prev) => prev - reward.points_cost);
		setLocalRewardsCatalog((prev) =>
			prev.map((r) =>
				r.id === reward.id ? { ...r, stock: r.stock !== null ? r.stock - 1 : null } : r,
			),
		);

		const newRedemption = {
			id: Date.now(),
			reward_title: reward.title,
			points_spent: reward.points_cost,
			reward_type: reward.reward_type,
			redeemed_at: new Date().toISOString(),
			status: 'pending',
			notes:
				reward.reward_type === 'physical'
					? 'Menunggu pengambilan di lokasi event.'
					: 'Kode e-voucher akan segera dikirim oleh panitia.',
		};

		setMyRedemptions([newRedemption, ...myRedemptions]);
		toast.success(`Berhasil menukar ${reward.title}!`);
		setShowRedeemWarningModal(false);
	};

	const getFullAttachmentUrl = (url, path) => {
		if (url) {
			if (url.startsWith('http')) return url;
			if (url.startsWith('/storage')) {
				return url.replace('/storage', STORAGE_URL);
			}
			return `${STORAGE_URL}/${url}`;
		}
		if (path) {
			if (path.startsWith('http')) return path;
			return `${STORAGE_URL}/${path}`;
		}
		return '#';
	};

	const formatTimeAgo = (dateString) => {
		if (!dateString) return '';
		try {
			const date = new Date(dateString);
			const now = new Date();
			const diffMs = now - date;
			const diffMins = Math.floor(diffMs / 60000);

			if (diffMins < 1) return 'Baru saja';
			if (diffMins < 60) return `${diffMins} menit yang lalu`;

			const day = date.getDate();
			const monthsIndo = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
			const month = monthsIndo[date.getMonth()];
			const year = date.getFullYear();
			const hours = String(date.getHours()).padStart(2, '0');
			const minutes = String(date.getMinutes()).padStart(2, '0');

			return `${day} ${month} ${year}, ${hours}:${minutes} WIB`;
		} catch (e) {
			return 'Baru saja';
		}
	};

	useEffect(() => {
		const fetchEventDetails = async () => {
			setIsLoading(true);
			setApiError(null);
			setIsAccessDenied(false);
			try {
				const resSurvey = await api.get(`/events/${id}/survey`);

				if (resSurvey.data.success) {
					const data = resSurvey.data.data;

					if (data.has_ticket === false && !data.is_preview_only) {
						setIsAccessDenied(true);
						setIsLoading(false);
						return;
					}

					const resDetail = await api.get(`/events/${id}`);
					const eventData = resDetail.data.data || resDetail.data;

					setEvent({
						...data.event,
						...eventData,
					});
					setAlreadySubmitted(data.already_submitted);
					setTicketCode(data.ticket_code);
					setParticipantName(data.participant_name);

					let fetchedAnnouncements = [];
					try {
						const resAnn = await api.get(`/events/${id}/announcements`);
						if (resAnn.data?.success) {
							fetchedAnnouncements = resAnn.data.data || [];
						}
					} catch (err) {
						console.error('Gagal mengambil pengumuman:', err);
					}

					let filteredNotifications = [];
					try {
						const resNotif = await api.get('/notifications');
						if (resNotif.data?.success) {
							const allNotifs = resNotif.data.data || [];
							filteredNotifications = allNotifs.filter((notif) => {
								const notifData =
									typeof notif.data === 'string'
										? JSON.parse(notif.data)
										: notif.data || {};

								const notifEventId = notifData.event_id;
								const matchesEvent = String(notifEventId) === String(id);

								const relevantTypes = ['event_updated', 'H-24', 'H-1', 'M-15'];
								const matchesType = relevantTypes.includes(notifData.type);

								return matchesEvent && matchesType;
							});
						}
					} catch (err) {
						console.error('Gagal mengambil notifikasi:', err);
					}

					const mappedAnnouncements = fetchedAnnouncements.map((ann) => ({
						id: `ann-${ann.id}`,
						title: ann.title,
						content: ann.content,
						date: ann.created_at,
						type: 'announcement',
						isPinned: true,
						attachment_path: ann.attachment_path,
						attachment_type: ann.attachment_type,
						attachment_url: ann.attachment_url,
						raw: ann,
					}));

					const mappedNotifications = filteredNotifications.map((notif) => {
						const notifData =
							typeof notif.data === 'string'
								? JSON.parse(notif.data)
								: notif.data || {};

						return {
							id: `notif-${notif.id}`,
							title: notifData.title || 'Update Acara',
							content: notifData.message,
							date: notif.created_at,
							type: notifData.type,
							isPinned: ['H-1', 'M-15'].includes(notifData.type),
						};
					});

					const combined = [...mappedAnnouncements, ...mappedNotifications].sort(
						(a, b) => new Date(b.date) - new Date(a.date),
					);

					setAnnouncements(combined);
				} else {
					setIsAccessDenied(true);
				}
			} catch (err) {
				console.error('Gagal mengambil info event:', err);
				if (err.response?.status === 403 || err.response?.data?.has_ticket === false) {
					setIsAccessDenied(true);
				} else {
					setApiError(err.response?.data?.message || 'Gagal memuat beberapa data event.');
				}
			} finally {
				setIsLoading(false);
			}
		};

		if (id) {
			fetchEventDetails();
		}
	}, [id]);

	return {
		id,
		activeTab,
		setActiveTab,
		showTicketModal,
		setShowTicketModal,
		isLoading,
		apiError,
		isAccessDenied,
		event,
		alreadySubmitted,
		ticketCode,
		participantName,
		announcements,
		memberPoints,
		localRewardsCatalog,
		myRedemptions,
		showRedeemWarningModal,
		setShowRedeemWarningModal,
		pendingRedeemReward,
		handleRedeemReward,
		executeRedemption,
		getFullAttachmentUrl,
		formatTimeAgo,
	};
};
