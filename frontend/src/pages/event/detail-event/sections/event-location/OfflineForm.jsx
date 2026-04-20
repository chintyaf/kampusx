import React from 'react';
import { Form, InputGroup, OverlayTrigger, Tooltip } from 'react-bootstrap';
import OptionalBadge from '../../../../../components/form/OptionalBadge';
import OfflineLocationInput from '../../../../../components/event/OfflineLocationInput';
import { HelpCircle } from 'lucide-react';

const OfflineForm = ({ data, onChange, errors }) => {
	// Fungsi ini menangkap data dari Google Maps/Peta
	const handleMapLocationChange = (mapDataObj) => {
		Object.keys(mapDataObj).forEach((key) => {
			onChange({
				target: {
					name: key,
					value: mapDataObj[key],
				},
			});
		});
	};

	return (
		<>
			{/* Ringkasan Lokasi */}
			<Form.Group className="mb-4" controlId="formGridLocation">
				<Form.Label>Ringkasan Lokasi *</Form.Label>
				<InputGroup className="custom-input-group">
					<Form.Control
						type="text"
						name="location_name"
						value={data?.location_name || ''} // Tambahkan || "" untuk mencegah error uncontrolled input
						onChange={onChange}
						placeholder="Contoh: Gedung Rektorat..."
						className="border-end-0"
					/>
					<OverlayTrigger
						placement="top"
						overlay={
							<Tooltip>
								Nama lokasi singkat yang muncul di kartu event halaman publik.
							</Tooltip>
						}>
						<InputGroup.Text
							className="border-start-0 text-muted px-3 bg-white" // Tambahkan bg-white agar selaras dengan input
							style={{
								borderColor: 'var(--bs-border-color)', // Gunakan variable bawaan Bootstrap
								cursor: 'help',
								transition: 'background-color 0.2s',
							}}>
							<HelpCircle
								size={16}
								color="rgb(100, 116, 139)"
								fill="none"
								strokeWidth={2.5}
								style={{ backgroundColor: 'transparent' }}
							/>
						</InputGroup.Text>
					</OverlayTrigger>
				</InputGroup>
			</Form.Group>

			{/* Detail Lokasi Spesifik */}
			<Form.Group controlId="formLocationDetail" className="mb-4">
				<Form.Label className="d-flex align-items-center fw-bold">
					{' '}
					{/* Tambahkan fw-bold agar konsisten dengan label lain */}
					Detail Lokasi Spesifik
					<OptionalBadge />
				</Form.Label>
				<Form.Control
					as="textarea"
					name="location_detail"
					value={data?.location_detail || ''} // Tambahkan || ""
					rows={2}
					onChange={onChange}
					placeholder="Sebutkan detail seperti: Lantai 3A, Ruang R-301, dll."
					style={{ resize: 'none' }}
				/>
				<Form.Text className="text-muted">
					Gunakan ini untuk menjelaskan letak ruangan/lantai secara mendalam.
				</Form.Text>
			</Form.Group>

			{/* Instruksi Akses & Parkir */}
			<Form.Group className="mb-4" controlId="formAccessInstruction">
				<Form.Label className="fw-bold d-flex align-items-center">
					{' '}
					{/* Tambahkan fw-bold d-flex align-items-center */}
					Instruksi Akses & Parkir <OptionalBadge />
				</Form.Label>
				<Form.Control
					as="textarea"
					name="offline_instruction"
					value={data?.offline_instruction || ''} // Tambahkan || ""
					rows={3}
					onChange={onChange}
					placeholder="Contoh: Parkir di Basement P2. Masuk via Lobby Selatan..."
				/>
			</Form.Group>

			{/* Panggil komponen peta */}
			<OfflineLocationInput onLocationChange={handleMapLocationChange} data={data} />
		</>
	);
};

export default OfflineForm;
