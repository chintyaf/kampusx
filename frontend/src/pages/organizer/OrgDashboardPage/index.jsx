import { useState } from 'react';
import {
	Search,
	Plus,
	Calendar,
	Users,
	LayoutDashboard,
	Image as ImageIcon,
	Activity,
	Clock,
	Lock,
	TrendingUp,
	Wallet,
	Award,
	Mic2,
	ShieldAlert,
	Settings,
	FileText,
	ChevronRight,
	Bell,
	Zap,
} from 'lucide-react';

const FONT = "'DM Sans', 'Instrument Sans', system-ui, sans-serif";
const MONO = "'DM Mono', 'Fira Mono', monospace";

const colors = {
	bg: '#f5f4f0',
	surface: '#ffffff',
	border: '#e8e6e0',
	borderHover: '#b8b4a8',
	text: '#1a1916',
	textMuted: '#6b6862',
	textFaint: '#a8a49c',
	accent: '#1f4de4',
	accentLight: '#eaeefd',
	accentText: '#1a3db8',
	amber: '#c47b0a',
	amberLight: '#fef4e0',
	green: '#1a7a42',
	greenLight: '#e6f5ec',
	red: '#c0392b',
	redLight: '#fdecea',
	purple: '#6b3fa0',
	purpleLight: '#f0eafd',
	ongoing: '#1f4de4',
	ongoingBg: '#eaeefd',
	draft: '#c47b0a',
	draftBg: '#fef4e0',
	completed: '#1a1916',
	completedBg: '#f0efec',
};

const statusConfig = {
	draft: { bg: colors.draftBg, text: colors.draft, label: 'Draft' },
	published: { bg: colors.greenLight, text: colors.green, label: 'Published' },
	ongoing: { bg: colors.ongoingBg, text: colors.ongoing, label: 'Ongoing' },
	completed: { bg: colors.completedBg, text: colors.completed, label: 'Selesai' },
};

const formatDate = (dateString) => {
	const date = new Date(dateString);
	return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
};

const NavItem = ({ icon: Icon, label, active, onClick }) => (
	<button
		onClick={onClick}
		style={{
			display: 'flex',
			alignItems: 'center',
			gap: '10px',
			padding: '9px 12px',
			width: '100%',
			backgroundColor: active ? colors.text : 'transparent',
			color: active ? '#ffffff' : colors.textMuted,
			border: 'none',
			borderRadius: '8px',
			cursor: 'pointer',
			fontSize: '13.5px',
			fontWeight: active ? '500' : '400',
			fontFamily: FONT,
			textAlign: 'left',
			transition: 'all 0.15s',
		}}
		onMouseOver={(e) => {
			if (!active) {
				e.currentTarget.style.backgroundColor = colors.border;
				e.currentTarget.style.color = colors.text;
			}
		}}
		onMouseOut={(e) => {
			if (!active) {
				e.currentTarget.style.backgroundColor = 'transparent';
				e.currentTarget.style.color = colors.textMuted;
			}
		}}
	>
		<Icon size={16} strokeWidth={1.75} />
		{label}
	</button>
);

const MetricCard = ({ label, value, sub, icon: Icon, iconColor, trend }) => (
	<div
		style={{
			padding: '20px 22px',
			backgroundColor: colors.surface,
			border: `1px solid ${colors.border}`,
			borderRadius: '12px',
			display: 'flex',
			flexDirection: 'column',
			gap: '2px',
		}}
	>
		<div
			style={{
				display: 'flex',
				justifyContent: 'space-between',
				alignItems: 'flex-start',
				marginBottom: '10px',
			}}
		>
			<span
				style={{
					fontSize: '12px',
					color: colors.textMuted,
					fontWeight: '500',
					textTransform: 'uppercase',
					letterSpacing: '0.04em',
				}}
			>
				{label}
			</span>
			<div
				style={{
					width: '30px',
					height: '30px',
					backgroundColor: iconColor + '18',
					borderRadius: '8px',
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
				}}
			>
				<Icon size={15} color={iconColor} strokeWidth={2} />
			</div>
		</div>
		<span
			style={{
				fontSize: '26px',
				color: colors.text,
				fontWeight: '600',
				letterSpacing: '-0.02em',
				lineHeight: '1',
			}}
		>
			{value}
		</span>
		<span
			style={{
				fontSize: '12px',
				color: trend === 'up' ? colors.green : colors.textFaint,
				marginTop: '6px',
			}}
		>
			{sub}
		</span>
	</div>
);

const StatusBadge = ({ status }) => {
	const cfg = statusConfig[status] || statusConfig.draft;
	return (
		<span
			style={{
				backgroundColor: cfg.bg,
				color: cfg.text,
				padding: '2px 8px',
				borderRadius: '5px',
				fontSize: '11px',
				fontWeight: '600',
				letterSpacing: '0.02em',
				fontFamily: MONO,
				whiteSpace: 'nowrap',
			}}
		>
			{cfg.label.toUpperCase()}
		</span>
	);
};

export default function OrgDashboardPage() {
	const [activeNav, setActiveNav] = useState('overview');
	const [searchQuery, setSearchQuery] = useState('');
	const [hoveredEvent, setHoveredEvent] = useState(null);

	const events = [
		{
			id: 1,
			title: 'FestiFit 2025: Gerak Sehat, Jiwa Sehat',
			status: 'ongoing',
			start_date: '2026-06-04',
			attendees: 450,
			revenue: 'Rp 22.500.000',
			needsAttention: false,
		},
		{
			id: 2,
			title: 'Workshop UI/UX Design: Flat & Clean Aesthetic',
			status: 'draft',
			start_date: '2026-07-15',
			attendees: 0,
			revenue: 'Rp 0',
			needsAttention: true,
		},
		{
			id: 3,
			title: 'Tech Career Seminar 2025',
			status: 'completed',
			start_date: '2026-05-10',
			attendees: 850,
			revenue: 'Rp 42.500.000',
			needsAttention: true,
		},
	];

	const filtered = events.filter((e) =>
		e.title.toLowerCase().includes(searchQuery.toLowerCase()),
	);

	const logs = [
		{
			text: 'Manual Override: Status presensi VIP a.n. Budi diubah ke Hadir.',
			time: '5 menit yang lalu',
			type: 'alert',
		},
		{
			text: 'Mid-Event Check popup diaktifkan untuk sesi Mental Health',
			time: '1 jam yang lalu',
			type: 'info',
		},
		{
			text: 'Kapasitas link virtual Zoom hampir penuh (95%).',
			time: '2 jam yang lalu',
			type: 'warning',
		},
		{
			text: 'Asisten AI selesai melakukan auto-tagging untuk Draft Event.',
			time: 'Kemarin, 14:30',
			type: 'success',
		},
	];

	const logDot = {
		alert: colors.red,
		info: colors.accent,
		warning: colors.amber,
		success: colors.green,
	};

	return (
		<>
			{/* Main */}
			<div
				style={{
					flex: 1,
					display: 'flex',
					flexDirection: 'column',
					overflowY: 'auto',
					minWidth: 0,
				}}
			>
				<div>
					{/* Metrics */}
					<div
						style={{
							display: 'grid',
							gridTemplateColumns: 'repeat(4, 1fr)',
							gap: '16px',
							marginBottom: '24px',
						}}
					>
						<MetricCard
							label="Total Revenue"
							value="Rp 65M"
							sub="↑ Bulan ini"
							iconColor={colors.green}
							icon={Wallet}
							trend="up"
						/>
						<MetricCard
							label="Avg. Conversion"
							value="14.2%"
							sub="↑ +2.4% vs bulan lalu"
							iconColor={colors.accent}
							icon={TrendingUp}
							trend="up"
						/>
						<MetricCard
							label="Event Berjalan"
							value="1 Aktif"
							sub="2 Event dalam draft"
							iconColor={colors.amber}
							icon={Activity}
						/>
						<MetricCard
							label="Refund Rate"
							value="1.2%"
							sub="Sangat sehat (< 5%)"
							iconColor={colors.red}
							icon={ShieldAlert}
						/>
					</div>

					{/* Body */}
					<div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
						{/* Events */}
						<div
							style={{
								flex: '2 1 0',
								backgroundColor: colors.surface,
								border: `1px solid ${colors.border}`,
								borderRadius: '12px',
								padding: '22px 24px',
								minWidth: 0,
							}}
						>
							<div
								style={{
									display: 'flex',
									justifyContent: 'space-between',
									alignItems: 'center',
									marginBottom: '18px',
								}}
							>
								<h2
									style={{
										fontSize: '14px',
										fontWeight: '600',
										color: colors.text,
										margin: 0,
									}}
								>
									Manajemen Event
								</h2>
								<div
									style={{
										position: 'relative',
										display: 'flex',
										alignItems: 'center',
									}}
								>
									<Search
										size={13}
										color={colors.textFaint}
										style={{
											position: 'absolute',
											left: '10px',
											pointerEvents: 'none',
										}}
									/>
									<input
										placeholder="Cari event..."
										value={searchQuery}
										onChange={(e) => setSearchQuery(e.target.value)}
										style={{
											paddingLeft: '30px',
											paddingRight: '12px',
											paddingTop: '7px',
											paddingBottom: '7px',
											border: `1px solid ${colors.border}`,
											borderRadius: '7px',
											fontSize: '13px',
											fontFamily: FONT,
											color: colors.text,
											backgroundColor: colors.bg,
											outline: 'none',
											width: '200px',
										}}
									/>
								</div>
							</div>

							<div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
								{filtered.map((event) => (
									<div
										key={event.id}
										onMouseOver={() => setHoveredEvent(event.id)}
										onMouseOut={() => setHoveredEvent(null)}
										style={{
											display: 'flex',
											border: `1px solid ${hoveredEvent === event.id ? colors.borderHover : colors.border}`,
											borderRadius: '10px',
											padding: '14px 16px',
											gap: '14px',
											alignItems: 'center',
											cursor: 'pointer',
											transition: 'border-color 0.15s, background 0.15s',
											backgroundColor:
												hoveredEvent === event.id
													? colors.bg
													: colors.surface,
										}}
									>
										{/* Thumbnail */}
										<div
											style={{
												width: '56px',
												height: '56px',
												backgroundColor: colors.bg,
												borderRadius: '8px',
												border: `1px solid ${colors.border}`,
												display: 'flex',
												alignItems: 'center',
												justifyContent: 'center',
												flexShrink: 0,
											}}
										>
											<ImageIcon
												size={18}
												color={colors.textFaint}
												strokeWidth={1.5}
											/>
										</div>

										{/* Info */}
										<div style={{ flex: 1, minWidth: 0 }}>
											<div
												style={{
													display: 'flex',
													gap: '8px',
													alignItems: 'center',
													marginBottom: '5px',
													flexWrap: 'wrap',
												}}
											>
												<span
													style={{
														fontSize: '14px',
														fontWeight: '600',
														color: colors.text,
														whiteSpace: 'nowrap',
														overflow: 'hidden',
														textOverflow: 'ellipsis',
													}}
												>
													{event.title}
												</span>
												<StatusBadge status={event.status} />
											</div>
											<div
												style={{
													display: 'flex',
													gap: '14px',
													color: colors.textMuted,
													fontSize: '12px',
													marginBottom: '6px',
												}}
											>
												<span
													style={{
														display: 'flex',
														alignItems: 'center',
														gap: '4px',
													}}
												>
													<Calendar size={11} />{' '}
													{formatDate(event.start_date)}
												</span>
												<span
													style={{
														display: 'flex',
														alignItems: 'center',
														gap: '4px',
													}}
												>
													<Users size={11} />{' '}
													{event.attendees.toLocaleString('id-ID')}
												</span>
												<span
													style={{
														display: 'flex',
														alignItems: 'center',
														gap: '4px',
													}}
												>
													<Wallet size={11} /> {event.revenue}
												</span>
											</div>
											{event.needsAttention && event.status === 'draft' && (
												<div
													style={{
														display: 'inline-flex',
														alignItems: 'center',
														gap: '5px',
														fontSize: '11px',
														color: colors.amber,
														backgroundColor: colors.amberLight,
														borderRadius: '5px',
														padding: '2px 8px',
													}}
												>
													<Zap size={10} /> Butuh struktur alur sesi
												</div>
											)}
											{event.needsAttention &&
												event.status === 'completed' && (
													<div
														style={{
															display: 'inline-flex',
															alignItems: 'center',
															gap: '5px',
															fontSize: '11px',
															color: colors.purple,
															backgroundColor: colors.purpleLight,
															borderRadius: '5px',
															padding: '2px 8px',
														}}
													>
														<FileText size={10} /> Sertifikat siap
														distribusi (850 file)
													</div>
												)}
										</div>

										<button
											style={{
												backgroundColor: 'transparent',
												border: `1px solid ${colors.border}`,
												padding: '7px 13px',
												borderRadius: '7px',
												fontSize: '12px',
												fontWeight: '500',
												color: colors.textMuted,
												cursor: 'pointer',
												fontFamily: FONT,
												whiteSpace: 'nowrap',
												display: 'flex',
												alignItems: 'center',
												gap: '4px',
												flexShrink: 0,
												transition: 'all 0.15s',
											}}
											onMouseOver={(e) => {
												e.currentTarget.style.borderColor = colors.text;
												e.currentTarget.style.color = colors.text;
											}}
											onMouseOut={(e) => {
												e.currentTarget.style.borderColor = colors.border;
												e.currentTarget.style.color = colors.textMuted;
											}}
										>
											Buka <ChevronRight size={12} />
										</button>
									</div>
								))}
							</div>
						</div>
					</div>
				</div>
			</div>
		</>
	);
}
