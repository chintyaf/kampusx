import React, { useState, useRef } from 'react';
import { Button } from 'react-bootstrap';
import { Upload } from 'lucide-react';
import CanvasElement from './CanvasElement';

const CanvasArea = ({
	templateFile,
	elements,
	selectedId,
	onFileSelect,
	setSelectedId,
	updateEl,
}) => {
	const [isDragOver, setIsDragOver] = useState(false);
	const fileRef = useRef(null);

	const onDrop = (e) => {
		e.preventDefault();
		setIsDragOver(false);
		const f = e.dataTransfer.files[0];
		if (f?.type.startsWith('image/')) onFileSelect(f);
	};

	return (
		<div
			data-canvas
			onClick={() => setSelectedId(null)}
			className="flex-grow-1 position-relative canvas-area d-flex justify-content-center align-items-center overflow-hidden"
			// style={(height = 100)}
		>
			{!templateFile ? (
				<div
					onClick={(e) => {
						e.stopPropagation();
						fileRef.current?.click();
					}}
					onDragOver={(e) => {
						e.preventDefault();
						setIsDragOver(true);
					}}
					onDragLeave={() => setIsDragOver(false)}
					onDrop={(e) => {
						e.stopPropagation();
						onDrop(e);
					}}
					className={`position-absolute top-0 start-0 w-100 h-100 d-flex flex-column align-items-center justify-content-center cursor-pointer upload-zone ${isDragOver ? 'drag-over' : ''}`}>
					<div className="upload-icon-box bg-white rounded-3 d-flex align-items-center justify-content-center mb-3">
						<Upload size={24} className={isDragOver ? 'text-primary' : 'text-muted'} />
					</div>
					<h6 className={`fw-bold ${isDragOver ? 'text-primary' : 'text-secondary'}`} height={500}>
						Upload template sertifikat
					</h6>
					<p className="text-muted small">Drag & drop atau klik di sini · PNG, JPG</p>
				</div>
			) : (
				<>
					<div className="position-relative h-100 w-100 d-flex align-items-center justify-content-center">
						{/* Remove w-100 h-100 from this wrapper if you want the image to center freely */}
						<div className="d-flex align-items-center justify-content-center">
							<img
								src={templateFile}
								alt="template"
								style={{
									maxHeight: '100%',
									maxWidth: '100%',
									objectFit: 'contain',
									display: 'block', // Prevents unwanted bottom whitespace
									pointerEvents: 'none',
								}}
							/>
							{elements.map((el) => (
								<CanvasElement
									key={el.id}
									el={el}
									selected={selectedId === el.id}
									onSelect={() => setSelectedId(el.id)}
									onMove={(x, y) => updateEl(el.id, { x, y })}
								/>
							))}
						</div>
					</div>

					<Button
						variant="light"
						size="sm"
						className="position-absolute top-0 start-0 m-3 d-flex align-items-center gap-2 border shadow-sm"
						onClick={(e) => {
							e.stopPropagation();
							fileRef.current?.click();
						}}>
						<Upload size={14} /> Ganti template
					</Button>
				</>
			)}

			<input
				ref={fileRef}
				type="file"
				accept="image/*"
				className="d-none"
				onChange={(e) => {
					const f = e.target.files?.[0];
					if (f) onFileSelect(f);
				}}
			/>
		</div>
	);
};

export default CanvasArea;
