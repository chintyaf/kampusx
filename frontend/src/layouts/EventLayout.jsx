import { useState } from 'react';
import { Form, Container, Button, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import Select from 'react-select';
import '../assets/css/form.css';
import { Image } from 'lucide-react';
import { notify } from '../utils/notify';

const EventLayout = ({
	heading,
	subheading,
	children,
	nextPath,
	prevPath,
	onSave,
	isFormDirty = false,
	formDirtyMessage = 'Mohon simpan atau batalkan perubahan yang sedang Anda lakukan sebelum pindah halaman.',
}) => {
	const navigate = useNavigate();
	const [isSaving, setIsSaving] = useState(false);
	const handleSaveAndContinue = async () => {
		if (isFormDirty) {
			alert(formDirtyMessage);
			return;
		}

		if (isSaving) return;
		setIsSaving(true);

		try {
			if (onSave) await onSave();
			navigate(`../${nextPath}`);
		} catch (error) {
			console.error('Navigation error:', error);
		} finally {
			setIsSaving(false);
		}
	};

	const handleSave = async () => {
		if (isSaving) return;
		setIsSaving(true);
		try {
			if (onSave) await onSave();
		} catch (error) {
			notify('Failed to save', 'error');
		}
	};

	return (
		<>
			{/* Header Section */}
			<div className="mb-4 d-flex align-items-start">
				<div>
					<h5 className="fw-bold mb-1" style={{ fontSize: '1.1rem' }}>
						{heading}
					</h5>
					<p className="text-muted small mb-0">{subheading}</p>
				</div>
			</div>

			{/* Children Container with Loading State */}
			<div className="position-relative">
				{isSaving && (
					<div
						className="position-absolute w-100 h-100 d-flex justify-content-center align-items-center"
						style={{
							background: 'rgba(255, 255, 255, 0.7)',
							zIndex: 10,
							borderRadius: '8px',
						}}>
						<Spinner animation="border" variant="dark" />
					</div>
				)}

				<div
					className="d-flex flex-column gap-4"
					style={{
						opacity: isSaving ? 0.5 : 1,
						pointerEvents: isSaving ? 'none' : 'auto',
					}}>
					{children}
				</div>
			</div>

			{/* Footer Buttons */}
			<div className="w-100 d-flex justify-content-end mt-4 gap-4">
				{prevPath && (
					<Button
						variant="dark"
						disabled={isSaving}
						onClick={() => {
							if (isFormDirty) {
								alert(formDirtyMessage);
								return;
							}
							navigate(`../${prevPath}`);
						}}>
						Back
					</Button>
				)}
				<Button variant="dark" onClick={handleSaveAndContinue} disabled={isSaving}>
					{isSaving ? 'Saving...' : 'Selanjutnya'}
				</Button>
			</div>
		</>
	);
};

export default EventLayout;
