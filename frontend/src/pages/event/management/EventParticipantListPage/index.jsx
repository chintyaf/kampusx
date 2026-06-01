import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../../../api/axios';
import { toast } from 'react-hot-toast';
import {
	Spinner,
	Dropdown,
	Button,
} from 'react-bootstrap';
import {
	Search,
	Filter,
	MoreVertical,
	UserCheck,
	Eye,
	EyeOff,
	School,
	MessageCircle,
	Users,
	Clock,
	CheckCircle2,
	XCircle,
	ChevronLeft,
	ChevronRight,
	Download,
	LogOut,
	LogIn,
	CalendarX,
} from 'lucide-react';
import FormHeading from '@/components/dashboard/FormHeading';
import '../../../../assets/css/participant-list.css';

// ─── Utility: masking helpers ────────────────────────────────────────────────
const maskEmail = (email) => {
	if (!email) return '-';
	const [user, domain] = email.split('@');
	if (!domain) return email;
	const visible = user.slice(0, Math.min(3, user.length));
	return `${visible}***@${domain}`;
};

const maskPhone = (phone) => {
	if (!phone) return '-';
	const digits = phone.replace(/\D/g, '');
	if (digits.length < 6) return '***';
	return digits.slice(0, 3) + ' **** ' + digits.slice(-3);
};

// ─── Attendance status helper ────────────────────────────────────────────────
const getAttendanceStatus = (ticket) => {
	const log = ticket.attendance_log;
	if (!log || !log.scan_time) {
		return {
			key: 'not_attended',
			label: 'Belum Hadir',
			className: 'attendance-badge attendance-badge--absent',
			icon: <CalendarX size={11} />,
		};
	}
	if (log.checkout_time) {
		return {
			key: 'checked_out',
			label: 'Selesai',
			className: 'attendance-badge attendance-badge--checkout',
			icon: <LogOut size={11} />,
		};
	}
	return {
		key: 'checked_in',
		label: 'Hadir',
		className: 'attendance-badge attendance-badge--checkin',
		icon: <LogIn size={11} />,
	};
};

// ─── Format time helper ───────────────────────────────────────────────────────
const fmtTime = (isoStr) => {
	if (!isoStr) return null;
	return new Date(isoStr).toLocaleTimeString('id-ID', {
		hour: '2-digit',
		minute: '2-digit',
	});
};

// ─── Avatar initials ──────────────────────────────────────────────────────────
const getInitials = (name = '') =>
	name
		.split(' ')
		.slice(0, 2)
		.map((w) => w[0])
		.join('')
		.toUpperCase();

// ─── Color pool for avatars (deterministic by name) ──────────────────────────
const AVATAR_COLORS = [
	{ bg: '#dff3ff', text: '#00699e' },
	{ bg: '#dcfce7', text: '#166534' },
	{ bg: '#fef3c7', text: '#92400e' },
	{ bg: '#fce7f3', text: '#9d174d' },
	{ bg: '#ede9fe', text: '#4c1d95' },
	{ bg: '#fee2e2', text: '#991b1b' },
];
const getAvatarColor = (name = '') => {
	const code = [...name].reduce((acc, c) => acc + c.charCodeAt(0), 0);
	return AVATAR_COLORS[code % AVATAR_COLORS.length];
};

// ─── Filter config ─────────────────────────────────────────────────────────────
const ATTENDANCE_FILTERS = [
	{ value: '', label: 'Semua Status' },
	{ value: 'not_attended', label: 'Belum Hadir' },
	{ value: 'checked_in', label: 'Sudah Check-in' },
	{ value: 'checked_out', label: 'Sudah Check-out' },
];

// ─── Component ────────────────────────────────────────────────────────────────
const EventParticipantListPage = () => {
	const { eventId } = useParams();

	const [participants, setParticipants] = useState([]);
	const [loading, setLoading] = useState(true);
	const [isExporting, setIsExporting] = useState(false);
	const [showAll, setShowAll] = useState(false);
	const [attendanceFilter, setAttendanceFilter] = useState('');
	const [revealed, setRevealed] = useState({});
	const [pageInfo, setPageInfo] = useState({ current_page: 1, last_page: 1, total: 0 });

	// Attendance summary (from API, accurate across all pages)
	const [summary, setSummary] = useState({
		total: 0,
		not_attended: 0,
		checked_in: 0,
		checked_out: 0,
	});

	const fetchParticipants = async (page = 1) => {
		try {
			setLoading(true);
			const params = { all: showAll, page };
			if (attendanceFilter) params.attendance = attendanceFilter;

			const response = await api.get(`/event-dashboard/${eventId}/daftar-peserta`, { params });
			const { data, attendance_summary } = response.data;

			// Update summary dari API (akurat untuk semua data, bukan hanya halaman ini)
			if (attendance_summary) setSummary(attendance_summary);

			if (showAll) {
				setParticipants(data);
				setPageInfo({ total: data.length });
			} else {
				setParticipants(data.data);
				setPageInfo({
					current_page: data.current_page,
					last_page: data.last_page,
					total: data.total,
				});
			}
		} catch {
			toast.error('Tidak dapat memuat daftar peserta.');
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		if (eventId) fetchParticipants();
	}, [eventId, showAll, attendanceFilter]);

	const toggleReveal = (ticketId, field) => {
		setRevealed((prev) => ({
			...prev,
			[ticketId]: { ...prev[ticketId], [field]: !prev[ticketId]?.[field] },
		}));
	};

	const handlePageChange = (page) => {
		if (page < 1 || page > pageInfo.last_page) return;
		fetchParticipants(page);
	};

	const handleExportCSV = async () => {
		setIsExporting(true);
		try {
			const res = await api.get(`/event-dashboard/${eventId}/export-report`, {
				responseType: 'blob',
			});
			const url = window.URL.createObjectURL(new Blob([res.data]));
			const link = document.createElement('a');
			link.href = url;
			link.setAttribute('download', `laporan_kehadiran_event_${eventId}.xlsx`);
			document.body.appendChild(link);
			link.click();
			link.parentNode.removeChild(link);
			toast.success('Laporan berhasil diunduh!');
		} catch (error) {
			console.error('Export error:', error);
			toast.error('Gagal mengunduh laporan');
		} finally {
			setIsExporting(false);
		}
	};

	// ── Attendance rate ──────────────────────────────────────────────────────
	const attendedTotal = summary.checked_in + summary.checked_out;
	const attendanceRate = summary.total > 0
		? Math.round((attendedTotal / summary.total) * 100)
		: 0;

	// ── Pagination ────────────────────────────────────────────────────────────
	const renderPagination = () => {
		if (showAll || pageInfo.last_page <= 1) return null;

		const buildItems = () => {
			const items = [];
			const { current_page, last_page } = pageInfo;
			const delta = 1;
			const range = [];

			for (
				let i = Math.max(2, current_page - delta);
				i <= Math.min(last_page - 1, current_page + delta);
				i++
			) {
				range.push(i);
			}

			const pages = [1, ...range, last_page].filter((v, i, arr) => arr.indexOf(v) === i);

			pages.forEach((page, idx) => {
				if (idx > 0 && page - pages[idx - 1] > 1) {
					items.push(
						<span key={`ellipsis-${idx}`} className="pagination-ellipsis">
							…
						</span>,
					);
				}
				items.push(
					<button
						key={page}
						className={`pagination-btn${page === current_page ? ' active' : ''}`}
						onClick={() => handlePageChange(page)}
					>
						{page}
					</button>,
				);
			});
			return items;
		};

		return (
			<div className="participant-pagination">
				<span className="pagination-info">
					Halaman {pageInfo.current_page} dari {pageInfo.last_page}
				</span>
				<div className="pagination-controls">
					<button
						className="pagination-btn pagination-nav"
						onClick={() => handlePageChange(pageInfo.current_page - 1)}
						disabled={pageInfo.current_page === 1}
					>
						<ChevronLeft size={14} />
					</button>
					{buildItems()}
					<button
						className="pagination-btn pagination-nav"
						onClick={() => handlePageChange(pageInfo.current_page + 1)}
						disabled={pageInfo.current_page === pageInfo.last_page}
					>
						<ChevronRight size={14} />
					</button>
				</div>
			</div>
		);
	};

	const currentFilterLabel = ATTENDANCE_FILTERS.find(f => f.value === attendanceFilter)?.label ?? 'Semua Status';

	return (
		<div className="participant-page">

			<div className="d-flex justify-content-between align-items-start">
				<FormHeading
					title="Daftar Peserta Event"
					description={`Total: ${summary.total} peserta terdaftar`}
				/>
			</div>

			{/* ── Stats row ─────────────────────────────────────────────── */}
			<div className="participant-stats">

				{/* Total */}
				<div className="stat-card">
					<div className="stat-card__icon stat-card__icon--blue">
						<Users size={16} />
					</div>
					<div>
						<p className="stat-card__label">Total Peserta</p>
						<p className="stat-card__value">{summary.total}</p>
					</div>
				</div>

				{/* Belum Hadir */}
				<div className="stat-card">
					<div className="stat-card__icon stat-card__icon--yellow">
						<Clock size={16} />
					</div>
					<div>
						<p className="stat-card__label">Belum Hadir</p>
						<p className="stat-card__value">{summary.not_attended}</p>
					</div>
				</div>

				{/* Sudah Check-in */}
				<div className="stat-card">
					<div className="stat-card__icon stat-card__icon--green">
						<LogIn size={16} />
					</div>
					<div>
						<p className="stat-card__label">Check-in</p>
						<p className="stat-card__value">{summary.checked_in}</p>
					</div>
				</div>

				{/* Sudah Check-out */}
				<div className="stat-card">
					<div className="stat-card__icon stat-card__icon--purple">
						<LogOut size={16} />
					</div>
					<div>
						<p className="stat-card__label">Check-out</p>
						<p className="stat-card__value">{summary.checked_out}</p>
					</div>
				</div>

				{/* Kehadiran Rate */}
				<div className="stat-card stat-card--rate">
					<div className="stat-card__rate-ring">
						<svg viewBox="0 0 36 36" className="rate-ring-svg">
							<circle className="rate-ring-bg" cx="18" cy="18" r="15.9" />
							<circle
								className="rate-ring-fill"
								cx="18" cy="18" r="15.9"
								strokeDasharray={`${attendanceRate} ${100 - attendanceRate}`}
								strokeDashoffset="25"
							/>
						</svg>
						<span className="rate-ring-label">{attendanceRate}%</span>
					</div>
					<div>
						<p className="stat-card__label">Tingkat Kehadiran</p>
						<p className="stat-card__value--sm">{attendedTotal} / {summary.total} hadir</p>
					</div>
				</div>

			</div>

			{/* ── Main card ─────────────────────────────────────────────── */}
			<div className="participant-card">
				{/* Toolbar */}
				<div className="participant-toolbar">
					<div className="d-flex gap-2">
						<div className="participant-search">
							<Search size={16} className="participant-search__icon" />
							<input
								type="text"
								placeholder="Cari peserta… (segera hadir)"
								className="participant-search__input"
								disabled
							/>
						</div>

						{/* Filter Kehadiran */}
						<Dropdown>
							<Dropdown.Toggle
								variant="outline-secondary"
								size="sm"
								className="d-flex align-items-center gap-2"
							>
								<Filter size={15} />
								{currentFilterLabel}
							</Dropdown.Toggle>
							<Dropdown.Menu className="shadow-sm">
								{ATTENDANCE_FILTERS.map((f) => (
									<Dropdown.Item
										key={f.value}
										onClick={() => setAttendanceFilter(f.value)}
										active={attendanceFilter === f.value}
									>
										{f.label}
									</Dropdown.Item>
								))}
							</Dropdown.Menu>
						</Dropdown>

						{/* Export */}
						<Button
							variant="outline-secondary"
							size="sm"
							onClick={handleExportCSV}
							disabled={isExporting}
							className="d-flex align-items-center gap-2"
						>
							{isExporting ? <Spinner size="sm" /> : <Download size={15} />}
							Export
						</Button>
					</div>

					<div className="d-flex align-items-center gap-3">
						<label className="show-all-toggle">
							<div
								className={`toggle-track${showAll ? ' toggle-track--on' : ''}`}
								onClick={() => setShowAll((v) => !v)}
							>
								<div className="toggle-thumb" />
							</div>
							<span className="toggle-label">Tampilkan semua data</span>
						</label>
					</div>
				</div>

				{/* Table area */}
				<div className="table-responsive">
					{loading ? (
						<div className="participant-empty">
							<Spinner
								animation="border"
								variant="primary"
								style={{ width: 28, height: 28 }}
							/>
							<span className="ms-2 text-muted fs-sm">Memuat data…</span>
						</div>
					) : participants.length === 0 ? (
						<div className="participant-empty">
							<Users
								size={36}
								strokeWidth={1.2}
								style={{ color: 'var(--color-text-muted)' }}
							/>
							<p className="text-muted mt-2 fs-sm">
								Tidak ada peserta untuk ditampilkan.
							</p>
						</div>
					) : (
						<table className="participant-table">
							<thead>
								<tr>
									<th style={{ width: 40 }}>#</th>
									<th>Peserta</th>
									<th>Institusi</th>
									<th>Email</th>
									<th>Telepon</th>
									<th className="text-center">Kehadiran</th>
									<th style={{ width: 48 }}></th>
								</tr>
							</thead>
							<tbody>
								{participants.map((ticket, idx) => {
									const name =
										ticket.attendee_name ||
										ticket.participant?.name ||
										'Tidak diketahui';
									const email =
										ticket.attendee_email || ticket.participant?.email || null;
									const phone = ticket.participant?.phone || null;
									const university = ticket.participant?.university?.name || null;
									const avatarColor = getAvatarColor(name);
									const isEmailRevealed = revealed[ticket.id]?.email;
									const isPhoneRevealed = revealed[ticket.id]?.phone;
									const rowNum = showAll
										? idx + 1
										: (pageInfo.current_page - 1) * 15 + idx + 1;

									// Attendance data
									const attendanceStatus = getAttendanceStatus(ticket);
									const log = ticket.attendance_log;
									const checkinTime = log?.scan_time ? fmtTime(log.scan_time) : null;
									const checkoutTime = log?.checkout_time ? fmtTime(log.checkout_time) : null;

									return (
										<tr key={ticket.id} className="participant-row">
											{/* No. */}
											<td>
												<span className="row-number">{rowNum}</span>
											</td>

											{/* Nama */}
											<td>
												<div className="participant-identity">
													<div
														className="participant-avatar"
														style={{
															background: avatarColor.bg,
															color: avatarColor.text,
														}}
													>
														{getInitials(name)}
													</div>
													<div>
														<p className="participant-name">{name}</p>
														<p className="participant-time">
															#{ticket.ticket_code ?? ticket.id}
														</p>
													</div>
												</div>
											</td>

											{/* Institusi */}
											<td>
												{university ? (
													<div className="institution-cell">
														<School size={13} />
														<span>{university}</span>
													</div>
												) : (
													<span className="text-muted fs-xs">
														Umum / tidak terdata
													</span>
												)}
											</td>

											{/* Email — masked by default */}
											<td>
												<div className="masked-field">
													<span
														className={`masked-value${!isEmailRevealed ? ' masked-value--hidden' : ''}`}
													>
														{isEmailRevealed
															? email || '-'
															: maskEmail(email)}
													</span>
													{email && (
														<button
															className="reveal-btn"
															onClick={() =>
																toggleReveal(ticket.id, 'email')
															}
															title={
																isEmailRevealed
																	? 'Sembunyikan'
																	: 'Tampilkan email'
															}
														>
															{isEmailRevealed ? (
																<EyeOff size={12} />
															) : (
																<Eye size={12} />
															)}
														</button>
													)}
												</div>
											</td>

											{/* Telepon — masked by default */}
											<td>
												<div className="masked-field">
													<span
														className={`masked-value${!isPhoneRevealed ? ' masked-value--hidden' : ''}`}
													>
														{isPhoneRevealed
															? phone || '-'
															: maskPhone(phone)}
													</span>
													{phone && (
														<button
															className="reveal-btn"
															onClick={() =>
																toggleReveal(ticket.id, 'phone')
															}
															title={
																isPhoneRevealed
																	? 'Sembunyikan'
																	: 'Tampilkan nomor'
															}
														>
															{isPhoneRevealed ? (
																<EyeOff size={12} />
															) : (
																<Eye size={12} />
															)}
														</button>
													)}
												</div>
											</td>

											{/* ── Kehadiran ─────────────────────────────── */}
											<td className="text-center">
												<div className="attendance-cell">
													{/* Badge status utama */}
													<span className={attendanceStatus.className}>
														{attendanceStatus.icon}
														{attendanceStatus.label}
													</span>

													{/* Waktu check-in */}
													{checkinTime && (
														<div className="attendance-time-row">
															<LogIn size={10} className="attendance-time-icon attendance-time-icon--in" />
															<span className="attendance-time-text">
																{checkinTime}
															</span>
														</div>
													)}

													{/* Waktu check-out */}
													{checkoutTime && (
														<div className="attendance-time-row">
															<LogOut size={10} className="attendance-time-icon attendance-time-icon--out" />
															<span className="attendance-time-text">
																{checkoutTime}
															</span>
														</div>
													)}
												</div>
											</td>

											{/* Actions */}
											<td>
												<Dropdown align="end">
													<Dropdown.Toggle
														variant="link"
														className="action-toggle"
													>
														<MoreVertical size={16} />
													</Dropdown.Toggle>
													<Dropdown.Menu className="shadow-sm">
														{phone && (
															<Dropdown.Item
																href={`https://wa.me/${(phone || '').replace(/\D/g, '')}`}
																target="_blank"
																rel="noopener noreferrer"
																className="d-flex align-items-center gap-2 fs-sm"
															>
																<MessageCircle
																	size={14}
																	className="text-success"
																/>
																Hubungi via WhatsApp
															</Dropdown.Item>
														)}
														<Dropdown.Item className="d-flex align-items-center gap-2 fs-sm">
															<UserCheck
																size={14}
																className="text-primary"
															/>
															Tandai Hadir Manual
														</Dropdown.Item>
														<Dropdown.Divider />
														<Dropdown.Item className="d-flex align-items-center gap-2 fs-sm text-muted">
															<Eye size={14} />
															Lihat Detail Peserta
														</Dropdown.Item>
													</Dropdown.Menu>
												</Dropdown>
											</td>
										</tr>
									);
								})}
							</tbody>
						</table>
					)}
				</div>

				{/* Pagination */}
				{!loading && renderPagination()}
			</div>
		</div>
	);
};

export default EventParticipantListPage;
