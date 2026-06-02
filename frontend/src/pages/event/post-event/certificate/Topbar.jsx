import React from 'react';
import { Button, Form, Spinner } from 'react-bootstrap';
import { Award, Eye, Save, Check, Upload } from 'lucide-react';
import FormHeading from '@/components/dashboard/FormHeading';
const Topbar = ({ saved, onSave, onPreview, isSaving, templateFile, onFileTrigger }) => {
	return (
		<div className="d-flex align-items-center justify-content-between pb-3 ">
			<div className="d-flex align-items-center gap-3">
				<div>
					<FormHeading
						title="Buat Sertifikat"
						description="Klik elemen untuk mengedit · Tarik untuk memindahkan"
					/>
				</div>
			</div>

			<div className="d-flex align-items-center gap-2">
				{templateFile && (
					<Button
						variant="light"
						size="sm"
						className="border"
						onClick={(e) => {
							e.stopPropagation();
							onFileTrigger();
						}}
					>
						<Upload size={14} /> Ganti template
					</Button>
				)}
				<Button
					variant="outline-secondary"
					size="sm"
					className="d-flex align-items-center gap-2"
					onClick={onPreview}
				>
					<Eye size={16} /> Preview
				</Button>
				<Button
					variant="dark"
					size="sm"
					className="d-flex align-items-center gap-2"
					onClick={onSave}
				>
					<Save size={16} /> Simpan
				</Button>
			</div>
		</div>
	);
};

export default Topbar;
