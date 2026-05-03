import React, { useState, useEffect } from 'react';
import { Form, Button, Spinner } from 'react-bootstrap';
import api from '@/api/axios';

const DaySelectionGroup = ({ eventId, selectedDays, onChange }) => {
	const [availableDays, setAvailableDays] = useState([]);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		const fetchDaysSummary = async () => {
			try {
				const response = await api.get(`/event-dashboard/${eventId}/days-summary`);
				setAvailableDays(response.data.data);
				console.log('Data hari:', response.data.data);
			} catch (error) {
				console.error('Gagal mengambil data hari', error);
			} finally {
				setIsLoading(false);
			}
		};

		if (eventId) {
			fetchDaysSummary();
		}
	}, [eventId]);

	const handleDayToggle = (dayNumber) => {
		const newSelectedDays = selectedDays.includes(dayNumber)
			? selectedDays.filter((day_number) => day_number !== dayNumber)
			: [...selectedDays, dayNumber];

		onChange(newSelectedDays); // Lempar state terbaru ke parent
	};

	const handleSelectAllDays = () => {
		const allActiveDayIds = availableDays.filter((d) => d.isAvailable).map((d) => d.day_number);

		// Jika sudah terpilih semua, klik lagi untuk deselect semua (opsional, UX yang lebih baik)
		if (selectedDays.length === allActiveDayIds.length) {
			onChange([]);
		} else {
			onChange(allActiveDayIds);
		}
	};

	if (isLoading) {
		return (
			<div className="p-3 text-center text-muted small border rounded-3 mb-3">
				<Spinner size="sm" className="me-2" /> Memuat jadwal hari...
			</div>
		);
	}

	return (
		<Form.Group className="mb-3">
			<div className="d-flex justify-content-between align-items-center mb-2">
				<Form.Label className="fw-bold m-0" style={{ color: '#0f172a' }}>
					Berlaku Pada Hari
				</Form.Label>
				<Button
					variant="link"
					className="p-0 text-decoration-none"
					style={{ fontSize: '14px', color: '#2563eb' }}
					onClick={handleSelectAllDays}>
					Pilih semua
				</Button>
			</div>

			<div className="border rounded-3 overflow-hidden" style={{ borderColor: '#cbd5e1' }}>
				{availableDays.map((day, index) => {
					const isSelected = selectedDays.includes(day.day_number);

					return (
						<div
							key={day.day_number}
							className={`d-flex align-items-center p-3 transition-all ${
								index !== availableDays.length - 1 ? 'border-bottom' : ''
							}`}
							style={{
								cursor: 'pointer',
								backgroundColor: isSelected ? '#f8fafc' : '#ffffff',
								borderLeft: isSelected
									? '4px solid #2563eb'
									: '4px solid transparent',
							}}
							onClick={() => handleDayToggle(day.day_number)}>
							<div className="me-3">
								<Form.Check
									type="checkbox"
									checked={isSelected}
									readOnly
									style={{ cursor: 'pointer', pointerEvents: 'none' }}
								/>
							</div>

							<div className="flex-grow-1">
								<div style={{ fontSize: '15px', color: '#1e293b' }}>
									{day.label}
								</div>
								<div className="text-muted" style={{ fontSize: '14px' }}>
									{day.date}
								</div>
							</div>

							{!day.isAvailable && (
								<span
									className="badge border fw-normal px-2 py-1"
									style={{
										fontSize: '12px',
										backgroundColor: '#f1f5f9',
										color: '#64748b',
										borderColor: '#e2e8f0',
									}}>
									Belum aktif
								</span>
							)}
						</div>
					);
				})}
			</div>

			<Form.Text className="d-block mt-2" style={{ fontSize: '13px', color: '#9a3412' }}>
				Pilih minimal satu hari agar pos ini muncul di dropdown panitia
			</Form.Text>
		</Form.Group>
	);
};

export default DaySelectionGroup;
