import React, { useState, useRef, useEffect } from 'react';
import { Button, Spinner } from 'react-bootstrap';
import { Upload } from 'lucide-react';
import CanvasElement from './CanvasElement';

const CanvasArea = ({
	templateFile,
	elements,
	selectedId,
	onFileSelect,
	setSelectedId,
	updateEl,
	isUploading = false,
	onFileTrigger,
}) => {
	const [isDragOver, setIsDragOver] = useState(false);
	const containerRef = useRef(null);
	const [canvasWidth, setCanvasWidth] = useState(1920);

	useEffect(() => {
		if (!containerRef.current) return;
		const observer = new ResizeObserver((entries) => {
			for (let entry of entries) {
				const width = entry.contentRect.width;
				if (width > 0) {
					setCanvasWidth(width);
				}
			}
		});
		observer.observe(containerRef.current);
		return () => observer.disconnect();
	}, [templateFile]);

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
			{isUploading ? (
				<div className="d-flex flex-column align-items-center justify-content-center p-5">
					<Spinner animation="border" variant="primary" className="mb-2" />
					<h6 className="fw-bold text-secondary">Mengunggah template...</h6>
					<p className="text-muted small">Mohon tunggu sebentar</p>
				</div>
			) : !templateFile ? (
				<div
					onClick={(e) => {
						e.stopPropagation();
						onFileTrigger();
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
					className={`position-absolute top-0 start-0 w-100 h-100 d-flex flex-column align-items-center justify-content-center cursor-pointer upload-zone ${isDragOver ? 'drag-over' : ''}`}
				>
					<div className="upload-icon-box bg-white rounded-3 d-flex align-items-center justify-content-center mb-3">
						<Upload size={24} className={isDragOver ? 'text-primary' : 'text-muted'} />
					</div>
					<h6
						className={`fw-bold ${isDragOver ? 'text-primary' : 'text-secondary'}`}
						height={500}
					>
						Upload template sertifikat
					</h6>
					<p className="text-muted small">Drag & drop atau klik di sini · PNG, JPG</p>
				</div>
			) : (
				<>
					<div className="position-relative h-100 w-100 d-flex align-items-center justify-content-center">
						{/* Remove w-100 h-100 from this wrapper if you want the image to center freely */}
						<div
							ref={containerRef}
							className="position-relative"
							style={{
								display: 'inline-block',
								maxWidth: '100%',
								maxHeight: '100%',
							}}
						>
							<img
								src={templateFile}
								alt="template"
								style={{
									maxWidth: '100%',
									maxHeight: '65vh',
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
									canvasWidth={canvasWidth}
								/>
							))}
						</div>
					</div>

				</>
			)}
		</div>
	);
};

export default CanvasArea;
