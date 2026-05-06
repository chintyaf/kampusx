import React from 'react';
import { Calendar, X } from 'lucide-react';
import { Button } from 'react-bootstrap';

const DateHeaderForm = ({ date, onDelete, onEdit }) => {
	return (
		<div
			className="d-flex justify-content-between align-items-center py-2 px-3 rounded-3"
			style={{
				backgroundColor: '#f8fafc',
				border: '1px solid #e2e8f0',
			}}
		>
			{/* BAGIAN KIRI: Icon dan Input Tanggal Langsung */}
			<div
				className="d-flex align-items-center gap-2 position-relative input-calendar"
				// style={{ color: '#1e293b' }}
			>
				<Calendar size={18} className="text-secondary calendar-icon" />

				{/* Menggunakan input standar HTML dengan custom class */}
				<input
					type="date"
					value={date || ''}
					onChange={(e) => onEdit(e.target.value)}
					className="seamless-date-input fw-medium"
				/>
			</div>

			{/* BAGIAN KANAN: Tombol Hapus */}
			<div>
				<Button
					variant="light"
					className="d-flex align-items-center gap-2 border bg-white text-danger"
					onClick={() => {
						if (
							window.confirm(
								'Yakin ingin menghapus hari ini beserta seluruh sesinya?',
							)
						) {
							onDelete();
						}
					}}
					size="sm"
				>
					<X size={16} />
					<span className="fw-medium">Hapus Hari</span>
				</Button>
			</div>
		</div>
	);
};

export default DateHeaderForm;
