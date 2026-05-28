import React, { useState } from 'react';
import { Video, MapPin } from 'lucide-react';

import OnlineForm from './OnlineForm';
import OfflineForm from './OfflineForm';
import QuotaCard from './QuotaCard';

const HybridForm = ({ data, onChange, errors, touched = {}, handleBlur = () => {} }) => {
	// Tab internal untuk memilih mana yang mau diedit (Online/Offline)
	const [currentType, setCurrentType] = useState('online');

	const typeOptions = [
		{
			name: 'Online',
			value: 'online',
			icon: <Video size={18} className="me-2" />,
		},
		{
			name: 'Offline',
			value: 'offline',
			icon: <MapPin size={18} className="me-2" />,
		},
	];

	return (
		<div className="py-2">
			{/* Tipe Kehadiran Switcher */}
			<div
				className="mb-4 text-center d-flex"
				style={{
					borderRadius: '10px',
					overflow: 'hidden',
					border: '1px solid #dee2e6',
				}}
			>
				{typeOptions.map((option, idx) => {
					const isActive = currentType === option.value;
					return (
						<button
							key={idx}
							type="button"
							onClick={() => setCurrentType(option.value)}
							className="py-2 w-50 d-flex align-items-center justify-content-center border-0"
							style={{
								backgroundColor: isActive ? 'var(--color-primary)' : '#ffffff',
								color: isActive ? '#ffffff' : 'var(--color-primary)',
								fontWeight: '500',
								fontSize: '0.95rem',
								transition: 'all 0.2s ease-in-out',
								cursor: 'pointer',
								outline: 'none',
							}}
						>
							{option.icon}
							{option.name}
						</button>
					);
				})}
			</div>

			{/* Form Konten Berdasarkan Tab yang Dipilih */}
			<div className="">
				{currentType === 'online' ? (
					<OnlineForm data={data} onChange={onChange} errors={errors} touched={touched} handleBlur={handleBlur} isHybrid />
				) : (
					<OfflineForm data={data} onChange={onChange} errors={errors} touched={touched} handleBlur={handleBlur} isHybrid />
				)}
			</div>

			{/* Visualisasi Kuota */}
			{/* <QuotaCard
                onlineQuota={data.online_quota}
                offlineQuota={data.offline_quota}
            /> */}
		</div>
	);
};

export default HybridForm;
