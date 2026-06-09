import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '@/api/axios';
import FormHeading from '@/components/dashboard/FormHeading';
import '@/assets/css/participant-list.css';
import { notify } from '@/utils/notify';
import { useLoading } from '@/context/LoadingContext';
import { Modal, Button, Alert, Form } from 'react-bootstrap';
import { Coins, AlertTriangle, CheckCircle, Info } from 'lucide-react';

// Import komponen terpisah
import ParticipantStats from './components/ParticipantStats';
import ParticipantToolbar from './components/ParticipantToolbar';
import ParticipantTable from './components/ParticipantTable';
import ParticipantPagination from './components/ParticipantPagination';

const EventParticipantListPage = () => {
	const { eventId } = useParams();
	const { setIsPageLoading } = useLoading();

	const [participants, setParticipants] = useState([]);
	const [loading, setLoading] = useState(true);
	const [isExporting, setIsExporting] = useState(false);
	const [showAll, setShowAll] = useState(false);
	const [attendanceFilter, setAttendanceFilter] = useState('');
	const [searchTerm, setSearchTerm] = useState('');
	const [revealed, setRevealed] = useState({});
	const [pageInfo, setPageInfo] = useState({ current_page: 1, last_page: 1, total: 0 });

	const [summary, setSummary] = useState({
		total: 0,
		not_attended: 0,
		checked_in: 0,
		checked_out: 0,
		total_attendance: 1,
	});

	const [event, setEvent] = useState(null);
	const [showConvertModal, setShowConvertModal] = useState(false);
	const [isConverting, setIsConverting] = useState(false);
	const [agreeTerms, setAgreeTerms] = useState(false);

	const fetchEventDetails = async () => {
		try {
			const response = await api.get(`/events/${eventId}`);
			if (response.data && response.data.success) {
				setEvent(response.data.data);
			}
		} catch (error) {
			console.error('Gagal mengambil data event:', error);
		}
	};

	useEffect(() => {
		if (eventId) {
			fetchEventDetails();
		}
	}, [eventId]);

	const handleConvertPoints = async () => {
		if (!agreeTerms) {
			notify('error', 'Peringatan', 'Anda harus menyetujui pernyataan konfirmasi terlebih dahulu.');
			return;
		}

		try {
			setIsConverting(true);
			const response = await api.post(`/event-dashboard/${eventId}/points/reset`);
			if (response.data && response.data.status === 'success') {
				const { conversion_ratio, resets } = response.data.data;
				const totalParticipants = resets?.length || 0;
				notify(
					'success',
					'Berhasil',
					`Konversi poin berhasil diselesaikan! Poin lokal dari ${totalParticipants} peserta berhasil dikonversi ke poin global (Rasio 1:${conversion_ratio}).`
				);
				setShowConvertModal(false);
				setAgreeTerms(false);
				// Refresh list data
				fetchParticipants(pageInfo.current_page);
				fetchEventDetails();
			}
		} catch (error) {
			console.error('Error converting points:', error);
			const msg = error.response?.data?.message || 'Terjadi kesalahan saat mengonversi poin.';
			notify('error', 'Gagal', msg);
		} finally {
			setIsConverting(false);
		}
	};

	const fetchParticipants = async (page = 1) => {
		try {
			setLoading(true);
			setIsPageLoading(true);
			const params = { all: showAll, page };
			if (attendanceFilter) params.attendance = attendanceFilter;
			if (searchTerm) params.search = searchTerm;

			const response = await api.get(`/event-dashboard/${eventId}/daftar-peserta`, {
				params,
			});
			const { data, attendance_summary } = response.data;

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
		} catch (error) {
			notify('error', 'Gagal', 'Tidak dapat memuat daftar peserta. Silakan coba lagi nanti.');
		} finally {
			setLoading(false);
			setIsPageLoading(false);
		}
	};

	useEffect(() => {
		const delayDebounce = setTimeout(() => {
			if (eventId) {
				fetchParticipants(1);
			}
		}, 300);
		return () => clearTimeout(delayDebounce);
	}, [eventId, showAll, attendanceFilter, searchTerm]);

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
			notify('success', 'Berhasil', 'Laporan berhasil diunduh!');
		} catch (error) {
			console.error('Export error:', error);
			notify('error', 'Gagal', 'Tidak dapat mengunduh laporan. Silakan coba lagi nanti.');
		} finally {
			setIsExporting(false);
		}
	};

	return (
		<div className="participant-page">
			<div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
				<FormHeading
					title="Daftar Peserta Event"
					description={`Total: ${summary.total} peserta terdaftar`}
				/>
				<div className="d-flex align-items-center gap-2">
					{event && (
						<div 
							className="d-flex align-items-center gap-2 px-3 py-2 rounded shadow-sm border"
							style={{ 
								fontSize: '13px', 
								fontWeight: 600,
								backgroundColor: event.status === 'completed' ? '#ecfdf5' : '#fffbeb',
								borderColor: event.status === 'completed' ? '#a7f3d0' : '#fef3c7',
								color: event.status === 'completed' ? '#065f46' : '#b45309'
							}}
						>
							<div 
								style={{ 
									width: 8, 
									height: 8, 
									borderRadius: '50%', 
									backgroundColor: event.status === 'completed' ? '#10b981' : '#f59e0b' 
								}} 
							/>
							Status: {event.status === 'completed' ? 'Finished / Selesai' : event.status}
						</div>
					)}
					<Button
						variant="primary"
						className="d-flex align-items-center gap-2 shadow-sm animate-fade-in"
						onClick={() => setShowConvertModal(true)}
						style={{ 
							background: 'linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%)', 
							border: 'none', 
							padding: '8px 16px', 
							fontWeight: 600,
							borderRadius: '8px'
						}}
					>
						<Coins size={16} />
						Konversi Poin Peserta
					</Button>
				</div>
			</div>

			<ParticipantStats summary={summary} />

			<div className="participant-card">
				<ParticipantToolbar
					searchTerm={searchTerm}
					setSearchTerm={setSearchTerm}
					attendanceFilter={attendanceFilter}
					setAttendanceFilter={setAttendanceFilter}
					showAll={showAll}
					setShowAll={setShowAll}
					isExporting={isExporting}
					handleExportCSV={handleExportCSV}
				/>

				<div className="table-responsive">
					<ParticipantTable
						participants={participants}
						loading={loading}
						showAll={showAll}
						pageInfo={pageInfo}
						revealed={revealed}
						toggleReveal={toggleReveal}
						summary={summary}
						eventId={eventId}
					/>
				</div>

				{!loading && (
					<ParticipantPagination
						showAll={showAll}
						pageInfo={pageInfo}
						handlePageChange={handlePageChange}
					/>
				)}
			</div>

			<Modal 
				show={showConvertModal} 
				onHide={() => !isConverting && setShowConvertModal(false)}
				centered
				size="lg"
				backdrop="static"
				className="convert-points-modal"
			>
				<Modal.Header closeButton={!isConverting} style={{ borderBottom: '1px solid #e5e7eb' }}>
					<Modal.Title className="d-flex align-items-center gap-2 fw-bold text-dark">
						<Coins size={22} className="text-primary" />
						Konversi Poin Lokal ke Global
					</Modal.Title>
				</Modal.Header>
				<Modal.Body className="p-4">
					{event?.status !== 'completed' && (
						<Alert variant="warning" className="d-flex align-items-start gap-3 border-0 shadow-sm mb-4" style={{ backgroundColor: '#fffbeb', borderLeft: '4px solid #f59e0b', color: '#78350f' }}>
							<AlertTriangle size={20} className="mt-1 flex-shrink-0 text-warning" />
							<div>
								<h6 className="fw-bold mb-1" style={{ color: '#92400e' }}>Perhatian: Event Belum Selesai!</h6>
								<p className="mb-0 fs-sm" style={{ opacity: 0.9 }}>
									Status event saat ini adalah <strong style={{ textTransform: 'capitalize' }}>{event?.status || 'draft'}</strong>. 
									Biasanya konversi poin dilakukan ketika seluruh rangkaian acara event benar-benar sudah berakhir.
									Anda tetap dapat melanjutkan konversi jika yakin tidak akan ada lagi penambahan poin lokal untuk peserta.
								</p>
							</div>
						</Alert>
					)}

					<div className="mb-4">
						<h5 className="fw-bold mb-3 fs-6 text-secondary">Bagaimana cara kerja konversi poin?</h5>
						<div className="card border-0 shadow-sm p-3 bg-light mb-3">
							<div className="d-flex align-items-start gap-3">
								<Info size={18} className="text-info mt-1 flex-shrink-0" />
								<div className="fs-sm text-dark">
									<p className="mb-2">
										Setiap peserta yang terdaftar akan dikonversi poin lokalnya menjadi poin global milik akun user mereka. 
										Poin lokal didapatkan dari keaktifan check-in, pengisian survei, dan aktivitas spesifik event ini.
									</p>
									<p className="mb-2 fw-semibold">
										Rasio Konversi default: 10 Poin Lokal = 1 Poin Global.
									</p>
									<span className="text-muted">
										Contoh: Peserta dengan 120 poin lokal akan mendapatkan 12 poin global baru pada akunnya.
									</span>
								</div>
							</div>
						</div>

						<Alert variant="danger" className="d-flex align-items-start gap-3 border-0 shadow-sm" style={{ backgroundColor: '#fef2f2', borderLeft: '4px solid #ef4444', color: '#991b1b' }}>
							<AlertTriangle size={20} className="mt-1 flex-shrink-0 text-danger" />
							<div>
								<h6 className="fw-bold mb-1" style={{ color: '#7f1d1d' }}>Peringatan Penting</h6>
								<ul className="mb-0 ps-3 fs-sm" style={{ opacity: 0.95 }}>
									<li>Setelah dikonversi, sisa saldo poin lokal seluruh peserta untuk event <strong>{event?.title}</strong> ini akan direset menjadi <strong>0 (nol)</strong>.</li>
									<li>Tindakan ini <strong>tidak dapat dibatalkan</strong> dan poin yang sudah dikonversi <strong>tidak dapat dikembalikan</strong> menjadi poin lokal.</li>
									<li>Pastikan semua data kehadiran dan aktivitas peserta sudah terinput dengan benar sebelum melanjutkan.</li>
								</ul>
							</div>
						</Alert>
					</div>

					<Form.Group className="mb-3 mt-4">
						<Form.Check 
							type="checkbox"
							id="agree-terms-checkbox"
							checked={agreeTerms}
							onChange={(e) => setAgreeTerms(e.target.checked)}
							disabled={isConverting}
							label={
								<span className="fs-sm fw-medium text-dark user-select-none">
									Saya memahami risiko di atas dan menyetujui untuk mengonversi seluruh poin lokal peserta event menjadi poin global.
								</span>
							}
						/>
					</Form.Group>
				</Modal.Body>
				<Modal.Footer style={{ borderTop: '1px solid #e5e7eb', backgroundColor: '#f9fafb' }}>
					<Button 
						variant="outline-secondary" 
						onClick={() => setShowConvertModal(false)}
						disabled={isConverting}
						className="px-4 fw-semibold"
					>
						Batal
					</Button>
					<Button 
						variant="primary" 
						onClick={handleConvertPoints}
						disabled={!agreeTerms || isConverting}
						className="d-flex align-items-center gap-2 px-4 fw-semibold"
						style={{ 
							background: agreeTerms ? 'linear-gradient(135deg, #dc2626 0%, #ef4444 100%)' : '#e5e7eb',
							borderColor: 'transparent',
							color: agreeTerms ? 'white' : '#9ca3af'
						}}
					>
						{isConverting ? (
							<>
								<span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true" />
								Memproses Konversi...
							</>
						) : (
							<>
								<CheckCircle size={16} />
								Konversi Sekarang
							</>
						)}
					</Button>
				</Modal.Footer>
			</Modal>
		</div>
	);
};

export default EventParticipantListPage;
