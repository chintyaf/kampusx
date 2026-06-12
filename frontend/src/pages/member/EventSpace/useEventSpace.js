import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../../api/axios';
import { STORAGE_URL } from '../../../api/storage';

export const useEventSpace = () => {
	const { id } = useParams();
	const navigate = useNavigate();
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
	const [ticketStatus, setTicketStatus] = useState(null);
	const [certificateTemplate, setCertificateTemplate] = useState(null);
	const [customSurvey, setCustomSurvey] = useState(null);
	const [isPreviewOnly, setIsPreviewOnly] = useState(false);

	const [announcements, setAnnouncements] = useState([]);

	// Poin & Reward States
	const [memberPoints, setMemberPoints] = useState(0);
	const [localRewardsCatalog, setLocalRewardsCatalog] = useState([]);
	const [myRedemptions, setMyRedemptions] = useState([]);
	const [showRedeemWarningModal, setShowRedeemWarningModal] = useState(false);
	const [pendingRedeemReward, setPendingRedeemReward] = useState(null);

	const fetchRewardsCatalog = async () => {
		try {
			const resRewards = await api.get(`/events/${id}/rewards`);
			if (resRewards.data?.status === 'success') {
				setLocalRewardsCatalog(resRewards.data.data || []);
			}
		} catch (err) {
			console.error('Gagal memuat katalog reward:', err);
		}
	};

	const fetchPointsAndRedemptions = async () => {
		try {
			const resPoints = await api.get(`/events/${id}/my-points`);
			if (resPoints.data?.status === 'success') {
				const data = resPoints.data.data;
				setMemberPoints(data.points_balance || 0);

				const mapped = (data.redemptions || []).map((item) => ({
					id: item.id,
					reward_id: item.reward_id,
					reward_title: item.reward?.title || 'Reward tidak diketahui',
					reward_type: item.reward?.reward_type || 'physical',
					points_spent: item.points_spent,
					status: item.status,
					notes: item.notes,
					cancellation_reason: item.cancellation_reason,
					redeemed_at: item.redeemed_at || item.created_at,
				}));
				setMyRedemptions(mapped);
			}
		} catch (err) {
			console.error('Gagal memuat saldo poin & riwayat:', err);
		}
	};

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

		const locationDetail = event?.location_detail || event?.locationDetail || {};
		const locationType = locationDetail?.type || event?.location_type || 'offline';
		const isOnline = locationType === 'online';

		// Jika event diselenggarakan online (is_online) dan reward fisik
		if (isOnline && reward.reward_type === 'physical') {
			setPendingRedeemReward(reward);
			setShowRedeemWarningModal(true);
		} else {
			executeRedemption(reward);
		}
	};

	const executeRedemption = async (reward, notes = '') => {
		try {
			const res = await api.post(`/events/${id}/rewards/${reward.id}/redeem`, { notes });
			if (res.data?.status === 'success') {
				toast.success(res.data.message || `Berhasil menukar ${reward.title}!`);
				await fetchPointsAndRedemptions();
				setShowRedeemWarningModal(false);
			}
		} catch (err) {
			console.error('Gagal menukar reward:', err);
			toast.error(err.response?.data?.message || 'Gagal melakukan penukaran reward.');
		}
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
					setTicketStatus(data.ticket_status);
					setCertificateTemplate(data.certificate_template);
					setCustomSurvey(data.custom_survey);
					setIsPreviewOnly(!!data.is_preview_only);

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

					// Fetch local rewards catalog, member points, and redemptions in parallel
					await Promise.all([
						fetchRewardsCatalog(),
						fetchPointsAndRedemptions(),
					]);
				} else {
					setIsAccessDenied(true);
				}
			} catch (err) {
				console.error('Gagal mengambil info event:', err);
				if (err.response?.status === 404) {
					navigate('/not-found', { replace: true });
					return;
				}
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
		ticketStatus,
		certificateTemplate,
		customSurvey,
		isPreviewOnly,
	};
};
