import { useState, useCallback } from 'react';
import { Form, Modal, Button } from 'react-bootstrap';
import Cropper from 'react-easy-crop';
import { Image } from 'lucide-react';
import getCroppedImg from '@/utils/cropImage';

// Pastikan formData dan setFormData diterima sebagai props
const UploadImage = ({ formData, setFormData }) => {
	// ==========================================
	// STATE UNTUK CROP GAMBAR
	// ==========================================
	const [showCropModal, setShowCropModal] = useState(false);
	const [imageSrc, setImageSrc] = useState(null);
	const [crop, setCrop] = useState({ x: 0, y: 0 });
	const [zoom, setZoom] = useState(1);
	const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

	// ==========================================
	// HANDLER CROP & UPLOAD GAMBAR
	// ==========================================
	const handleFileChange = (e) => {
		const file = e.target.files[0];
		if (!file) return;

		if (!file.type.startsWith('image/')) {
			e.target.value = '';
			return;
		}

		const reader = new FileReader();
		reader.readAsDataURL(file);
		reader.onload = () => {
			setImageSrc(reader.result);
			setShowCropModal(true); // Buka modal crop
		};

		e.target.value = ''; // Reset input
	};

	const handleRemoveImage = (e) => {
		e.preventDefault();
		setFormData((prev) => ({ ...prev, banner: null }));
	};

	const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
		setCroppedAreaPixels(croppedAreaPixels);
	}, []);

	const handleSaveCrop = async () => {
		try {
			const croppedFile = await getCroppedImg(imageSrc, croppedAreaPixels);
			setFormData((prev) => ({ ...prev, banner: croppedFile }));
			setShowCropModal(false);
		} catch (e) {
			console.error('Error saat cropping:', e);
		}
	};

	// ==========================================
	// RENDER COMPONENT
	// ==========================================
	return (
		<>
			{/* INJEKSI CSS LANGSUNG DI SINI */}
			<style>
				{`
                    .custom-banner-container .custom-banner-overlay {
                        opacity: 0;
                        transition: opacity 0.3s ease-in-out;
                        z-index: 10;
                        background-color: rgba(0, 0, 0, 0.5);
                    }
                    .custom-banner-container:hover .custom-banner-overlay {
                        opacity: 1;
                    }
                `}
			</style>

			<Form.Group className="mb-3">
				<div className="d-flex justify-content-between align-items-center mb-1">
					<Form.Label className="mb-2">Banner Event</Form.Label>
					<span className="text-muted text-sm" style={{ fontSize: '12px' }}>
						1280x720px · Maks. 2MB
					</span>
				</div>

				<div className="position-relative d-flex justify-content-center">
					<input
						type="file"
						id="bannerUpload"
						className="d-none"
						accept="image/*"
						onChange={handleFileChange}
					/>

					<div
						className="border position-relative"
						style={{
							width: '400px',
							aspectRatio: '3/2',
							overflow: 'hidden',
							borderRadius: '12px',
							backgroundColor: '#f8f9fa',
							border: '2px dashed #d1d5db',
						}}
					>
						{formData?.banner ? (
							<div className="custom-banner-container w-100 h-100 position-relative">
								<img
									src={
										formData.banner instanceof File
											? URL.createObjectURL(formData.banner) ||
												formData.banner.preview
											: formData.banner
									}
									alt="Banner Preview"
									style={{
										width: '100%',
										height: '100%',
										objectFit: 'cover',
									}}
								/>

								{/* OVERLAY EDIT & HAPUS */}
								<div className="custom-banner-overlay position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center gap-3">
									<label
										htmlFor="bannerUpload"
										className="m-0 d-flex align-items-center justify-content-center shadow-sm"
										style={{
											backgroundColor: 'white',
											color: '#1f2937',
											padding: '8px 24px',
											borderRadius: '8px',
											fontWeight: '500',
											fontSize: '14px',
											cursor: 'pointer',
										}}
									>
										Ganti
									</label>

									<button
										type="button"
										onClick={handleRemoveImage}
										style={{
											backgroundColor: 'rgba(255, 255, 255, 0.2)',
											backdropFilter: 'blur(4px)',
											WebkitBackdropFilter: 'blur(4px)',
											color: 'white',
											padding: '8px 24px',
											borderRadius: '8px',
											fontWeight: '500',
											fontSize: '14px',
											border: '1px solid rgba(255, 255, 255, 0.4)',
											cursor: 'pointer',
										}}
									>
										Hapus
									</button>
								</div>
							</div>
						) : (
							<label
								htmlFor="bannerUpload"
								className="w-100 h-100 m-0 d-flex flex-column align-items-center justify-content-center"
								style={{ cursor: 'pointer' }}
							>
								<div className="text-center p-4">
									<Image size={40} color="#6b7280" />
									<p className="mt-2 mb-1">
										Tarik & lepas, atau{' '}
										<span
											className="text-primary"
											style={{ fontWeight: '500' }}
										>
											pilih file
										</span>
									</p>
									<p className="text-muted m-0" style={{ fontSize: '13px' }}>
										PNG, JPG, WebP
									</p>
								</div>
							</label>
						)}
					</div>
				</div>
			</Form.Group>

			{/* MODAL CROP GAMBAR */}
			<Modal
				show={showCropModal}
				onHide={() => setShowCropModal(false)}
				size="lg"
				centered
				backdrop="static"
			>
				{/* ... (Isi Modal tetap sama) ... */}
				<Modal.Header closeButton>
					<Modal.Title>Sesuaikan Banner</Modal.Title>
				</Modal.Header>
				<Modal.Body
					className="position-relative"
					style={{ height: '400px', backgroundColor: '#333' }}
				>
					{imageSrc && (
						<Cropper
							image={imageSrc}
							crop={crop}
							zoom={zoom}
							aspect={16 / 9}
							onCropChange={setCrop}
							onCropComplete={onCropComplete}
							onZoomChange={setZoom}
						/>
					)}
				</Modal.Body>
				<Modal.Footer>
					<Button variant="secondary" onClick={() => setShowCropModal(false)}>
						Batal
					</Button>
					<Button variant="primary" onClick={handleSaveCrop}>
						Simpan Potongan
					</Button>
				</Modal.Footer>
			</Modal>
		</>
	);
};

export default UploadImage;
