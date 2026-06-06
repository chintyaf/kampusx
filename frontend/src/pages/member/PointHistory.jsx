import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Nav, Button, Badge, Spinner, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowUpRight, ArrowDownLeft, Coins, Award, Calendar, RefreshCw, FileText } from 'lucide-react';
import api from '@/api/axios';

const PointHistory = () => {
	const navigate = useNavigate();
	const [activeTab, setActiveTab] = useState('all'); // all | global | local
	const [ledger, setLedger] = useState({ global_balance: 0, local_balance: 0, transactions: [] });
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState(null);

	const loadData = async () => {
		try {
			setIsLoading(true);
			setError(null);
			const response = await api.get('/profile/ledger');
			if (response.data?.success) {
				setLedger(response.data.data);
			} else {
				setError('Gagal memuat data riwayat poin.');
			}
		} catch (err) {
			console.error('Error fetching point ledger:', err);
			setError(err.response?.data?.message || 'Terjadi kesalahan jaringan.');
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		loadData();
	}, []);

	// Filter transactions based on active tab
	const filteredTransactions = ledger.transactions.filter((tx) => {
		if (activeTab === 'global') return tx.type === 'global';
		if (activeTab === 'local') return tx.type === 'local';
		return true;
	});

	const formatDateTime = (dateStr) => {
		if (!dateStr) return '';
		return new Date(dateStr).toLocaleString('id-ID', {
			day: 'numeric',
			month: 'short',
			year: 'numeric',
			hour: '2-digit',
			minute: '2-digit',
		});
	};

	return (
		<Container className="py-4 py-md-5">
			{/* Back Button */}
			<Button
				variant="light"
				className="mb-4 d-flex align-items-center gap-2 border shadow-sm transition-all hover-scale"
				onClick={() => navigate('/')}
				style={{ borderRadius: '10px', fontSize: '13px' }}
			>
				<ArrowLeft size={16} /> Kembali ke Beranda
			</Button>

			{/* Page Header */}
			<div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
				<div>
					<h2 className="fw-extrabold text-dark mb-1 tracking-tight">Riwayat Poin & Transaksi</h2>
					<p className="text-muted mb-0 small">Lihat log perolehan dan penukaran poin global serta lokal Anda</p>
				</div>
				<Button
					variant="outline-secondary"
					className="d-flex align-items-center gap-2 py-2 px-3 hover-scale border"
					style={{ borderRadius: '10px', fontSize: '13px' }}
					onClick={loadData}
					disabled={isLoading}
				>
					<RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
					Refresh Log
				</Button>
			</div>

			{error && (
				<Alert variant="danger" className="border-0 rounded-3 shadow-sm mb-4">
					{error}
				</Alert>
			)}

			{/* Balance Cards Summary */}
			<Row className="g-3 mb-4">
				<Col xs={12} sm={6}>
					<Card
						className="border-0 shadow-sm text-white"
						style={{
							background: 'linear-gradient(135deg, #eab308 0%, #ca8a04 100%)',
							borderRadius: '14px',
						}}
					>
						<Card.Body className="p-3 d-flex align-items-center justify-content-between">
							<div>
								<span className="text-white-50 fw-semibold text-uppercase tracking-wider" style={{ fontSize: '10px' }}>
									Saldo Global Point
								</span>
								<h3 className="fw-bold mb-0 mt-1">{(ledger.global_balance ?? 0).toLocaleString()} Pts</h3>
							</div>
							<div className="p-2.5 bg-white bg-opacity-20 rounded-circle">
								<Coins size={22} />
							</div>
						</Card.Body>
					</Card>
				</Col>

				<Col xs={12} sm={6}>
					<Card
						className="border-0 shadow-sm text-white"
						style={{
							background: 'linear-gradient(135deg, #0d9488 0%, #0f766e 100%)',
							borderRadius: '14px',
						}}
					>
						<Card.Body className="p-3 d-flex align-items-center justify-content-between">
							<div>
								<span className="text-white-50 fw-semibold text-uppercase tracking-wider" style={{ fontSize: '10px' }}>
									Saldo Local Point (Total)
								</span>
								<h3 className="fw-bold mb-0 mt-1">{(ledger.local_balance ?? 0).toLocaleString()} Pts</h3>
							</div>
							<div className="p-2.5 bg-white bg-opacity-20 rounded-circle">
								<Award size={22} />
							</div>
						</Card.Body>
					</Card>
				</Col>
			</Row>

			{/* Main Ledger Card */}
			<Card className="border shadow-sm" style={{ borderRadius: '16px', overflow: 'hidden' }}>
				<Card.Header className="bg-white border-bottom p-0">
					<Nav variant="tabs" className="border-bottom-0 px-3 pt-2">
						<Nav.Item>
							<Nav.Link
								active={activeTab === 'all'}
								onClick={() => setActiveTab('all')}
								className={`fw-bold px-3 py-2.5 ${activeTab === 'all' ? 'text-primary border-primary border-bottom-2' : 'text-muted'}`}
								style={{ fontSize: '13px', cursor: 'pointer', border: 'none', background: 'transparent' }}
							>
								Semua Transaksi
							</Nav.Link>
						</Nav.Item>
						<Nav.Item>
							<Nav.Link
								active={activeTab === 'global'}
								onClick={() => setActiveTab('global')}
								className={`fw-bold px-3 py-2.5 ${activeTab === 'global' ? 'text-primary border-primary border-bottom-2' : 'text-muted'}`}
								style={{ fontSize: '13px', cursor: 'pointer', border: 'none', background: 'transparent' }}
							>
								Poin Global
							</Nav.Link>
						</Nav.Item>
						<Nav.Item>
							<Nav.Link
								active={activeTab === 'local'}
								onClick={() => setActiveTab('local')}
								className={`fw-bold px-3 py-2.5 ${activeTab === 'local' ? 'text-primary border-primary border-bottom-2' : 'text-muted'}`}
								style={{ fontSize: '13px', cursor: 'pointer', border: 'none', background: 'transparent' }}
							>
								Poin Lokal
							</Nav.Link>
						</Nav.Item>
					</Nav>
				</Card.Header>

				<Card.Body className="p-0" style={{ background: '#fafbfc' }}>
					{isLoading ? (
						<div className="text-center py-5">
							<Spinner animation="border" variant="primary" role="status" className="mb-2" />
							<div className="text-muted small">Memuat riwayat transaksi...</div>
						</div>
					) : filteredTransactions.length === 0 ? (
						<div className="text-center py-5 px-3 text-muted">
							<FileText size={48} className="opacity-30 mb-3 mx-auto" />
							<h6 className="fw-bold">Belum Ada Transaksi</h6>
							<p className="small mb-0">Semua riwayat perolehan atau penggunaan poin Anda akan tercatat di sini.</p>
						</div>
					) : (
						<div className="divide-y bg-white">
							{filteredTransactions.map((tx) => {
								const isEarning = tx.amount > 0;
								return (
									<div
										key={tx.id}
										className="p-3 d-flex align-items-center justify-content-between border-bottom hover-bg-light transition-all"
										style={{ borderBottom: '1px solid var(--color-border)' }}
									>
										<div className="d-flex align-items-center gap-3" style={{ minWidth: 0, flex: 1 }}>
											{/* Icon Indicator */}
											<div
												className="p-2.5 rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
												style={{
													backgroundColor: isEarning ? 'var(--success-bg)' : 'var(--danger-bg)',
													color: isEarning ? 'var(--success-text)' : 'var(--danger-text)',
												}}
											>
												{isEarning ? <ArrowUpRight size={18} /> : <ArrowDownLeft size={18} />}
											</div>

											{/* Text Content */}
											<div style={{ minWidth: 0 }}>
												<h6 className="mb-1 fw-bold text-dark text-truncate" style={{ fontSize: '13px' }} title={tx.description}>
													{tx.description}
												</h6>
												
												<div className="d-flex align-items-center gap-2 flex-wrap" style={{ fontSize: '11px' }}>
													{/* Type Badge */}
													<Badge
														bg={tx.type === 'global' ? 'warning-subtle' : 'info-subtle'}
														className={`text-capitalize ${tx.type === 'global' ? 'text-warning-emphasis' : 'text-info-emphasis'}`}
														style={{ fontSize: '10px' }}
													>
														{tx.type === 'global' ? 'Global' : 'Lokal'}
													</Badge>

													{/* Date Time */}
													<span className="text-muted">{formatDateTime(tx.created_at)}</span>

													{/* Associated Event if applicable */}
													{tx.type === 'local' && tx.event && (
														<span className="text-muted d-flex align-items-center gap-1">
															• <Calendar size={11} /> {tx.event.title}
														</span>
													)}
												</div>
											</div>
										</div>

										{/* Point Amount */}
										<div className="text-end ps-3 flex-shrink-0">
											<span
												className="fw-extrabold text-nowrap"
												style={{
													fontSize: '15px',
													color: isEarning ? 'var(--success-text)' : 'var(--danger-text)',
												}}
											>
												{isEarning ? `+${tx.amount}` : tx.amount} Pts
											</span>
										</div>
									</div>
								);
							})}
						</div>
					)}
				</Card.Body>
			</Card>
		</Container>
	);
};

export default PointHistory;
