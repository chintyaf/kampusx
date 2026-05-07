import { ArrowUpDown } from 'lucide-react';

const Table = ({ columns, data, renderRow, emptyMessage = 'No records found.' }) => {
	return (
		<div className="table-wrap">
			<table>
				<thead>
					<tr>
						{columns.map((col, index) => (
							<th key={index}>
								<div className="th-inner">
									{col.label}
									{col.sortable && <ArrowUpDown size={11} />}
								</div>
							</th>
						))}
					</tr>
				</thead>
				<tbody>
					{data.length === 0 ? (
						<tr>
							<td colSpan={columns.length}>
								<div className="empty-state">{emptyMessage}</div>
							</td>
						</tr>
					) : (
						data.map((item, index) => renderRow(item, index))
					)}
				</tbody>
			</table>
		</div>
	);
};

export default Table;
