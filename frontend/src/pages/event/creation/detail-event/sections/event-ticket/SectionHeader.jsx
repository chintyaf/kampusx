export default function SectionHeader({ icon: Icon, title, subtitle }) {
	return (
		<div className="mb-3">
			<h6
				className="d-flex align-items-center gap-2 mb-1"
				style={{ fontSize: 14, fontWeight: 600, color: '#1a1a1a' }}>
				<div
					style={{
						width: 28,
						height: 28,
						borderRadius: 8,
						background: '#ede7f6',
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						flexShrink: 0,
					}}>
					<Icon size={14} color="#5e35b1" />
				</div>
				{title}
			</h6>
			{subtitle && (
				<p style={{ fontSize: 12, color: '#999', margin: 0, paddingLeft: 36 }}>
					{subtitle}
				</p>
			)}
		</div>
	);
}
