import React from 'react';
import { Calendar, MapPin } from 'lucide-react';

const shadow = "0 2px 12px rgba(0,105,158,0.08)";
const primaryHex = "#00699e";

const EventCard = ({ ev, onClick }) => (
	<div
		onClick={onClick}
		style={{
			flexShrink: 0,
			width: 196,
			background: 'var(--color-white)',
			borderRadius: 12,
			overflow: 'hidden',
			boxShadow: shadow,
			cursor: 'pointer',
			transition: 'transform .15s',
		}}
		onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-3px)')}
		onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}>
		<div style={{ position: 'relative' }}>
			<img
				src={ev.image}
				alt={ev.title}
				style={{ width: '100%', height: 96, objectFit: 'cover' }}
			/>
			{ev.isFeatured && (
				<span
					style={{
						position: 'absolute',
						top: 6,
						right: 6,
						background: 'var(--color-primary)',
						color: '#fff',
						fontSize: 9,
						fontWeight: 700,
						borderRadius: 99,
						padding: '2px 7px',
					}}>
					FEATURED
				</span>
			)}
		</div>
		<div style={{ padding: '10px 10px 12px' }}>
			<div style={{ display: 'flex', gap: 4, marginBottom: 6, flexWrap: 'wrap' }}>
				{ev.isOnline && (
					<span
						style={{
							fontSize: 9,
							color: primaryHex,
							border: `1px solid ${primaryHex}`,
							borderRadius: 99,
							padding: '1px 6px',
							fontWeight: 600,
						}}>
						Online
					</span>
				)}
				{ev.isInPerson && (
					<span
						style={{
							fontSize: 9,
							color: primaryHex,
							border: `1px solid ${primaryHex}`,
							borderRadius: 99,
							padding: '1px 6px',
							fontWeight: 600,
						}}>
						Offline
					</span>
				)}
			</div>
			<p
				style={{
					margin: '0 0 6px',
					fontSize: 'var(--font-xs)',
					fontWeight: 700,
					color: 'var(--color-text)',
					overflow: 'hidden',
					display: '-webkit-box',
					WebkitLineClamp: 2,
					WebkitBoxOrient: 'vertical',
					lineHeight: 1.4,
				}}>
				{ev.title}
			</p>
			<div
				style={{
					fontSize: 11,
					color: 'var(--color-secondary)',
					display: 'flex',
					flexDirection: 'column',
					gap: 3,
				}}>
				<span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
					<Calendar size={10} />
					{ev.date}
				</span>
				<span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
					<MapPin size={10} />
					<span
						style={{
							overflow: 'hidden',
							textOverflow: 'ellipsis',
							whiteSpace: 'nowrap',
							maxWidth: 130,
						}}>
						{ev.location}
					</span>
				</span>
			</div>
			<div
				style={{
					marginTop: 8,
					paddingTop: 8,
					borderTop: `1px solid var(--color-border)`,
					fontSize: 'var(--font-xs)',
					fontWeight: 700,
					color: 'var(--color-primary)',
				}}>
				{ev.price}
			</div>
		</div>
	</div>
);

export default EventCard;
