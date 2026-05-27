import React from 'react';
import { Card } from 'react-bootstrap';
import { ExternalLink } from 'lucide-react';

const CertificateCard = ({ cert }) => {
    return (
        <a href={cert.validation_url} target="_blank" rel="noopener noreferrer" className="text-decoration-none">
            <Card 
                className="border-0 shadow-sm overflow-hidden" 
                style={{ 
                    borderRadius: '16px', 
                    aspectRatio: '1/1', 
                    cursor: 'pointer',
                    transition: 'transform 0.2s ease, box-shadow 0.2s ease'
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.1)';
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.05)';
                }}
            >
                <div 
                    style={{
                        backgroundImage: `url(${cert.image})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        width: '100%',
                        height: '100%',
                        position: 'relative'
                    }}
                >
                    {/* Badge Verifikasi */}
                    <div 
                        className="bg-primary text-white d-flex align-items-center justify-content-center shadow"
                        style={{ position: 'absolute', top: 12, right: 12, width: 32, height: 32, borderRadius: '50%' }}
                        title="Verifikasi Resmi"
                    >
                        <ExternalLink size={14} />
                    </div>

                    {/* Gradient & Text di Bawah */}
                    <div 
                        style={{
                            position: 'absolute',
                            bottom: 0, width: '100%',
                            background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0) 100%)',
                            padding: '30px 16px 12px',
                            color: '#fff'
                        }}
                    >
                        <div className="text-uppercase fw-bold" style={{ fontSize: '10px', opacity: 0.8, letterSpacing: '0.5px' }}>
                            {cert.id}
                        </div>
                        <div className="fw-bold text-truncate" style={{ fontSize: '13px', lineHeight: 1.2 }}>
                            {cert.eventName}
                        </div>
                    </div>
                </div>
            </Card>
        </a>
    );
};

export default CertificateCard;
