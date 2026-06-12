import React, { useState, useEffect, useRef } from 'react';
import { Card } from 'react-bootstrap';
import { ExternalLink } from 'lucide-react';
import QRCode from 'react-qr-code';

const CertificateCard = ({ cert }) => {
	const [isHovered, setIsHovered] = useState(false);
	const hasTemplate = cert.certificate_template !== null && cert.certificate_template !== undefined;
	const containerRef = useRef(null);
	const [containerWidth, setContainerWidth] = useState(300);

	useEffect(() => {
		if (!hasTemplate || !containerRef.current) return;
		
		const updateWidth = () => {
			if (containerRef.current) {
				setContainerWidth(containerRef.current.clientWidth);
			}
		};
		
		updateWidth();
		
		const resizeObserver = new ResizeObserver(() => {
			updateWidth();
		});
		resizeObserver.observe(containerRef.current);
		
		return () => {
			resizeObserver.disconnect();
		};
	}, [cert, hasTemplate]);

	const scale = containerWidth / (cert.certificate_template?.canvas_width || 1120);

	return (
		<a href={cert.validation_url} target="_blank" rel="noopener noreferrer" className="text-decoration-none">
			<Card 
				className="border-0 shadow-sm overflow-hidden" 
				style={{ 
					borderRadius: '16px', 
					aspectRatio: hasTemplate 
						? `${cert.certificate_template.canvas_width || 1120}/${cert.certificate_template.canvas_height || 792}`
						: '1.414', 
					cursor: 'pointer',
					transition: 'transform 0.2s ease, box-shadow 0.2s ease'
				}}
				onMouseEnter={(e) => {
					setIsHovered(true);
					e.currentTarget.style.transform = 'translateY(-4px)';
					e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.1)';
				}}
				onMouseLeave={(e) => {
					setIsHovered(false);
					e.currentTarget.style.transform = 'translateY(0)';
					e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.05)';
				}}
			>
				<div 
					ref={containerRef}
					style={{
						width: '100%',
						height: '100%',
						position: 'relative',
						overflow: 'hidden',
						backgroundColor: '#fff'
					}}
				>
					{/* Background Image */}
					<img
						src={cert.image}
						alt="Certificate Template"
						className="w-100 h-100"
						style={{ display: 'block', objectFit: 'fill', position: 'absolute', top: 0, left: 0, zIndex: 1 }}
						crossOrigin="anonymous"
					/>

					{/* Overlay Elements */}
					{hasTemplate && cert.certificate_template.elements && cert.certificate_template.elements.map((el) => {
						const xPct = el.position_x;
						const yPct = el.position_y;

						if (el.element_type === 'qr_code') {
							const qrSize = Math.max(10, Math.round((el.font_size || 80) * scale));
							return (
								<div
									key={el.id}
									style={{
										position: 'absolute',
										left: `${xPct}%`,
										top: `${yPct}%`,
										transform: 'translate(-50%,-50%)',
										background: 'white',
										padding: '1.5px',
										borderRadius: '1.5px',
										zIndex: 2,
										width: `${qrSize + 3}px`,
										height: `${qrSize + 3}px`,
										display: 'flex',
										alignItems: 'center',
										justifyContent: 'center',
									}}
								>
									<QRCode
										value={el.custom_value || `${window.location.origin}/certificate/verify/${cert.ticket_code}`}
										size={qrSize}
										style={{ width: '100%', height: '100%' }}
									/>
								</div>
							);
						}

						const content =
							el.element_type === 'nama_peserta'
								? cert.attendee_name
								: el.element_type === 'id_sertifikat'
									? cert.ticket_code
									: el.custom_value || '';
						const currentFontSize = Math.round((el.font_size || 24) * scale);
						return (
							<div
								key={el.id}
								style={{
									position: 'absolute',
									left: `${xPct}%`,
									top: `${yPct}%`,
									transform: `translate(${el.text_align === 'center' ? '-50%' : el.text_align === 'right' ? '-100%' : '0%'}, -50%)`,
									textAlign: el.text_align || 'center',
									fontSize: `${currentFontSize}px`,
									color: el.font_color || '#000',
									fontFamily: el.font_family || 'Georgia, serif',
									fontWeight: el.element_type === 'nama_peserta' ? 'bold' : 'normal',
									pointerEvents: 'none',
									whiteSpace: 'nowrap',
									zIndex: 2,
								}}
							>
								{content}
							</div>
						);
					})}

					{/* Badge Verifikasi */}
					<div 
						className="bg-primary text-white d-flex align-items-center justify-content-center shadow"
						style={{ 
							position: 'absolute', 
							top: 12, 
							right: 12, 
							width: 32, 
							height: 32, 
							borderRadius: '50%',
							zIndex: 10,
							opacity: isHovered ? 1 : 0.85,
							transition: 'opacity 0.2s ease'
						}}
						title="Verifikasi Resmi"
					>
						<ExternalLink size={14} />
					</div>

					{/* Gradient & Text di Bawah (Hover Overlay) */}
					<div 
						style={{
							position: 'absolute',
							bottom: 0, 
							width: '100%',
							background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0) 100%)',
							padding: '30px 16px 12px',
							color: '#fff',
							zIndex: 9,
							opacity: isHovered ? 1 : 0,
							transform: isHovered ? 'translateY(0)' : 'translateY(10px)',
							transition: 'opacity 0.3s ease, transform 0.3s ease'
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
