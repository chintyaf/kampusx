import { useState, useEffect } from 'react';
import { Form, Badge, Row, Col } from 'react-bootstrap';

const SessionDateForm = ({ formData, totalDays, onSetTotalDays, onChange }) => {
	const TimezoneId = [
		{ value: 'WIB', name: 'WIB - Waktu Indonesia Barat (UTC+7)' },
		{ value: 'WITA', name: 'WITA - Waktu Indonesia Tengah (UTC+8)' },
		{ value: 'WIT', name: 'WIT - Waktu Indonesia Timur (UTC+9)' },
	];

	const todayDate = new Date().toISOString().split('T')[0];
	const [isMultipleDay, setIsMultipleDay] = useState(false);

	useEffect(() => {
		if (formData.startDate && formData.endDate && formData.startDate !== formData.endDate) {
			setIsMultipleDay(true);
		} else {
			setIsMultipleDay(false);
		}
	}, [formData.startDate, formData.endDate]);

	const calculateAndSetDays = (start, end) => {
		if (!start || !end) {
			onSetTotalDays(1);
			return;
		}
		const diffDays = Math.ceil((new Date(end) - new Date(start)) / 86400000) + 1;
		onSetTotalDays(diffDays > 0 ? diffDays : 1);
	};

	const handleDateChange = (e) => {
		const { name, value } = e.target;
		onChange(e);

		if (name === 'startDate') {
			if (!isMultipleDay) {
				onChange({ target: { name: 'endDate', value: value } });
				calculateAndSetDays(value, value);
			} else {
				calculateAndSetDays(value, formData.endDate);
			}
		} else if (name === 'endDate') {
			calculateAndSetDays(formData.startDate, value);
		}
	};

	const handleSwitchChange = (e) => {
		const checked = e.target.checked;
		setIsMultipleDay(checked);

		if (checked) {
			const nextDay = new Date(formData.startDate || new Date());
			nextDay.setDate(nextDay.getDate() + 1);
			const formattedNextDay = nextDay.toISOString().split('T')[0];

			onChange({
				target: { name: 'endDate', value: formattedNextDay },
			});
			onSetTotalDays(2);
		} else {
			onChange({
				target: { name: 'endDate', value: formData.startDate || '' },
			});
			onSetTotalDays(1);
		}
	};

	return (
		<>
			{/* Zona Waktu */}
			<Form.Group as={Col} controlId="formGridTimezone" className="mb-4">
				<Form.Label className="fw-bold">Zona Waktu</Form.Label>
				<Form.Select
					name="timezone"
					value={formData.timezone || ''}
					onChange={onChange}
					// Tambahan UI: Border tegas & style seragam
					className="border-2 border-secondary shadow-none"
				>
					<option value="">Pilih Zona Waktu</option>
					{TimezoneId.map((item) => (
						<option key={item.value} value={item.value}>
							{item.name}
						</option>
					))}
				</Form.Select>
				<Form.Text className="text-muted small">
					Penting jika peserta berasal dari berbagai zona waktu.
				</Form.Text>
			</Form.Group>

			{/* Bagian Switch & Info */}
			<Row className="g-3 align-items-end mb-3">
				{/* Kolom Tanggal Mulai */}
				<Col md={isMultipleDay ? 5 : 10} xs={12}>
					<Form.Group>
						<Form.Label className="small fw-bold text-dark text-uppercase mb-2">
							{isMultipleDay ? 'Tanggal Mulai' : 'Tanggal Pelaksanaan'}
						</Form.Label>
						<Form.Control
							type="date"
							name="startDate"
							min={todayDate}
							value={formData.startDate || ''}
							onChange={handleDateChange}
							// PERUBAHAN UI: Hapus size="sm", beri padding, border tegas, hilangkan shadow
							className="border-2 border-dark shadow-none py-2 rounded-2 bg-light"
							style={{ cursor: 'pointer' }}
						/>
					</Form.Group>
				</Col>

				{/* Kolom Tanggal Berakhir */}
				{isMultipleDay && (
					<Col md={5} xs={12}>
						<Form.Group>
							<Form.Label className="small fw-bold text-dark text-uppercase mb-2">
								Tanggal Berakhir
							</Form.Label>
							<Form.Control
								type="date"
								name="endDate"
								min={formData.startDate}
								value={formData.endDate || ''}
								onChange={handleDateChange}
								// PERUBAHAN UI: Sama dengan startDate
								className="border-2 border-dark shadow-none py-2 rounded-2 bg-light"
								style={{ cursor: 'pointer' }}
							/>
						</Form.Group>
					</Col>
				)}

				{/* Kolom Switch Multi-hari */}
				<Col md={2} xs={5}>
					<div className="d-flex align-items-center mb-1 h-100 pb-2">
						<Form.Check
							type="switch"
							id="isMultipleDay"
							label={<span className="small fw-bold text-dark ms-2">Multi-hari</span>}
							checked={isMultipleDay}
							onChange={handleSwitchChange}
							className="mb-0"
						/>
					</div>
				</Col>
			</Row>
		</>
	);
};

export default SessionDateForm;
