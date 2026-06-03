import React, { useState } from 'react';
import StatusConfirmationModal from '@/components/event/EventStatusDropdown/StatusConfirmationModal';

export default function DevToolsBar({ eventId, setEventStatus }) {
	const [showDraftModal, setShowDraftModal] = useState(false);
	const [showPublishModal, setShowPublishModal] = useState(false);
	const [showOngoingModal, setShowOngoingModal] = useState(false);
	const [showPostEventModal, setShowPostEventModal] = useState(false);
	const [showCompletedModal, setShowCompletedModal] = useState(false);
	const [showCancelModal, setShowCancelModal] = useState(false);
	const btnBase = {
		display: 'inline-flex',
		alignItems: 'center',
		gap: 7,
		fontSize: 13,
		fontWeight: 600,
		padding: '9px 18px',
		borderRadius: 9,
		cursor: 'pointer',
		border: '1.5px solid',
		transition: 'all 0.15s',
		fontFamily: 'var(--font)',
	};

	const outlineBtn = {
		...btnBase,
		background: 'white',
		color: 'var(--primary)',
		borderColor: 'var(--primary)',
	};

	return (
		<>
			<div
				style={{
					marginTop: 15,
					padding: '10px 15px',
					background: '#f8fafc',
					border: '1px dashed #cbd5e1',
					borderRadius: 8,
					marginBottom: 20,
				}}
			>
				<div style={{ fontSize: 12, fontWeight: 600, color: '#64748b', marginBottom: 8 }}>
					DEV TOOLS: Ubah Status Event (Bypass)
				</div>
				<div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
					<button
						style={{ ...outlineBtn, padding: '6px 12px', fontSize: 12 }}
						onClick={() => setShowDraftModal(true)}
					>
						Set Draft
					</button>
					<button
						style={{
							...outlineBtn,
							padding: '6px 12px',
							fontSize: 12,
							color: '#0f766e',
							borderColor: '#0f766e',
						}}
						onClick={() => setShowPublishModal(true)}
					>
						Set Publish
					</button>
					<button
						style={{
							...outlineBtn,
							padding: '6px 12px',
							fontSize: 12,
							color: '#0284c7',
							borderColor: '#0ea5e9',
						}}
						onClick={() => setShowOngoingModal(true)}
					>
						Set On Going
					</button>
					<button
						style={{
							...outlineBtn,
							padding: '6px 12px',
							fontSize: 12,
							color: '#7c3aed',
							borderColor: '#c4b5fd',
						}}
						onClick={() => setShowPostEventModal(true)}
					>
						Set Setelah Acara
					</button>
					<button
						style={{
							...outlineBtn,
							padding: '6px 12px',
							fontSize: 12,
							color: '#16a34a',
							borderColor: '#86efac',
						}}
						onClick={() => setShowCompletedModal(true)}
					>
						Set Selesai
					</button>
					<button
						style={{
							...outlineBtn,
							padding: '6px 12px',
							fontSize: 12,
							color: '#dc2626',
							borderColor: '#fca5a5',
						}}
						onClick={() => setShowCancelModal(true)}
					>
						Set Cancelled
					</button>
				</div>
			</div>

			{/* Modals */}
			<StatusConfirmationModal
				eventId={eventId}
				show={showDraftModal}
				onHide={() => setShowDraftModal(false)}
				pendingStatus="draft"
				onConfirm={() => {
					setEventStatus('draft');
					setShowDraftModal(false);
				}}
			/>

			<StatusConfirmationModal
				eventId={eventId}
				show={showPublishModal}
				onHide={() => setShowPublishModal(false)}
				pendingStatus="published"
				onConfirm={() => {
					setEventStatus('published');
					setShowPublishModal(false);
				}}
			/>

			<StatusConfirmationModal
				eventId={eventId}
				show={showCancelModal}
				onHide={() => setShowCancelModal(false)}
				pendingStatus="cancelled"
				onConfirm={() => {
					setEventStatus('cancelled');
					setShowCancelModal(false);
				}}
			/>

			<StatusConfirmationModal
				eventId={eventId}
				show={showOngoingModal}
				onHide={() => setShowOngoingModal(false)}
				pendingStatus="ongoing"
				onConfirm={() => {
					setEventStatus('ongoing');
					setShowOngoingModal(false);
				}}
			/>

			<StatusConfirmationModal
				eventId={eventId}
				show={showPostEventModal}
				onHide={() => setShowPostEventModal(false)}
				pendingStatus="post_event"
				onConfirm={() => {
					setEventStatus('post_event');
					setShowPostEventModal(false);
				}}
			/>

			<StatusConfirmationModal
				eventId={eventId}
				show={showCompletedModal}
				onHide={() => setShowCompletedModal(false)}
				pendingStatus="completed"
				onConfirm={() => {
					setEventStatus('completed');
					setShowCompletedModal(false);
				}}
			/>
		</>
	);
}
