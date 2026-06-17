import React from 'react';
import { Spinner, Dropdown } from 'react-bootstrap';
import {
	Users,
	School,
	Eye,
	EyeOff,
	MoreVertical,
	MessageCircle,
	UserCheck,
} from 'lucide-react';
import {
	maskEmail,
	maskPhone,
	fmtTime,
	getInitials,
	getAvatarColor,
} from './ParticipantHelpers';

const ParticipantTable = ({
	participants,
	loading,
	showAll,
	pageInfo,
	revealed,
	toggleReveal,
	summary,
	eventId,
}) => {
	if (loading) {
		return (
			<div className="participant-empty">
				<Spinner animation="border" variant="primary" style={{ width: 28, height: 28 }} />
				<span className="ms-2 text-muted fs-sm">Memuat data…</span>
			</div>
		);
	}

	if (participants.length === 0) {
		return (
			<div className="participant-empty">
				<Users size={36} strokeWidth={1.2} style={{ color: 'var(--color-text-muted)' }} />
				<p className="text-muted mt-2 fs-sm">Tidak ada peserta untuk ditampilkan.</p>
			</div>
		);
	}

	return (
		<table className="participant-table">
			<thead>
				<tr>
					<th style={{ width: 40 }}>#</th>
					<th>Peserta</th>
					{/* <th>Institusi</th> */}
					{/* <th>Email</th>
					<th>Telepon</th> */}
					<th className="text-center">Poin Lokal</th>
					<th className="text-center">Check-in</th>
					<th className="text-center">Check-out</th>
					<th style={{ width: 48 }}></th>
				</tr>
			</thead>
			<tbody>
				{participants.map((ticket, idx) => {
					const name =
						ticket.attendee_name || ticket.participant?.name || 'Tidak diketahui';
					const email = ticket.attendee_email || ticket.participant?.email || null;
					const phone = ticket.participant?.phone || null;
					const university = ticket.participant?.university?.name || null;
					const avatarColor = getAvatarColor(name);
					const isEmailRevealed = revealed[ticket.id]?.email;
					const isPhoneRevealed = revealed[ticket.id]?.phone;
					const rowNum = showAll ? idx + 1 : (pageInfo.current_page - 1) * 15 + idx + 1;

					const localPointsList =
						ticket.participant?.local_points || ticket.participant?.localPoints || [];
					const localPointsRecord = localPointsList.find(
						(lp) => parseInt(lp.event_id) === parseInt(eventId),
					);
					const pointsBalance = localPointsRecord ? localPointsRecord.points_balance : 0;

					const log = ticket.attendance_log;
					const checkinTime = log?.scan_time ? fmtTime(log.scan_time) : null;
					const checkoutTime = log?.checkout_time ? fmtTime(log.checkout_time) : null;

					return (
						<tr key={ticket.id} className="participant-row">
							<td>
								<span className="row-number">{rowNum}</span>
							</td>
							<td>
								<div className="participant-identity">
									<div
										className="participant-avatar"
										style={{
											background: avatarColor.bg,
											color: avatarColor.text,
										}}
									>
										{getInitials(name)}
									</div>
									<div>
										<p className="participant-name">{name}</p>
								
									</div>
								</div>
							</td>
							{/* <td>
								{university ? (
									<div className="institution-cell">
										<School size={13} />
										<span>{university}</span>
									</div>
								) : (
									<span className="text-muted fs-xs">Umum / tidak terdata</span>
								)}
							</td>
							<td>
								<div className="masked-field">
									<span
										className={`masked-value${!isEmailRevealed ? ' masked-value--hidden' : ''}`}
									>
										{isEmailRevealed ? email || '-' : maskEmail(email)}
									</span>
									{email && (
										<button
											className="reveal-btn"
											onClick={() => toggleReveal(ticket.id, 'email')}
											title={
												isEmailRevealed ? 'Sembunyikan' : 'Tampilkan email'
											}
										>
											{isEmailRevealed ? (
												<EyeOff size={12} />
											) : (
												<Eye size={12} />
											)}
										</button>
									)}
								</div>
							</td>
							<td>
								<div className="masked-field">
									<span
										className={`masked-value${!isPhoneRevealed ? ' masked-value--hidden' : ''}`}
									>
										{isPhoneRevealed ? phone || '-' : maskPhone(phone)}
									</span>
									{phone && (
										<button
											className="reveal-btn"
											onClick={() => toggleReveal(ticket.id, 'phone')}
											title={
												isPhoneRevealed ? 'Sembunyikan' : 'Tampilkan nomor'
											}
										>
											{isPhoneRevealed ? (
												<EyeOff size={12} />
											) : (
												<Eye size={12} />
											)}
										</button>
									)}
								</div>
							</td> */}
							<td className="text-center">
								<span className="fw-bold text-primary" style={{ fontSize: '14px' }}>
									{pointsBalance} Pts
								</span>
							</td>
							<td className="text-center">
								{checkinTime ? (
									<span className="text-success fw-medium" style={{ fontSize: '13px' }}>
										{checkinTime}
									</span>
								) : (
									<span className="text-muted">-</span>
								)}
							</td>
							<td className="text-center">
								{checkoutTime ? (
									<span className="text-danger fw-medium" style={{ fontSize: '13px' }}>
										{checkoutTime}
									</span>
								) : (
									<span className="text-muted">-</span>
								)}
							</td>
							<td>
								<Dropdown align="end">
									<Dropdown.Toggle variant="link" className="action-toggle">
										<MoreVertical size={16} />
									</Dropdown.Toggle>
									<Dropdown.Menu className="shadow-sm">
										{phone && (
											<Dropdown.Item
												href={`https://wa.me/${(phone || '').replace(/\D/g, '')}`}
												target="_blank"
												rel="noopener noreferrer"
												className="d-flex align-items-center gap-2 fs-sm"
											>
												<MessageCircle size={14} className="text-success" />
												Hubungi via WhatsApp
											</Dropdown.Item>
										)}
										<Dropdown.Item className="d-flex align-items-center gap-2 fs-sm">
											<UserCheck size={14} className="text-primary" />
											Tandai Hadir Manual
										</Dropdown.Item>
										<Dropdown.Divider />
										<Dropdown.Item className="d-flex align-items-center gap-2 fs-sm text-muted">
											<Eye size={14} />
											Lihat Detail Peserta
										</Dropdown.Item>
									</Dropdown.Menu>
								</Dropdown>
							</td>
						</tr>
					);
				})}
			</tbody>
		</table>
	);
};

export default ParticipantTable;
