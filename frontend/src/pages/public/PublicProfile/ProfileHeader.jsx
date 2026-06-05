import React, { useState, useEffect } from 'react';
import { Card, Badge, Button, Spinner } from 'react-bootstrap';
import { Share2, Edit, Check, GraduationCap, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../../api/axios';

const ProfileHeader = ({ profile = {}, interests = [], isOwnProfile = false }) => {
	const navigate = useNavigate();
	const [copied, setCopied] = useState(false);
	const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
	const [isGeneratingCV, setIsGeneratingCV] = useState(false);

	useEffect(() => {
		const handleResize = () => setIsMobile(window.innerWidth < 768);
		window.addEventListener('resize', handleResize);
		return () => window.removeEventListener('resize', handleResize);
	}, []);

	const handleShare = () => {
		navigator.clipboard.writeText(window.location.href);
		setCopied(true);
		setTimeout(() => setCopied(false), 2000);
	};

	const handleGenerateCV = async () => {
		if (!profile.id) return;
		
		setIsGeneratingCV(true);
		try {
			const response = await api.get(`/profile/${profile.id}/generate-cv`, {
				responseType: 'blob',
			});

			// Create a Blob from the response
			const blob = new Blob([response.data], { type: 'application/pdf' });
			const downloadUrl = window.URL.createObjectURL(blob);
			
			// Create temporary anchor to trigger download
			const link = document.createElement('a');
			link.href = downloadUrl;
			
			const cleanName = (profile.name || 'user').toLowerCase().replace(/\s+/g, '_');
			link.setAttribute('download', `cv_${cleanName}.pdf`);
			
			document.body.appendChild(link);
			link.click();
			
			// Cleanup
			document.body.removeChild(link);
			window.URL.revokeObjectURL(downloadUrl);
		} catch (error) {
			console.error('Error generating Transkrip PDF:', error);
			alert('Gagal mendownload Transkrip. Silakan coba kembali.');
		} finally {
			setIsGeneratingCV(false);
		}
	};

	const buttonStyle = {
    fontSize: '12px',
    fontWeight: 600,
    background: 'rgba(255,255,255,0.9)',
    color: '#1e293b',
    border: 'none',
    borderRadius: 8,
    padding: '6px 14px',
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    cursor: 'pointer',
    // backdropFilter: 'blur(4px)',
};

	return (
    <Card className="border-0 bg-white mb-4" style={{ borderRadius: 16, overflow: 'hidden' }}>
        
        {/* Cover — gradient lebih hidup, bisa diganti foto nanti */}
        <div style={{ 
            height: '140px', 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            position: 'relative'
        }}>
            {/* Tombol di dalam cover, pojok kanan atas */}
            <div style={{ position: 'absolute', top: 12, right: 16, display: 'flex', gap: 8 }}>
                <button onClick={handleShare} style={buttonStyle}>
                    {copied ? <Check size={14} /> : <Share2 size={14} />}
                    <span>{copied ? 'Tersalin!' : 'Bagikan'}</span>
                </button>
                {isOwnProfile && (
                    <>
                        <button 
                            onClick={handleGenerateCV} 
                            disabled={isGeneratingCV} 
                            style={{ ...buttonStyle, opacity: isGeneratingCV ? 0.7 : 1 }}
                        >
                            {isGeneratingCV ? (
                                <Spinner animation="border" size="sm" style={{ width: '12px', height: '12px', borderWidth: '0.15em' }} />
                            ) : (
                                <FileText size={14} />
                            )}
                            <span>{isGeneratingCV ? 'Memproses...' : 'Generate Transkrip'}</span>
                        </button>
                        <button onClick={() => navigate('/settings')} style={buttonStyle}>
                            <Edit size={14} />
                            <span>Edit Profil</span>
                        </button>
                    </>
                )}
            </div>
        </div>

        <Card.Body className="pt-0 px-4 pb-4">
            <div className="d-flex flex-column align-items-center text-center">

                {/* Avatar lebih besar */}
                <div style={{ marginTop: '-56px', marginBottom: '12px', position: 'relative', zIndex: 5 }}>
                    <img
                        src={profile.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name || 'User')}&background=random&color=fff&size=200`}
                        alt={profile.name}
                        className="rounded-circle"
                        style={{ 
                            width: '112px', 
                            height: '112px', 
                            objectFit: 'cover', 
                            border: '4px solid #fff',
                            // boxShadow: '0 2px 12px rgba(0,0,0,0.1)'
                        }}
                        onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=User&background=random&color=fff&size=200`; }}
                    />
                </div>

                {/* Nama & username */}
                <h3 className="fw-bold mb-1" style={{ color: 'var(--color-text)', fontSize: '1.35rem' }}>
                    {profile.name}
                </h3>
                <div className="mb-1" style={{ fontSize: '13px', color: '#94a3b8', fontWeight: 500 }}>
                    @{profile.email?.split('@')[0] || 'user'}
                </div>

                {/* Institusi */}
                <div className="d-flex align-items-center justify-content-center mb-3 mt-1" 
                    style={{ fontSize: '12px', gap: '5px', color: '#64748b' }}>
                    <GraduationCap size={14} />
                    <span>{profile.institution || 'KampusX Member'}</span>
                </div>

                {/* Interest badges — lebih soft */}
                {interests.length > 0 && (
                    <div className="d-flex flex-wrap justify-content-center gap-2" style={{ maxWidth: '480px' }}>
                        {interests.map((interest) => (
                            <span
                                key={interest.id}
                                style={{
                                    background: '#f1f5f9',
                                    color: '#475569',
                                    border: '1px solid #e2e8f0',
                                    borderRadius: '999px',
                                    fontSize: '11px',
                                    fontWeight: 600,
                                    padding: '4px 12px',
                                }}
                            >
                                #{interest.name}
                            </span>
                        ))}
                    </div>
                )}
            </div>
        </Card.Body>
    </Card>
);
};

export default ProfileHeader;
