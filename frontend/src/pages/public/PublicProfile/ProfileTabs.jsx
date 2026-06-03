import React from 'react';
import { Nav } from 'react-bootstrap';
import { Award, Calendar as CalendarIcon } from 'lucide-react';

const ProfileTabs = ({ activeTab, onTabChange }) => {
	return (
		<Nav className="justify-content-center border-bottom mb-4" style={{ gap: '2rem' }}>
			<Nav.Item>
				<Nav.Link 
					onClick={() => onTabChange('certificates')}
					className={`px-0 py-3 fw-bold text-uppercase d-flex align-items-center ${activeTab === 'certificates' ? 'active' : ''}`}
					style={{ 
						fontSize: '13px', 
						color: activeTab === 'certificates' ? 'var(--color-primary)' : 'var(--color-secondary)',
						borderBottom: activeTab === 'certificates' ? '3px solid var(--color-primary)' : '3px solid transparent',
						background: 'transparent',
						cursor: 'pointer'
					}}
				>
					<Award size={16} className="me-2" /> Sertifikat
				</Nav.Link>
			</Nav.Item>
			{/* <Nav.Item>
				<Nav.Link 
					onClick={() => onTabChange('history')}
					className={`px-0 py-3 fw-bold text-uppercase d-flex align-items-center ${activeTab === 'history' ? 'active' : ''}`}
					style={{ 
						fontSize: '13px', 
						color: activeTab === 'history' ? 'var(--color-primary)' : 'var(--color-secondary)',
						borderBottom: activeTab === 'history' ? '3px solid var(--color-primary)' : '3px solid transparent',
						background: 'transparent',
						cursor: 'pointer'
					}}
				>
					<CalendarIcon size={16} className="me-2" /> Histori Event
				</Nav.Link>
			</Nav.Item> */}
		</Nav>
	);
};

export default ProfileTabs;
