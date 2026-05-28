import React from 'react';
import { Row, Col } from 'react-bootstrap';
import {
	CalendarDays, MapPin, Users, Tag, Building2,
	Pencil, FileText, Upload, Ticket,
	Clock,
} from 'lucide-react';

/**
 * EventInfoCard — richer layout with icon-prefixed fields and improved action buttons.
 */

const Field = ({ icon: Icon, label, children }) => (
	<div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
		<div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
			{Icon && <Icon size={10} strokeWidth={2.5} />}
			{label}
		</div>
		<div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)', lineHeight: 1.4 }}>
			{children}
		</div>
	</div>
);

export default function EventInfoCard({
	event = {
		name: 'Webinar Tech Summit 2025',
		startDate: '20 Juli 2025, 09:00',
		endDate: '21 Juli 2025, 17:00',
		location: 'Online (Zoom)',
		organizer: 'Himpunan Informatika ITB',
		categories: ['Technology', 'Education'],
		institution: 'Institut Teknologi Bandung',
	},
	onEdit,
	onFormulir,
	onExport,
	onTiket,
}) {
	return (
		<div className="card mb-4" style={{ padding: 0, overflow: 'hidden' }}>
			{/* Card Header */}
			<div style={{
				display: 'flex', alignItems: 'center', justifyContent: 'space-between',
				padding: '14px 20px', borderBottom: '1px solid var(--border)',
			}}>
				<div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>
					<CalendarDays size={15} color="var(--primary)" />
					Info Event
				</div>
				<button
					onClick={onEdit}
					style={{
						display: 'inline-flex', alignItems: 'center', gap: 5,
						fontSize: 12, fontWeight: 600, color: 'var(--primary)',
						background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px 8px',
						borderRadius: 6, transition: 'background 0.15s',
					}}
					onMouseEnter={e => e.currentTarget.style.background = 'var(--bahama-blue-50)'}
					onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
				>
					<Pencil size={12} />
					Edit Info
				</button>
			</div>

			{/* Fields Grid */}
			<div style={{ padding: '18px 20px' }}>
				<Row className="g-3">
					<Col xs={12} sm={6} lg={4}>
						<Field icon={Tag} label="Nama Event">{event.name}</Field>
					</Col>
					<Col xs={12} sm={6} lg={4}>
						<Field icon={Clock} label="Tanggal Mulai">{event.startDate || '—'}</Field>
					</Col>
					<Col xs={12} sm={6} lg={4}>
						<Field icon={Clock} label="Tanggal Selesai">{event.endDate || '—'}</Field>
					</Col>
					<Col xs={12} sm={6} lg={4}>
						<Field icon={MapPin} label="Lokasi">{event.location || '—'}</Field>
					</Col>
					<Col xs={12} sm={6} lg={4}>
						<Field icon={Users} label="Organizer">{event.organizer || '—'}</Field>
					</Col>
					<Col xs={12} sm={6} lg={4}>
						<Field icon={Tag} label="Kategori">
							{event.categories && event.categories.length > 0 ? (
								<div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginTop: 2 }}>
									{(Array.isArray(event.categories) ? event.categories : []).map((c, i) => (
										<span key={i} className="tag tag-primary">{c}</span>
									))}
								</div>
							) : '—'}
						</Field>
					</Col>
				</Row>
			</div>

			{/* Action Bar */}
			<div style={{
				display: 'flex', gap: 8, flexWrap: 'wrap',
				padding: '12px 20px', borderTop: '1px solid var(--border)',
				background: '#fafbfc',
			}}>
				<button
					className="btn btn-outline"
					style={{ fontSize: 12, padding: '7px 14px', borderRadius: 8 }}
					onClick={onFormulir}
				>
					<FileText size={13} />
					Lihat Formulir
				</button>
				<button
					className="btn btn-outline"
					style={{ fontSize: 12, padding: '7px 14px', borderRadius: 8 }}
					onClick={onExport}
				>
					<Upload size={13} />
					Export Peserta
				</button>
				<button
					className="btn btn-primary"
					style={{ fontSize: 12, padding: '7px 14px', borderRadius: 8, marginLeft: 'auto' }}
					onClick={onTiket}
				>
					<Ticket size={13} />
					Kelola Tiket
				</button>
			</div>
		</div>
	);
}
