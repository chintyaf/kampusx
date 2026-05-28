import React from 'react';
import { Form, InputGroup, OverlayTrigger, Tooltip } from 'react-bootstrap';
import OfflineLocationInput from '../../../../../../components/event/OfflineLocationInput';
import { HelpCircle } from 'lucide-react';

const OfflineForm = ({ data, onChange, errors, touched = {}, handleBlur = () => {} }) => {
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
				<Form.Label className="required">Ringkasan Lokasi</Form.Label>
				<Form.Control
					type="text"
					name="location_name"
					value={data?.location_name || ''} // Tambahkan || "" untuk mencegah error uncontrolled input
					onChange={onChange}
					onBlur={() => handleBlur('location_name')}
					placeholder="Contoh: Gedung Rektorat..."
					isInvalid={touched.location_name && (!data?.location_name || data.location_name.trim() === '')}
				/>
				<Form.Control.Feedback type="invalid">
					Ringkasan lokasi wajib diisi.
				</Form.Control.Feedback>
				<Form.Text className="text-muted">
					Nama lokasi singkat yang muncul di kartu event halaman publik.
				</Form.Text>
			</Form.Group>

			{/* Detail Lokasi Spesifik */}
			<Form.Group controlId="formLocationDetail" className="mb-4">
				<div className="d-flex justify-content-between align-items-center mb-2">
					<label className="fw-bold mb-0">Detail Lokasi Spesifik</label>
					<span className="text-muted" style={{ fontSize: '13px' }}>
						Opsional
					</span>
				</div>
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
				<div className="d-flex justify-content-between align-items-center mb-2">
					<label className="fw-bold mb-0">Instruksi Akses & Parkir</label>
					<span className="text-muted" style={{ fontSize: '13px' }}>
						Opsional
					</span>
				</div>
				<Form.Control
					as="textarea"
					name="offline_instruction"
					value={data?.offline_instruction || ''} // Tambahkan || ""
					rows={3}
					maxLength={500}
					onChange={onChange}
					placeholder="Contoh: Parkir di Basement P2. Masuk via Lobby Selatan..."
				/>
				<div className="d-flex justify-content-end mt-1">
					<Form.Text className="text-muted small">
						{data?.offline_instruction?.length || 0} / 500 karakter
					</Form.Text>
				</div>
			</Form.Group>

			{/* Panggil komponen peta */}
			<OfflineLocationInput onLocationChange={handleMapLocationChange} data={data} />
		</>
	);
};

export default OfflineForm;
