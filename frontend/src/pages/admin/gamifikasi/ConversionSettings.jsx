import { useState, useEffect } from 'react';
import { Settings, RefreshCw, Info } from 'lucide-react';
import FormHeading from '@/components/dashboard/FormHeading';
import api from '@/api/axios';
import { notify } from '@/utils/notify';

const ConversionSettings = () => {
	const [ratio, setRatio] = useState(10);
	const [loading, setLoading] = useState(true);
	const [submitting, setSubmitting] = useState(false);

	useEffect(() => {
		fetchConversionRatio();
	}, []);

	const fetchConversionRatio = async () => {
		try {
			setLoading(true);
			const response = await api.get('/admin/conversion-rules');
			if (response.data?.success) {
				setRatio(response.data.data.value);
			}
		} catch (error) {
			console.error('Gagal memuat rasio konversi:', error);
			notify('error', 'Gagal', 'Terjadi kesalahan saat memuat konfigurasi rasio konversi.');
		} finally {
			setLoading(false);
		}
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		try {
			setSubmitting(true);
			const response = await api.post('/admin/conversion-rules', {
				ratio: parseInt(ratio)
			});
			if (response.data?.success) {
				notify('success', 'Berhasil', 'Rasio konversi berhasil diperbarui.');
				setRatio(response.data.data.value);
			}
		} catch (error) {
			console.error('Gagal memperbarui rasio konversi:', error);
			notify('error', 'Gagal', error.response?.data?.message || 'Gagal memperbarui konfigurasi.');
		} finally {
			setSubmitting(false);
		}
	};

	return (
		<div className="page-content animate__animated animate__fadeIn">
			<FormHeading
				heading="Aturan Konversi Poin"
				subheading="Konfigurasi perbandingan konversi dari poin lokal event ke poin global platform"
			/>

			<div className="row mt-4">
				<div className="col-12 col-md-8 col-lg-6">
					<div className="card shadow-sm border" style={{ borderRadius: '12px' }}>
						<div className="card-header bg-white border-bottom py-3 d-flex align-items-center gap-2">
							<Settings size={18} className="text-primary" />
							<h5 className="card-title fw-bold mb-0" style={{ fontSize: '15px' }}>Rasio Konversi Poin</h5>
						</div>

						<div className="card-body p-4">
							{loading ? (
								<div className="text-center py-4">
									<div className="spinner-border text-primary" role="status">
										<span className="visually-hidden">Memuat...</span>
									</div>
								</div>
							) : (
								<form onSubmit={handleSubmit}>
									<div className="alert alert-info border-0 d-flex gap-2" style={{ borderRadius: '8px', backgroundColor: 'var(--primary-light)', color: 'var(--primary)' }}>
										<Info size={18} className="flex-shrink-0 mt-1" />
										<div className="small">
											<strong>Bagaimana ini bekerja?</strong>
											<br />
											Rasio ini menentukan berapa banyak <strong>Poin Lokal Event</strong> yang setara dengan <strong>1 Poin Global Platform</strong>. Poin Global inilah yang nantinya dapat ditukarkan peserta dengan Katalog Reward Global.
										</div>
									</div>

									{/* Visual Ratio Indicator */}
									<div className="d-flex align-items-center justify-content-center border rounded-3 p-3 my-4 bg-light">
										<div className="text-center px-4">
											<span className="fs-3 fw-bold text-dark">{ratio}</span>
											<div className="text-muted small">Poin Lokal</div>
										</div>
										
										<div className="px-3">
											<RefreshCw size={20} className="text-muted animate-spin-slow" />
										</div>
										
										<div className="text-center px-4">
											<span className="fs-3 fw-bold text-primary">1</span>
											<div className="text-primary small fw-semibold">Poin Global</div>
										</div>
									</div>

									<div className="mb-4">
										<label className="form-label fw-semibold text-dark small">Nilai Poin Lokal (Rasio)</label>
										<div className="input-group">
											<input
												type="number"
												className="form-control form-control-lg"
												style={{ borderRadius: '8px 0 0 8px', fontSize: '15px' }}
												min="1"
												required
												value={ratio}
												onChange={(e) => setRatio(e.target.value)}
												disabled={submitting}
												placeholder="Masukkan perbandingan poin"
											/>
											<span className="input-group-text px-3" style={{ borderRadius: '0 8px 8px 0', fontSize: '13px', fontWeight: 500 }}>
												Local = 1 Global
											</span>
										</div>
										<small className="text-muted d-block mt-2">
											Rasio minimal adalah 1. Harus berupa bilangan bulat positif.
										</small>
									</div>

									<div className="d-flex justify-content-end gap-2 border-top pt-3 mt-4">
										<button
											type="button"
											className="btn btn-light border px-4"
											style={{ borderRadius: 9, fontSize: 13 }}
											onClick={fetchConversionRatio}
											disabled={submitting}
										>
											Reset
										</button>
										<button
											type="submit"
											className="btn btn-primary px-4 fw-semibold"
											style={{ borderRadius: 9, fontSize: 13 }}
											disabled={submitting}
										>
											{submitting ? 'Menyimpan...' : 'Perbarui Rasio'}
										</button>
									</div>
								</form>
							)}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default ConversionSettings;
