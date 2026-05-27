import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Check, ShieldCheck, Award, AlertTriangle, ArrowRight, ExternalLink, RefreshCw } from 'lucide-react';
import api from '@/api/axios';
import './CertificateVerificationPage.css';

const CertificateVerificationPage = () => {
    const { ticketCode } = useParams();
    const [loading, setLoading] = useState(true);
    const [verificationData, setVerificationData] = useState(null);
    const [error, setError] = useState(null);

    const verifyCertificate = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await api.get(`/certificate/verify/${ticketCode}`);
            if (response.data && response.data.success) {
                setVerificationData(response.data.data);
            } else {
                setError(response.data.message || 'Sertifikat tidak dapat diverifikasi.');
            }
        } catch (err) {
            console.error('Error verifying certificate:', err);
            setError(err.response?.data?.message || 'Sertifikat tidak valid atau tidak ditemukan di sistem.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (ticketCode) {
            verifyCertificate();
        } else {
            setLoading(false);
            setError('Kode sertifikat tidak disediakan.');
        }
    }, [ticketCode]);

    if (loading) {
        return (
            <div className="cert-verify-container">
                <div className="cert-verify-card text-center">
                    <div className="mb-4">
                        <RefreshCw size={48} className="text-primary animate-spin" style={{ animation: 'spin 1.5s linear infinite' }} />
                    </div>
                    <h4 className="fw-bold mb-2">Memproses Verifikasi...</h4>
                    <p className="text-muted small">Sedang mencocokkan kode sertifikat dengan database integritas KampusX.</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="cert-verify-container">
                <div className="cert-verify-card">
                    <div className="error-icon-wrapper">
                        <div className="error-icon-inner">
                            <AlertTriangle size={36} />
                        </div>
                    </div>
                    
                    <h3 className="cert-verify-title error-title">Sertifikat Tidak Valid</h3>
                    <p className="cert-verify-subtitle">Integritas sertifikat tidak terverifikasi</p>

                    <div className="alert alert-danger border-0 rounded-4 p-4 text-start mb-4 fs-6" style={{ backgroundColor: '#fef2f2', color: '#991b1b' }}>
                        <div className="fw-bold mb-1">Penyebab Kemungkinan:</div>
                        <ul className="m-0 ps-3 small text-muted" style={{ lineHeight: '1.6' }}>
                            <li>Kode sertifikat <strong className="fw-mono text-dark">{ticketCode}</strong> salah diketik.</li>
                            <li>Sertifikat ini belum diaktifkan atau diterbitkan oleh penyelenggara.</li>
                            <li>Tautan verifikasi palsu / telah dimodifikasi.</li>
                        </ul>
                    </div>

                    <div className="cert-verify-actions">
                        <Link to="/" className="btn btn-premium-action btn-premium-error text-decoration-none">
                            Kembali ke Beranda
                        </Link>
                        <button onClick={verifyCertificate} className="btn btn-premium-action btn-premium-secondary">
                            Coba Verifikasi Ulang
                        </button>
                    </div>

                    <div className="cert-verify-footer">
                        <ShieldCheck size={14} /> Sistem Keamanan Sertifikat KampusX
                    </div>
                </div>
            </div>
        );
    }

    // Success State
    return (
        <div className="cert-verify-container">
            <div className="cert-verify-card">
                <div className="success-icon-wrapper">
                    <div className="success-icon-inner">
                        <Check size={36} strokeWidth={3} />
                    </div>
                </div>

                <h3 className="cert-verify-title">Sertifikat Ditemukan</h3>
                <p className="cert-verify-subtitle">Keaslian & integritas sertifikat terverifikasi 100%</p>

                <div className="cert-info-list">
                    <div className="cert-info-row">
                        <span className="cert-info-label">No. Sertifikat</span>
                        <span className="cert-info-colon">:</span>
                        <span className="cert-info-value fw-mono text-primary fw-bold">{verificationData.certificate_number}</span>
                    </div>

                    <div className="cert-info-row">
                        <span className="cert-info-label">Kegiatan</span>
                        <span className="cert-info-colon">:</span>
                        <span className="cert-info-value highlight-event">{verificationData.event_title}</span>
                    </div>

                    <div className="cert-info-row">
                        <span className="cert-info-label">Nama Peserta</span>
                        <span className="cert-info-colon">:</span>
                        <span className="cert-info-value highlight-name">{verificationData.attendee_name}</span>
                    </div>

                    <div className="cert-info-row">
                        <span className="cert-info-label">Sebagai</span>
                        <span className="cert-info-colon">:</span>
                        <span className="cert-info-value">
                            <span className="cert-badge-valid">
                                {verificationData.status === 'used' || verificationData.status === 'active' ? 'Peserta Resmi' : 'Partisipan'}
                            </span>
                        </span>
                    </div>

                    <div className="cert-info-row">
                        <span className="cert-info-label">Tanggal Acara</span>
                        <span className="cert-info-colon">:</span>
                        <span className="cert-info-value">{verificationData.event_date || 'TBA'}</span>
                    </div>

                    <div className="cert-info-row">
                        <span className="cert-info-label">Penyelenggara</span>
                        <span className="cert-info-colon">:</span>
                        <span className="cert-info-value">{verificationData.organizer_name}</span>
                    </div>
                </div>

                <div className="cert-verify-actions">
                    {/* View E-Certificate Layout */}
                    <Link to={`/test-chin/sertifikat/${verificationData.certificate_number}`} className="btn btn-premium-action btn-premium-primary text-decoration-none">
                        Lihat E-Sertifikat <ArrowRight size={16} />
                    </Link>
                    <Link to="/" className="btn btn-premium-action btn-premium-secondary text-decoration-none">
                        Jelajahi Event Lainnya
                    </Link>
                </div>

                <div className="cert-verify-footer">
                    <ShieldCheck size={14} className="text-success" /> Sertifikat Elektronik Terverifikasi KampusX
                </div>
            </div>
            
            {/* Spin Keyframe Injection */}
            <style>{`
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
};

export default CertificateVerificationPage;
