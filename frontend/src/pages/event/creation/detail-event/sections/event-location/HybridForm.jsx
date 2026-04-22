import React, { useState } from 'react';
import { Video, MapPin } from 'lucide-react';
import { Form, Row, Col, ButtonGroup, ToggleButton } from 'react-bootstrap';

import OnlineForm from './OnlineForm';
import OfflineForm from './OfflineForm';
import QuotaCard from './QuotaCard';

const HybridForm = ({ data, onChange, errors }) => {
	// Tab internal untuk memilih mana yang mau diedit (Online/Offline)
	const [currentType, setCurrentType] = useState('online');

	const typeOptions = [
		{
			name: 'Online Detail',
			value: 'online',
			icon: <Video size={18} className="me-2" />,
		},
		{
			name: 'Offline Detail',
			value: 'offline',
			icon: <MapPin size={18} className="me-2" />,
		},
	];

	return (
		<div className="py-2">
			{/* Tipe Kehadiran Switcher */}
			<div
				className="mb-4 text-center"
				style={{
					borderRadius: '10px',
					overflow: 'hidden',
					border: '1px #dee2e6 solid',
				}}>
				<ButtonGroup className="w-100">
					{typeOptions.map((option, idx) => (
						<ToggleButton
							key={idx}
							id={`hybrid-radio-${idx}`}
							type="radio"
							variant={currentType === option.value ? 'primary' : 'outline-primary'}
							name="hybrid-tab"
							value={option.value}
							checked={currentType === option.value}
							onChange={(e) => setCurrentType(e.currentTarget.value)}
							className="py-2 d-flex align-items-center justify-content-center border-0">
							{option.icon}
							{option.name}
						</ToggleButton>
					))}
				</ButtonGroup>
			</div>

			{/* Form Konten Berdasarkan Tab yang Dipilih */}
			<div className="p-3 border rounded bg-light mb-4">
				{currentType === 'online' ? (
					<OnlineForm data={data} onChange={onChange} errors={errors} isHybrid />
				) : (
					<OfflineForm data={data} onChange={onChange} errors={errors} isHybrid />
				)}
			</div>

			<hr className="my-4" />



			{/* Visualisasi Kuota */}
			{/* <QuotaCard
                onlineQuota={data.online_quota}
                offlineQuota={data.offline_quota}
            /> */}
		</div>
	);
};

export default HybridForm;
