import React from 'react';
import { Save } from 'lucide-react';
import { Modal, Btn } from './SectionCard';
import { T, outlineBtn, primaryBtn } from '../utils/lessonConstants';

export const ConfirmNavigationModal = ({
	isOpen,
	currentLabel = 'Lesson',
	onCancel,
	onDiscard,
	onSaveAndNav,
}) => {
	if (!isOpen) return null;

	return (
		<Modal title="Perubahan belum disimpan" onClose={onCancel}>
			<p
				style={{
					margin: '0 0 20px',
					fontSize: T.fsm,
					color: T.muted,
					lineHeight: 1.5,
				}}
			>
				Anda punya perubahan pada {currentLabel} yang belum disimpan. Simpan dulu sebelum pindah?
			</p>
			<div
				style={{
					display: 'flex',
					justifyContent: 'flex-end',
					gap: 8,
					flexWrap: 'wrap',
				}}
			>
				<Btn
					onClick={onCancel}
					style={outlineBtn}
					hoverStyle={{ backgroundColor: T.neutralBg }}
				>
					Batal
				</Btn>
				<Btn
					onClick={onDiscard}
					style={{ ...outlineBtn, color: T.danger }}
					hoverStyle={{ backgroundColor: T.dangerBg }}
				>
					Buang perubahan
				</Btn>
				<Btn
					onClick={onSaveAndNav}
					style={primaryBtn}
					hoverStyle={{ filter: 'brightness(0.92)' }}
				>
					<Save size={16} /> Simpan & pindah
				</Btn>
			</div>
		</Modal>
	);
};

export default ConfirmNavigationModal;
