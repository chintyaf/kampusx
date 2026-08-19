import React from 'react';
import { Award, Medal } from 'lucide-react';

const TabNavigation = ({ activeTab, setActiveTab, certificatesCount, earnedBadgesCount, totalBadgesCount }) => {
	return (
		<div 
			className="d-inline-flex mb-4" 
			style={{ 
				backgroundColor: '#F1F5F9',
				padding: '4px',
				gap: '4px',
				borderRadius: '12px',
				border: '0'
			}}
		>
			<button
				onClick={() => setActiveTab('certificates')}
				style={{
					background: activeTab === 'certificates' ? '#FFFFFF' : 'transparent',
					border: '0',
					boxShadow: activeTab === 'certificates' ? '0 1px 2px 0 rgba(0, 0, 0, 0.05)' : 'none',
					outline: 'none',
					padding: '6px 12px',
					fontSize: '14px',
					fontWeight: 600,
					color: activeTab === 'certificates' ? '#0F172A' : '#64748B',
					borderRadius: '8px',
					transition: 'all 0.2s ease',
					cursor: 'pointer',
				}}
				className="d-flex align-items-center gap-2"
			>
				<Award size={15} style={{ color: activeTab === 'certificates' ? '#0284C7' : '#94A3B8' }} />
				<span>Sertifikat Event</span>
				<span 
					className="badge rounded-pill border-0"
					style={{
						fontSize: '11px',
						fontWeight: 600,
						backgroundColor: activeTab === 'certificates' ? '#EFF6FF' : '#E2E8F0',
						color: activeTab === 'certificates' ? '#1D4ED8' : '#64748B',
						padding: '4px 8px'
					}}
				>
					{certificatesCount}
				</span>
			</button>
			<button
				onClick={() => setActiveTab('badges')}
				style={{
					background: activeTab === 'badges' ? '#FFFFFF' : 'transparent',
					border: '0',
					boxShadow: activeTab === 'badges' ? '0 1px 2px 0 rgba(0, 0, 0, 0.05)' : 'none',
					outline: 'none',
					padding: '6px 12px',
					fontSize: '14px',
					fontWeight: 600,
					color: activeTab === 'badges' ? '#0F172A' : '#64748B',
					borderRadius: '8px',
					transition: 'all 0.2s ease',
					cursor: 'pointer',
				}}
				className="d-flex align-items-center gap-2"
			>
				<Medal size={15} style={{ color: activeTab === 'badges' ? '#0284C7' : '#94A3B8' }} />
				<span>Badge Modul SRL</span>
				<span 
					className="badge rounded-pill border-0"
					style={{
						fontSize: '11px',
						fontWeight: 600,
						backgroundColor: activeTab === 'badges' ? '#EFF6FF' : 'rgba(226, 232, 240, 0.6)',
						color: activeTab === 'badges' ? '#1D4ED8' : '#64748B',
						padding: '4px 8px'
					}}
				>
					{earnedBadgesCount}/{totalBadgesCount}
				</span>
			</button>
		</div>
	);
};

export default TabNavigation;
