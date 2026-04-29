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
					</div>
				</div>
			</td>
			<td style={{ color: 'var(--text-muted)' }}>{user.phone || '—'}</td>
			<td>
				<RolePill role={user.role} />
			</td>
			<td>
				<StatusBadge status={user.status} />
			</td>
			<td>
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
			</td>
			<td style={{ color: 'var(--text-muted)' }}>{fmtDate(user.joined)}</td>
			<td>
				<div className="action-wrap">
					<button className="act-btn edit" onClick={() => onEdit(user)} title="Edit">
						<Pencil size={13} />
					</button>
					<button
						className="act-btn delete"
						onClick={() => onDelete(user)}
						title="Delete">
						<Trash2 size={13} />
					</button>
				</div>
			</td>
		</tr>
	);
};

export default UserRow;
