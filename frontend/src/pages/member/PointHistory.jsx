import React, { useState, useEffect } from 'react';
import { Container, Table, Badge, Button, Tabs, Tab, Spinner, Alert } from 'react-bootstrap';
import { ArrowLeft, Coins, Award, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '@/api/axios';

const PointHistory = () => {
	const navigate = useNavigate();
	const [searchParams, setSearchParams] = useSearchParams();
	
	// Determine initial tab from query parameter 'type'
	const initialTab = searchParams.get('type') === 'local' ? 'local' : 'global';
	const [activeTab, setActiveTab] = useState(initialTab);
	
	const [history, setHistory] = useState([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState(null);
	
	// Pagination States
	const [currentPage, setCurrentPage] = useState(1);
	const [lastPage, setLastPage] = useState(1);

	// Sync active tab state with URL parameter if it changes
	useEffect(() => {
		const type = searchParams.get('type');
		if (type === 'local' || type === 'global') {
			setActiveTab(type);
		}
	}, [searchParams]);

	// Fetch history data when tab or page changes
	useEffect(() => {
		fetchHistory(activeTab, currentPage);
	}, [activeTab, currentPage]);

	const fetchHistory = async (type, page) => {
		try {
			setIsLoading(true);
			setError(null);
			const response = await api.get(`/member/points/history?type=${type}&page=${page}`);
			if (response.data) {
				setHistory(response.data.data || []);
				if (response.data.meta) {
					setCurrentPage(response.data.meta.current_page || 1);
					setLastPage(response.data.meta.last_page || 1);
				}
			}
		} catch (err) {
			console.error('Gagal mengambil data riwayat poin:', err);
			setError(err.response?.data?.message || 'Gagal memuat data riwayat poin. Silakan coba lagi.');
		} finally {
			setIsLoading(false);
		}
	};

	const handleTabChange = (key) => {
		setActiveTab(key);
		setCurrentPage(1); // Reset page on tab change
		setSearchParams({ type: key });
	};

	const formatDate = (dateString) => {
		if (!dateString) return '-';
		const date = new Date(dateString);
		return date.toLocaleDateString('id-ID', {
			day: 'numeric',
			month: 'long',
			year: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	};

	return (
		<Container className="py-4 py-md-5">
			{/* Back Button */}
			<Button
                variant="light"
                className="mb-4 d-flex align-items-center gap-2 border shadow-sm transition-all hover-scale"
                onClick={() => navigate(-1)}
                style={{ borderRadius: '10px', fontSize: '13px' }}
            >
                <ArrowLeft size={16} /> Kembali
            </Button>

			{/* Page Header */}
			<div className="mb-4">
				<h3 className="fw-bold text-dark mb-1">Riwayat Transaksi Poin</h3>
				<p className="text-muted mb-0 small">
					Lacak seluruh mutasi penambahan dan pemakaian poin lokal maupun global Anda.
				</p>
			</div>

			{/* Tabs Navigation */}
			<Tabs
				activeKey={activeTab}
				onSelect={handleTabChange}
				className="mb-4 custom-tabs border-bottom-0"
				style={{ gap: '8px' }}
			>
				<Tab
					eventKey="local"
					title={
						<span className="d-flex align-items-center gap-2 px-2 py-1">
							<Award size={16} />
							Poin Lokal (Event)
						</span>
					}
				/>
				<Tab
					eventKey="global"
					title={
						<span className="d-flex align-items-center gap-2 px-2 py-1">
							<Coins size={16} />
							Poin Global (Permanen)
						</span>
					}
				/>
			</Tabs>

			{error && (
				<Alert variant="danger" className="border-0 rounded-4 shadow-sm mb-4">
					{error}
				</Alert>
			)}

			{isLoading ? (
				<div className="text-center py-5">
					<Spinner animation="border" variant="primary" role="status" className="mb-2">
						<span className="visually-hidden">Loading...</span>
					</Spinner>
					<div className="text-muted small">Memuat riwayat poin...</div>
				</div>
			) : history.length === 0 ? (
				<div className="text-center py-5 text-muted border rounded-4 bg-light d-flex flex-column align-items-center justify-content-center">
					<Coins size={48} className="text-muted mb-3 opacity-30" />
					<h6 className="fw-bold">Belum Ada Riwayat Transaksi</h6>
					<p className="small mb-0">
						Anda belum memiliki mutasi transaksi poin untuk kategori {activeTab === 'local' ? 'Lokal' : 'Global'} saat ini.
					</p>
				</div>
			) : (
				<>
					<div className="table-responsive shadow-sm border rounded-4 overflow-hidden bg-white mb-4">
						<Table hover className="align-middle mb-0" style={{ fontSize: '13px' }}>
							<thead className="table-light text-dark fw-bold">
								<tr>
									<th className="py-3 px-4" style={{ width: '25%' }}>Tanggal & Waktu</th>
									<th className="py-3">Deskripsi / Sumber</th>
									<th className="py-3 px-4 text-end" style={{ width: '20%' }}>Nominal Poin</th>
								</tr>
							</thead>
							<tbody>
								{history.map((tx) => {
									const isPositive = tx.amount > 0;
									return (
										<tr key={tx.id}>
											<td className="py-3 px-4 text-muted">
												{formatDate(tx.created_at)}
											</td>
											<td className="py-3">
												<div className="fw-bold text-dark">{tx.description}</div>
												{tx.event && (
													<span className="text-teal small fw-semibold d-block mt-1" style={{ color: '#0d9488', fontSize: '11px' }}>
														Event: {tx.event.title}
													</span>
												)}
												{tx.reward && (
													<span className="text-warning small fw-semibold d-block mt-1" style={{ color: '#d97706', fontSize: '11px' }}>
														Reward: {tx.reward.title} ({tx.reward.points_cost} Pts)
													</span>
												)}
											</td>
											<td className="py-3 px-4 text-end">
												<Badge
													bg={isPositive ? 'success-subtle' : 'danger-subtle'}
													className={`px-3 py-2 fw-bold ${isPositive ? 'text-success' : 'text-danger'}`}
													style={{ borderRadius: '8px', fontSize: '13px' }}
												>
													<span className="d-inline-flex align-items-center gap-1">
														{isPositive ? (
															<>
																<ArrowUpRight size={14} />
																+{tx.amount.toLocaleString()} Pts
															</>
														) : (
															<>
																<ArrowDownLeft size={14} />
																{tx.amount.toLocaleString()} Pts
															</>
														)}
													</span>
												</Badge>
											</td>
										</tr>
									);
								})}
							</tbody>
						</Table>
					</div>

					{/* Pagination Controls */}
					{lastPage > 1 && (
						<div className="d-flex justify-content-between align-items-center">
							<Button
								variant="outline-secondary"
								size="sm"
								disabled={currentPage === 1}
								onClick={() => setCurrentPage(currentPage - 1)}
								style={{ borderRadius: '8px', fontSize: '12px' }}
							>
								Sebelumnya
							</Button>
							<span className="text-muted small">
								Halaman <strong>{currentPage}</strong> dari <strong>{lastPage}</strong>
							</span>
							<Button
								variant="outline-secondary"
								size="sm"
								disabled={currentPage === lastPage}
								onClick={() => setCurrentPage(currentPage + 1)}
								style={{ borderRadius: '8px', fontSize: '12px' }}
							>
								Selanjutnya
							</Button>
						</div>
					)}
				</>
			)}
		</Container>
	);
};

export default PointHistory;
