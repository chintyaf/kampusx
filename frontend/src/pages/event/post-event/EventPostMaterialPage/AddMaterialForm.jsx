import React, { useState } from 'react';
import { Button, Form } from 'react-bootstrap';
import { Link2, Video, FileText, Plus, Upload, X } from 'lucide-react';

const AddMaterialForm = ({ onSave }) => {
	const [isAddingMaterial, setIsAddingMaterial] = useState(false);
	const [materialFormType, setMaterialFormType] = useState('url');
	const [tempUrl, setTempUrl] = useState('');
	const [tempFiles, setTempFiles] = useState(null);

	const handleCancelAdd = () => {
		setTempUrl('');
		setTempFiles(null);
		setIsAddingMaterial(false);
	};

	const handleTypeChange = (type) => {
		setMaterialFormType(type);
		setTempUrl('');
		setTempFiles(null);
	};

	const handleSaveMaterial = () => {
		onSave({
			type: materialFormType,
			url: tempUrl,
			files: tempFiles,
		});
		handleCancelAdd();
	};

	if (!isAddingMaterial) {
		return (
			<div className="d-flex justify-content-start mt-2">
				<Button
					variant="link"
					className="p-0 text-muted d-flex align-items-center gap-1 text-decoration-none fw-medium"
					style={{
						fontSize: '14px',
						transition: 'color 0.2s',
					}}
					onClick={() => setIsAddingMaterial(true)}
					onMouseEnter={(e) => {
						e.currentTarget.style.color = '#00699e';
					}}
					onMouseLeave={(e) => {
						e.currentTarget.style.color = '';
					}}
				>
					<Plus size={16} />
					<span>Tambah Materi Baru</span>
				</Button>
			</div>
		);
	}

	return (
		<div
			className="rounded p-4 d-flex flex-column gap-4"
			style={{
				backgroundColor: '#f8fafc',
				border: '1px solid #e2e8f0',
			}}
		>
			{/* Langkah 1: Pilih Jenis */}
			<div>
				<label className="small fw-medium mb-2 text-dark">Pilih Jenis Materi</label>
				<div className="d-flex gap-2">
					<Button
						variant={materialFormType === 'url' ? 'primary' : 'outline-secondary'}
						size="sm"
						className="d-flex align-items-center gap-2 border bg-white"
						onClick={() => handleTypeChange('url')}
					>
						<Link2 size={14} /> Tautan YouTube
					</Button>
					<Button
						variant={
							materialFormType === 'video_file' ? 'primary' : 'outline-secondary'
						}
						size="sm"
						className="d-flex align-items-center gap-2 border bg-white"
						onClick={() => handleTypeChange('video_file')}
					>
						<Video size={14} /> Upload Video
					</Button>
					<Button
						variant={materialFormType === 'document' ? 'primary' : 'outline-secondary'}
						size="sm"
						className="d-flex align-items-center gap-2 border bg-white"
						onClick={() => handleTypeChange('document')}
					>
						<FileText size={14} /> Dokumen
					</Button>
				</div>
			</div>

			{/* Langkah 2: Input Area */}
			<div className="bg-white p-3 rounded" style={{ border: '1px solid #e2e8f0' }}>
				{materialFormType === 'url' && (
					<div>
						<label className="small text-muted mb-2">Masukkan URL Video</label>
						<Form.Control
							type="url"
							value={tempUrl}
							onChange={(e) => setTempUrl(e.target.value)}
							placeholder="Contoh: https://youtube.com/watch?v=..."
							className="border-secondary-subtle"
						/>
					</div>
				)}

				{(materialFormType === 'video_file' || materialFormType === 'document') && (
					<>
						{!tempFiles ? (
							<label
								className="d-flex flex-column w-100 align-items-center justify-content-center border border-2 border-dashed rounded p-4 text-center mb-0 transition-colors hover-bg-light"
								style={{ cursor: 'pointer', borderColor: '#cbd5e1' }}
							>
								{materialFormType === 'video_file' ? (
									<Upload size={20} className="text-secondary mb-2" />
								) : (
									<FileText size={20} className="text-secondary mb-2" />
								)}
								<p className="small text-dark fw-medium mb-1">
									Klik atau seret{' '}
									{materialFormType === 'video_file' ? 'video' : 'dokumen'} ke
									sini
								</p>
								<span className="text-muted" style={{ fontSize: '11px' }}>
									{materialFormType === 'video_file'
										? 'MP4, MOV (Maks. 500MB)'
										: 'PDF, PPTX, DOCX (Maks. 50MB)'}
								</span>
								<input
									type="file"
									className="d-none"
									accept={
										materialFormType === 'video_file'
											? 'video/*'
											: '.pdf,.ppt,.pptx,.doc,.docx'
									}
									multiple={materialFormType === 'document'}
									onChange={(e) => setTempFiles(e.target.files)}
								/>
							</label>
						) : (
							<div className="d-flex align-items-center justify-content-between p-2 border border-primary-subtle bg-primary-subtle bg-opacity-25 rounded">
								<div className="d-flex align-items-center gap-2 overflow-hidden">
									{materialFormType === 'video_file' ? (
										<Video size={16} className="text-primary flex-shrink-0" />
									) : (
										<FileText
											size={16}
											className="text-primary flex-shrink-0"
										/>
									)}
									<span className="small text-dark fw-medium text-truncate">
										{tempFiles.length === 1
											? tempFiles[0].name
											: `${tempFiles.length} file terpilih`}
									</span>
								</div>
								<Button
									variant="link"
									size="sm"
									className="p-0 text-secondary"
									onClick={() => setTempFiles(null)}
								>
									<X size={16} />
								</Button>
							</div>
						)}
					</>
				)}
			</div>

			{/* Aksi Form */}
			<div className="d-flex justify-content-end gap-2 mt-1">
				<Button
					variant="light"
					className="border border-secondary-subtle small bg-white"
					size="sm"
					onClick={handleCancelAdd}
				>
					Batal
				</Button>
				<Button
					variant="primary"
					size="sm"
					onClick={handleSaveMaterial}
					disabled={!tempUrl && !tempFiles}
				>
					Simpan Materi
				</Button>
			</div>
		</div>
	);
};

export default AddMaterialForm;
