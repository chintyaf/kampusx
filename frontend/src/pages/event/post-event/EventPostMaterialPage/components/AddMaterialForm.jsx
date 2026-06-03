import React, { useState } from 'react';
import { Button, Form, Spinner } from 'react-bootstrap';
import { Link2, Video, FileText, Plus, Upload, X } from 'lucide-react';

const AddMaterialForm = ({ onSave, isSaving }) => {
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
			<div
				className="mt-3 w-100 rounded d-flex align-items-center justify-content-center gap-2"
				style={{
					padding: '8px',
					border: '1px dashed #cbd5e1',
					backgroundColor: '#f8fafc',
					color: '#64748b',
					cursor: 'pointer',
					transition: 'all 0.2s ease-in-out',
				}}
				onClick={() => setIsAddingMaterial(true)}
				onMouseEnter={(e) => {
					e.currentTarget.style.backgroundColor = '#f0f9ff';
					e.currentTarget.style.borderColor = '#0ea5e9';
					e.currentTarget.style.color = '#0ea5e9';
				}}
				onMouseLeave={(e) => {
					e.currentTarget.style.backgroundColor = '#f8fafc';
					e.currentTarget.style.borderColor = '#cbd5e1';
					e.currentTarget.style.color = '#64748b';
				}}
			>
				<Plus size={16} strokeWidth={2.5} />
				<span className="fw-medium" style={{ fontSize: '13px' }}>
					Tambah Materi Baru
				</span>
			</div>
		);
	}

	return (
		<div
			className="mt-3 rounded p-4 d-flex flex-column gap-3"
			style={{
				backgroundColor: '#ffffff',
				border: '1px solid #e2e8f0',
				boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
			}}
		>
			{/* Header & Deskripsi */}
			<div className="border-bottom pb-3 mb-1">
				<h5 className="fw-semibold text-dark mb-1" style={{ fontSize: '16px', letterSpacing: '-0.3px' }}>
					Tambah Materi Baru
				</h5>
				<p className="text-secondary mb-0" style={{ fontSize: '13px' }}>
					Masukkan tautan atau unggah dokumen untuk peserta.
				</p>
			</div>

			{/* Jenis Materi (Tabs Penuh) */}
			<div className="d-flex flex-column gap-2">
				<div
					className="d-flex p-1 rounded w-100"
					style={{ backgroundColor: '#f1f5f9', border: '1px solid #e2e8f0' }}
				>
					<Button
						variant="link"
						className="text-decoration-none d-flex align-items-center justify-content-center gap-2 rounded px-3 py-2 border-0 flex-grow-1"
						style={{
							fontSize: '13px',
							fontWeight: materialFormType === 'url' ? '600' : '500',
							backgroundColor: materialFormType === 'url' ? '#ffffff' : 'transparent',
							color: materialFormType === 'url' ? '#00699e' : '#64748b',
							boxShadow: materialFormType === 'url' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
							transition: 'all 0.2s ease',
						}}
						onClick={() => handleTypeChange('url')}
					>
						<Link2 size={16} /> URL
					</Button>
					<Button
						variant="link"
						className="text-decoration-none d-flex align-items-center justify-content-center gap-2 rounded px-3 py-2 border-0 flex-grow-1"
						style={{
							fontSize: '13px',
							fontWeight: materialFormType === 'video_file' ? '600' : '500',
							backgroundColor: materialFormType === 'video_file' ? '#ffffff' : 'transparent',
							color: materialFormType === 'video_file' ? '#00699e' : '#64748b',
							boxShadow: materialFormType === 'video_file' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
							transition: 'all 0.2s ease',
						}}
						onClick={() => handleTypeChange('video_file')}
					>
						<Video size={16} /> Video
					</Button>
					<Button
						variant="link"
						className="text-decoration-none d-flex align-items-center justify-content-center gap-2 rounded px-3 py-2 border-0 flex-grow-1"
						style={{
							fontSize: '13px',
							fontWeight: materialFormType === 'document' ? '600' : '500',
							backgroundColor: materialFormType === 'document' ? '#ffffff' : 'transparent',
							color: materialFormType === 'document' ? '#00699e' : '#64748b',
							boxShadow: materialFormType === 'document' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
							transition: 'all 0.2s ease',
						}}
						onClick={() => handleTypeChange('document')}
					>
						<FileText size={16} /> Dokumen
					</Button>
				</div>
			</div>

			{/* Input Area */}
			<div>
				{materialFormType === 'url' && (
					<Form.Control
						type="url"
						size="sm"
						value={tempUrl}
						onChange={(e) => setTempUrl(e.target.value)}
						placeholder="Masukkan Tautan URL (Contoh: https://example.com)"
						className="border-secondary-subtle shadow-none bg-light p-2"
						style={{ fontSize: '13px' }}
						autoFocus
					/>
				)}

				{(materialFormType === 'video_file' || materialFormType === 'document') && (
					<>
						{!tempFiles ? (
							<label
								className="d-flex flex-column w-100 align-items-center justify-content-center rounded p-4 text-center mb-0"
								style={{
									cursor: 'pointer',
									border: '1px dashed #7dd3fc',
									backgroundColor: '#f0f9ff',
									transition: 'background-color 0.2s ease',
								}}
								onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#e0f2fe')}
								onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#f0f9ff')}
							>
								<div className="d-flex align-items-center gap-2 mb-2">
									{materialFormType === 'video_file' ? (
										<Upload size={18} color="#0284c7" />
									) : (
										<FileText size={18} color="#0284c7" />
									)}
									<span
										className="text-dark fw-semibold"
										style={{ fontSize: '14px' }}
									>
										Klik atau seret file ke sini
									</span>
								</div>
								<span className="text-secondary" style={{ fontSize: '12px' }}>
									{materialFormType === 'video_file'
										? 'Mendukung format MP4, MOV (Maks. 500MB)'
										: 'Mendukung format PDF, PPTX, DOCX (Maks. 50MB)'}
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
							<div
								className="d-flex align-items-center justify-content-between p-3 rounded"
								style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}
							>
								<div className="d-flex align-items-center gap-3 overflow-hidden">
									{materialFormType === 'video_file' ? (
										<Video size={18} className="text-primary flex-shrink-0" />
									) : (
										<FileText
											size={18}
											className="text-primary flex-shrink-0"
										/>
									)}
									<span
										className="text-dark fw-medium text-truncate"
										style={{ fontSize: '13px' }}
									>
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
									style={{ transition: 'color 0.2s ease' }}
									onMouseEnter={(e) => (e.currentTarget.style.color = '#ef4444')}
									onMouseLeave={(e) => (e.currentTarget.style.color = '')}
								>
									<X size={16} />
								</Button>
							</div>
						)}
					</>
				)}
			</div>

			{/* Aksi Form: Sejajar, dengan kontras yang lebih baik */}
			<div className="d-flex justify-content-end gap-2 mt-2">
				<Button
					variant="light"
					size="sm"
					className="fw-medium px-4 py-2"
					style={{
						fontSize: '13px',
						border: '1px solid #cbd5e1',
						backgroundColor: '#f8fafc',
						color: '#334155',
						transition: 'all 0.2s ease',
					}}
					onClick={handleCancelAdd}
					onMouseEnter={(e) => {
						e.currentTarget.style.backgroundColor = '#f1f5f9';
						e.currentTarget.style.borderColor = '#94a3b8';
					}}
					onMouseLeave={(e) => {
						e.currentTarget.style.backgroundColor = '#f8fafc';
						e.currentTarget.style.borderColor = '#cbd5e1';
					}}
					disabled={isSaving}
				>
					Batal
				</Button>
				<Button
					size="sm"
					className="fw-medium px-4 py-2 border-0 d-flex align-items-center gap-2"
					style={{
						fontSize: '13px',
						backgroundColor: (!tempUrl && !tempFiles) ? '#94a3b8' : '#00699e',
						color: '#ffffff',
						transition: 'all 0.2s ease',
					}}
					onClick={handleSaveMaterial}
					disabled={(!tempUrl && !tempFiles) || isSaving}
				>
					{isSaving && (
						<Spinner
							animation="border"
							size="sm"
							style={{ width: '14px', height: '14px', borderWidth: '2px' }}
						/>
					)}
					{isSaving ? 'Menyimpan...' : 'Simpan'}
				</Button>
			</div>
		</div>
	);
};

export default AddMaterialForm;
