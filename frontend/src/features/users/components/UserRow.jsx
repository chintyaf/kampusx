import { CheckCircle2, XCircle, Pencil, Trash2 } from 'lucide-react';
import { getInitials, getAvatarColor, fmtDate } from '../utils/formatters';
import { RolePill, StatusBadge } from './UserBadges';

const UserRow = ({ user, onEdit, onDelete }) => {
	return (
		<tr>
			<td>
				<div className="user-cell">
					<div className="user-avatar" style={{ background: getAvatarColor(user.name) }}>
						{getInitials(user.name)}
					</div>
					<div>
						<div className="user-name">{user.name}</div>
						<div className="user-email">{user.email}</div>
						{user.university_name && (
							<div className="small text-muted d-flex align-items-center gap-1 mt-1" style={{ fontSize: '10px' }}>
								<span>🏫 {user.university_name}</span>
								{user.affiliation_valid_until && (
									<span style={{ fontSize: '9px', backgroundColor: 'var(--light-bg, #f3f4f6)', padding: '1px 4px', borderRadius: '4px', color: 'var(--text-muted, #4b5563)' }}>
										s.d {user.affiliation_valid_until}
									</span>
								)}
							</div>
						)}
					</div>
				</div>
			</td>
			<td style={{ color: 'var(--text-muted)' }}>{user.phone || '—'}</td>
			<td>
				<RolePill role={user.role} />
			</td>
			<td>
				<StatusBadge status={user.status} />
				{user.status_reason && (
					<div
						className="small text-muted"
						style={{
							fontSize: '11px',
							marginTop: '4px',
							maxWidth: '180px',
							whiteSpace: 'nowrap',
							overflow: 'hidden',
							textOverflow: 'ellipsis',
						}}
						title={user.status_reason}
					>
						Alasan: {user.status_reason}
					</div>
				)}
			</td>
			{/* <td>
				{user.verified ? (
					<span
						style={{
							display: 'inline-flex',
							alignItems: 'center',
							gap: 4,
							color: 'var(--success-text)',
							fontWeight: 600,
							fontSize: 12,
						}}>
						<CheckCircle2 size={13} /> Yes
					</span>
				) : (
					<span
						style={{
							display: 'inline-flex',
							alignItems: 'center',
							gap: 4,
							color: 'var(--text-muted)',
							fontSize: 12,
						}}>
						<XCircle size={13} /> No
					</span>
				)}
			</td> */}
			<td style={{ color: 'var(--text-muted)' }}>{fmtDate(user.joined)}</td>
			<td>
				<div className="action-wrap">
					<button className="act-btn edit" onClick={() => onEdit(user)} title="Edit">
						<Pencil size={13} />
					</button>
					{/* <button
						className="act-btn delete"
						onClick={() => onDelete(user)}
						title="Delete">
						<Trash2 size={13} />
					</button> */}
				</div>
			</td>
		</tr>
	);
};

export default UserRow;
