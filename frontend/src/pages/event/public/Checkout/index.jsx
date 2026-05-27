import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Spinner, Alert } from 'react-bootstrap';
import {
	ArrowLeft,
	CheckCircle,
	Calendar,
	MapPin,
	User,
	Mail,
	Phone,
	ShieldCheck,
	Tag,
	CreditCard,
	Ticket,
	QrCode,
	Download,
} from 'lucide-react';
import { Link, useParams, useNavigate } from 'react-router-dom';
// import api from "../../api/axios";
// import { useAuth } from "../../context/AuthContext";
import axios from 'axios';
import api from '../../../../api/axios';
import { useAuth } from '../../../../context/AuthContext'; // Sesuaikan path-nya

// ── Step indicator ────────────────────────────────────────────────────────────
const Steps = ({ current }) => {
	const items = ['Informasi', 'Pembayaran', 'Selesai'];
	return (
		<div
			style={{
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
				marginBottom: 32,
			}}>
			{items.map((label, i) => {
				const idx = i + 1;
				const done = current > idx;
				const active = current === idx;
				return (
					<React.Fragment key={idx}>
						<div
							style={{
								display: 'flex',
								flexDirection: 'column',
								alignItems: 'center',
								gap: 4,
							}}>
							<div
								style={{
									width: 32,
									height: 32,
									borderRadius: '50%',
									display: 'flex',
									alignItems: 'center',
									justifyContent: 'center',
									fontSize: 13,
									fontWeight: 700,
									background:
										done || active
											? 'var(--color-primary)'
											: 'var(--color-border)',
									color: done || active ? '#fff' : 'var(--color-secondary)',
									transition: 'all .2s',
								}}>
								{done ? <CheckCircle size={16} /> : idx}
							</div>
							<span
								style={{
									fontSize: 11,
									fontWeight: active ? 700 : 400,
									color: active
										? 'var(--color-primary)'
										: 'var(--color-secondary)',
								}}>
								{label}
							</span>
						</div>
						{i < items.length - 1 && (
							<div
								style={{
									flex: 1,
									height: 2,
									background:
										current > idx
											? 'var(--color-primary)'
											: 'var(--color-border)',
									margin: '0 8px',
									marginBottom: 20,
									transition: 'all .2s',
								}}
							/>
						)}
					</React.Fragment>
				);
			})}
		</div>
	);
};

// ── Field wrapper ─────────────────────────────────────────────────────────────
const FieldIcon = ({ icon: Icon, children }) => (
	<div style={{ position: 'relative' }}>
		<Icon
			size={16}
			style={{
				position: 'absolute',
				top: 11,
				left: 12,
				color: 'var(--color-secondary)',
				pointerEvents: 'none',
			}}
		/>
		{React.cloneElement(children, {
			style: {
				...children.props.style,
				paddingLeft: 36,
				borderColor: 'var(--color-border)',
				borderRadius: 8,
				fontSize: 'var(--font-sm)',
			},
		})}
	</div>
);

// ── Main ──────────────────────────────────────────────────────────────────────
const Checkout = () => {
	const { id } = useParams();
	const navigate = useNavigate();
	const { user, token } = useAuth();

	const [step, setStep] = useState(1); // 1=form, 2=processing, 3=done
	const [eventDetails, setEventDetails] = useState(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState(null);
	const [submitError, setSubmitError] = useState(null);

	const [formData, setFormData] = useState({
		name: user?.name || '',
		email: user?.email || '',
		phone: user?.phone || '',
	});

	// Redirect jika belum login
	useEffect(() => {
		if (!user) navigate('/signin', { state: { from: `/checkout/${id}` } });
	}, [user]);

	// Fetch event
	useEffect(() => {
		if (!user) return;
		(async () => {
			try {
				const res = await api.get(`events/${id}`);
				const result = res.data;
				setEventDetails(result?.data ?? result);
			} catch {
				setError('Gagal memuat detail event.');
			} finally {
				setIsLoading(false);
			}
		})();
	}, [id, user]);

	// Load Midtrans Snap
	useEffect(() => {
		const clientKey = import.meta.env.VITE_MIDTRANS_CLIENT_KEY;
		const snapUrl = import.meta.env.VITE_MIDTRANS_SNAP_URL;
		if (!snapUrl) return;

		const script = document.createElement('script');
		script.src = snapUrl;
		script.setAttribute('data-client-key', clientKey);
		script.async = true;
		document.body.appendChild(script);
		return () => document.body.removeChild(script);
	}, []);

	const handleChange = (e) =>
		setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

	const handleCheckout = async (e) => {
		e.preventDefault();
		setSubmitError(null);
		setStep(2);

		try {
			const res = await api.post('checkout', {
				event_id: id,
				name: formData.name,
				email: formData.email,
				phone: formData.phone,
				quantity: 1,
			});

			const snapToken = res.data.snap_token;
			const ticketCode = res.data.ticket_code;
			const orderId = res.data.order_id;

			if (!orderId) throw new Error('Order ID tidak diterima dari server.');

			if (snapToken) {
				window.snap.pay(snapToken, {
					onSuccess: () => navigate(`/ticket/${ticketCode}`, { replace: true }),
					onPending: () => navigate('/my-tickets', { replace: true }),
					onError: () => {
						setSubmitError('Pembayaran gagal. Silakan coba lagi.');
						setStep(1);
					},
					onClose: () => {
						setSubmitError('Kamu menutup pop-up sebelum selesai.');
						setStep(1);
					},
				});
			} else {
				// Tiket gratis
				navigate(`/ticket/${ticketCode}`, { replace: true });
			}
		} catch (err) {
			setSubmitError(err.response?.data?.message ?? 'Terjadi kesalahan sistem.');
			setStep(1);
		}
	};

	// ── Loading ───────────────────────────────────────────────────────────────
	if (isLoading)
		return (
			<div
				style={{
					display: 'flex',
					justifyContent: 'center',
					alignItems: 'center',
					minHeight: '80vh',
				}}>
				<Spinner animation="border" style={{ color: 'var(--color-primary)' }} />
			</div>
		);

	if (error || !eventDetails)
		return (
			<Container style={{ paddingTop: 56, textAlign: 'center' }}>
				<Alert
					style={{
						background: 'var(--error-bg)',
						border: '1px solid var(--error-border)',
						color: 'var(--error-text)',
						borderRadius: 10,
					}}>
					{error ?? 'Event tidak ditemukan.'}
				</Alert>
				<Button
					onClick={() => navigate(-1)}
					style={{ background: 'var(--color-primary)', border: 'none', borderRadius: 8 }}>
					Kembali
				</Button>
			</Container>
		);

	// ── Kalkulasi harga ───────────────────────────────────────────────────────
	const eventPrice = parseFloat(eventDetails.price) || 0;
	const adminFee = eventPrice > 0 ? 1 : 0;
	const total = eventPrice + adminFee;
	const isFree = total === 0;

	const fmtRp = (n) => (n === 0 ? 'Gratis' : `Rp ${n.toLocaleString('id-ID')}`);

	// ── Render ────────────────────────────────────────────────────────────────
	return (
		<div style={{ background: 'var(--color-bg)', minHeight: '100vh', paddingBottom: 56 }}>
			{/* ── Page header ──────────────────────────────────────────────────── */}
			<div
				style={{
					background: 'var(--color-white)',
					borderBottom: '1px solid var(--color-border)',
					padding: '18px 0',
					marginBottom: 32,
					boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
				}}>
				<Container>
					<div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
						<button
							onClick={() => navigate(-1)}
							style={{
								background: 'none',
								border: 'none',
								padding: 4,
								cursor: 'pointer',
								color: 'var(--color-secondary)',
								display: 'flex',
								alignItems: 'center',
							}}>
							<ArrowLeft size={20} />
						</button>
						<div>
							<h5
								style={{
									margin: 0,
									fontWeight: 800,
									color: 'var(--color-text)',
									fontSize: 'var(--font-lg)',
								}}>
								Checkout
							</h5>
							<p
								style={{
									margin: 0,
									fontSize: 'var(--font-xs)',
									color: 'var(--color-secondary)',
								}}>
								Lengkapi data untuk konfirmasi pesanan
							</p>
						</div>
					</div>
				</Container>
			</div>

			<Container>
				{/* Step indicator */}
				<Steps current={step === 2 ? 2 : 1} />

				{/* Submit error */}
				{submitError && (
					<Alert
						style={{
							background: 'var(--error-bg)',
							border: '1px solid var(--error-border)',
							color: 'var(--error-text)',
							borderRadius: 10,
							fontSize: 'var(--font-sm)',
							marginBottom: 20,
						}}>
						{submitError}
					</Alert>
				)}

				<Form onSubmit={handleCheckout}>
					<Row className="g-4">
						{/* ── LEFT: Form ─────────────────────────────────────────────── */}
						<Col lg={8}>
							{/* Event info card */}
							<div
								style={{
									background: 'var(--bahama-blue-50)',
									border: '1px solid var(--color-border-blue)',
									borderRadius: 12,
									padding: '14px 16px',
									marginBottom: 16,
									display: 'flex',
									gap: 14,
									alignItems: 'flex-start',
								}}>
								<img
									src={
										eventDetails.image ||
										`https://placehold.co/120x80/dff3ff/00699e?text=Event`
									}
									alt={eventDetails.title}
									style={{
										width: 80,
										height: 60,
										borderRadius: 8,
										objectFit: 'cover',
										flexShrink: 0,
									}}
								/>
								<div style={{ minWidth: 0 }}>
									<p
										style={{
											margin: '0 0 4px',
											fontWeight: 700,
											fontSize: 'var(--font-md)',
											color: 'var(--color-text)',
											overflow: 'hidden',
											textOverflow: 'ellipsis',
											whiteSpace: 'nowrap',
										}}>
										{eventDetails.title}
									</p>
									<div
										style={{
											display: 'flex',
											gap: 12,
											fontSize: 'var(--font-xs)',
											color: 'var(--color-secondary)',
											flexWrap: 'wrap',
										}}>
										{eventDetails.start_date && (
											<span
												style={{
													display: 'flex',
													alignItems: 'center',
													gap: 4,
												}}>
												<Calendar size={11} />{' '}
												{new Date(
													eventDetails.start_date,
												).toLocaleDateString('id-ID', {
													day: 'numeric',
													month: 'long',
													year: 'numeric',
												})}
											</span>
										)}
										{eventDetails.location && (
											<span
												style={{
													display: 'flex',
													alignItems: 'center',
													gap: 4,
												}}>
												<MapPin size={11} /> {eventDetails.location}
											</span>
										)}
									</div>
								</div>
							</div>

							{/* Form card */}
							<Card
								style={{
									border: '1px solid var(--color-border)',
									borderRadius: 12,
									boxShadow: '0 2px 8px rgba(0,105,158,0.05)',
									overflow: 'hidden',
								}}>
								<div
									style={{
										padding: '16px 20px',
										borderBottom: '1px solid var(--color-border)',
										background: 'var(--color-white)',
									}}>
									<h6
										style={{
											margin: 0,
											fontWeight: 700,
											color: 'var(--color-text)',
											fontSize: 'var(--font-md)',
										}}>
										Informasi Pemesan
									</h6>
									<p
										style={{
											margin: '2px 0 0',
											fontSize: 'var(--font-xs)',
											color: 'var(--color-secondary)',
										}}>
										Data ini akan digunakan sebagai identitas tiket
									</p>
								</div>
								<Card.Body style={{ padding: '20px' }}>
									<Form.Group style={{ marginBottom: 16 }}>
										<Form.Label
											style={{
												fontSize: 'var(--font-sm)',
												fontWeight: 600,
												color: 'var(--color-text)',
												marginBottom: 6,
											}}>
											Nama Lengkap{' '}
											<span style={{ color: 'var(--error-text)' }}>*</span>
										</Form.Label>
										<FieldIcon icon={User}>
											<Form.Control
												type="text"
												name="name"
												value={formData.name}
												onChange={handleChange}
												required
												disabled={step === 2}
												placeholder="Nama sesuai identitas"
											/>
										</FieldIcon>
									</Form.Group>

									<Row className="g-3">
										<Col md={6}>
											<Form.Group>
												<Form.Label
													style={{
														fontSize: 'var(--font-sm)',
														fontWeight: 600,
														color: 'var(--color-text)',
														marginBottom: 6,
													}}>
													Email{' '}
													<span style={{ color: 'var(--error-text)' }}>
														*
													</span>
												</Form.Label>
												<FieldIcon icon={Mail}>
													<Form.Control
														type="email"
														name="email"
														value={formData.email}
														onChange={handleChange}
														required
														disabled={step === 2}
														placeholder="email@kamu.com"
													/>
												</FieldIcon>
											</Form.Group>
										</Col>
										<Col md={6}>
											<Form.Group>
												<Form.Label
													style={{
														fontSize: 'var(--font-sm)',
														fontWeight: 600,
														color: 'var(--color-text)',
														marginBottom: 6,
													}}>
													Nomor WhatsApp{' '}
													<span style={{ color: 'var(--error-text)' }}>
														*
													</span>
												</Form.Label>
												<FieldIcon icon={Phone}>
													<Form.Control
														type="tel"
														name="phone"
														value={formData.phone}
														onChange={handleChange}
														required
														disabled={step === 2}
														placeholder="0812xxxxxx"
													/>
												</FieldIcon>
											</Form.Group>
										</Col>
									</Row>
								</Card.Body>
							</Card>

							{/* Jaminan */}
							<div
								style={{
									display: 'flex',
									gap: 20,
									marginTop: 16,
									flexWrap: 'wrap',
								}}>
								{[
									{ icon: ShieldCheck, text: 'Transaksi aman & terenkripsi' },
									{ icon: Ticket, text: 'E-tiket dikirim ke email' },
									{ icon: Tag, text: 'Harga sudah termasuk pajak' },
								].map(({ icon: Icon, text }) => (
									<div
										key={text}
										style={{
											display: 'flex',
											alignItems: 'center',
											gap: 6,
											fontSize: 'var(--font-xs)',
											color: 'var(--color-secondary)',
										}}>
										<Icon size={13} color="var(--color-primary)" /> {text}
									</div>
								))}
							</div>
						</Col>

						{/* ── RIGHT: Order summary ────────────────────────────────────── */}
						<Col lg={4}>
							<div style={{ position: 'sticky', top: 90 }}>
								<Card
									style={{
										border: '1px solid var(--color-border)',
										borderRadius: 12,
										boxShadow: '0 2px 8px rgba(0,105,158,0.06)',
										overflow: 'hidden',
									}}>
									<div
										style={{
											padding: '14px 18px',
											borderBottom: '1px solid var(--color-border)',
											background: 'var(--color-white)',
										}}>
										<h6
											style={{
												margin: 0,
												fontWeight: 700,
												color: 'var(--color-text)',
												fontSize: 'var(--font-md)',
											}}>
											Ringkasan Pesanan
										</h6>
									</div>

									<Card.Body style={{ padding: '16px 18px' }}>
										{/* Event title */}
										<div style={{ marginBottom: 14 }}>
											<p
												style={{
													margin: '0 0 2px',
													fontWeight: 700,
													fontSize: 'var(--font-sm)',
													color: 'var(--color-text)',
												}}>
												{eventDetails.title}
											</p>
											{eventDetails.location && (
												<p
													style={{
														margin: 0,
														fontSize: 'var(--font-xs)',
														color: 'var(--color-secondary)',
														display: 'flex',
														alignItems: 'center',
														gap: 4,
													}}>
													<MapPin size={10} /> {eventDetails.location}
												</p>
											)}
										</div>

										<hr
											style={{
												margin: '12px 0',
												borderColor: 'var(--color-border)',
												opacity: 1,
											}}
										/>

										{/* Price breakdown */}
										<div
											style={{
												display: 'flex',
												flexDirection: 'column',
												gap: 8,
												marginBottom: 12,
											}}>
											<div
												style={{
													display: 'flex',
													justifyContent: 'space-between',
													fontSize: 'var(--font-sm)',
													color: 'var(--color-secondary)',
												}}>
												<span>1× Tiket</span>
												<span
													style={{
														fontWeight: 600,
														color: 'var(--color-text)',
													}}>
													{eventPrice === 0
														? 'Gratis'
														: `Rp ${eventPrice.toLocaleString('id-ID')}`}
												</span>
											</div>
											<div
												style={{
													display: 'flex',
													justifyContent: 'space-between',
													fontSize: 'var(--font-sm)',
													color: 'var(--color-secondary)',
												}}>
												<span>Biaya Admin</span>
												<span
													style={{
														fontWeight: 600,
														color: 'var(--color-text)',
													}}>
													{adminFee === 0
														? '–'
														: `Rp ${adminFee.toLocaleString('id-ID')}`}
												</span>
											</div>
										</div>

										<hr
											style={{
												margin: '12px 0',
												borderColor: 'var(--color-border)',
												opacity: 1,
											}}
										/>

										{/* Total */}
										<div
											style={{
												display: 'flex',
												justifyContent: 'space-between',
												alignItems: 'center',
												marginBottom: 20,
											}}>
											<span
												style={{
													fontWeight: 800,
													fontSize: 'var(--font-md)',
													color: 'var(--color-text)',
												}}>
												Total
											</span>
											<span
												style={{
													fontWeight: 800,
													fontSize: 20,
													color: 'var(--color-primary)',
												}}>
												{isFree
													? 'GRATIS'
													: `Rp ${total.toLocaleString('id-ID')}`}
											</span>
										</div>

										{/* CTA Button */}
										<Button
											type="submit"
											disabled={step === 2}
											style={{
												width: '100%',
												background: 'var(--color-primary)',
												border: 'none',
												borderRadius: 10,
												fontWeight: 700,
												fontSize: 'var(--font-md)',
												padding: '12px 0',
												display: 'flex',
												alignItems: 'center',
												justifyContent: 'center',
												gap: 8,
												transition: 'opacity .15s',
											}}>
											{step === 2 ? (
												<>
													<Spinner
														as="span"
														animation="border"
														size="sm"
													/>{' '}
													Memproses…
												</>
											) : (
												<>
													<CreditCard size={16} />{' '}
													{isFree
														? 'Klaim Tiket Gratis'
														: 'Lanjut ke Pembayaran'}
												</>
											)}
										</Button>

										<p
											style={{
												margin: '10px 0 0',
												textAlign: 'center',
												fontSize: 'var(--font-xs)',
												color: 'var(--color-secondary)',
											}}>
											Dengan melanjutkan, kamu menyetujui{' '}
											<span
												style={{
													color: 'var(--color-primary)',
													cursor: 'pointer',
													fontWeight: 600,
												}}>
												syarat & ketentuan
											</span>{' '}
											kami.
										</p>
									</Card.Body>
								</Card>

								{/* Help */}
								<div
									style={{
										marginTop: 12,
										textAlign: 'center',
										fontSize: 'var(--font-xs)',
										color: 'var(--color-secondary)',
									}}>
									Ada masalah?{' '}
									<a
										href="mailto:support@kampusx.id"
										style={{
											color: 'var(--color-primary)',
											fontWeight: 600,
											textDecoration: 'none',
										}}>
										Hubungi support
									</a>
								</div>
							</div>
						</Col>
					</Row>
				</Form>
			</Container>
		</div>
	);
};

export default Checkout;
