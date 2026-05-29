import React from 'react';
import { STORAGE_URL } from '@/api/storage';

const EventAbout = ({ eventDetails }) => {
	return (
		<>
			{/* Gambar Utama Event */}
			<div className="mb-4">
				<img
					src={
						eventDetails.image_path
							? `${STORAGE_URL}/${eventDetails.image_path}`
							: `${STORAGE_URL}/event-banners/${eventDetails.id}.jpg`
					}
					alt={eventDetails.title}
					className="w-100 rounded-4 object-fit-cover shadow-sm"
					style={{ height: '400px' }}
				/>
			</div>

			{/* Deskripsi Event */}
			<div className="bg-white p-4 rounded-4 shadow-sm border mb-4">
				<h4 className="fw-bold mb-3" style={{ color: 'var(--color-text)' }}>
					Tentang Event Ini
				</h4>

				<div
					style={{ lineHeight: '1.8', color: 'var(--color-secondary)' }}
					dangerouslySetInnerHTML={{
						__html: eventDetails.description || '<p>Deskripsi tidak tersedia.</p>',
					}}
				/>

				{/* Menampilkan Kategori */}
				{eventDetails.categories?.length > 0 && (
					<div className="mt-4 pt-3 border-top">
						<h6 className="fw-bold mb-3" style={{ fontSize: '0.9rem', color: 'var(--color-text)' }}>
							Kategori:
						</h6>
						<div className="d-flex flex-wrap gap-2">
							{eventDetails.categories.map((cat, idx) => (
								<span
									key={`cat-${idx}`}
									className="badge bg-light text-dark border px-3 py-2 fw-medium"
								>
									{cat.name}
								</span>
							))}
						</div>
					</div>
				)}

				{/* Menampilkan Tipe Event */}
				{eventDetails.event_types?.length > 0 && (
					<div className="mt-4 pt-3 border-top">
						<h6 className="fw-bold mb-3" style={{ fontSize: '0.9rem', color: 'var(--color-text)' }}>
							Tipe Event:
						</h6>
						<div className="d-flex flex-wrap gap-2">
							{eventDetails.event_types.map((type, idx) => (
								<span
									key={`type-${idx}`}
									className="badge"
									style={{
										backgroundColor: 'var(--bahama-blue-50)',
										color: 'var(--color-primary)',
										border: '1px solid var(--color-border-blue)',
										padding: '0.5rem 1rem',
										fontWeight: 500,
									}}
								>
									{type.name}
								</span>
							))}
						</div>
					</div>
				)}
			</div>
		</>
	);
};

export default EventAbout;
