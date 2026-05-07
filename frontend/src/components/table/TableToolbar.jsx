import React from 'react';

const TableToolbar = () => {
	return (
		<div className="table-toolbar">
			{/* <div className="search-box">
				<Search size={14} color="var(--text-muted)" />
				<input
					placeholder="Search name or email..."
					value={search}
					onChange={(e) => handleSearch(e.target.value)}
				/>
			</div>
			<span className="show-label">
				Showing
				<select
					className="show-select"
					value={perPage}
					onChange={(e) => handlePer(e.target.value)}>
					<option value={5}>5</option>
					<option value={10}>10</option>
					<option value={25}>25</option>
				</select>
			</span>

			<select
				className="filter-select"
				value={roleFilter}
				onChange={(e) => handleRole(e.target.value)}>
				<option value="">All Roles</option>
				<option value="admin">Admin</option>
				<option value="organizer">Organizer</option>
				<option value="committee">Committee</option>
				<option value="participant">Participant</option>
			</select>

			<select
				className="filter-select"
				value={statusFilter}
				onChange={(e) => handleStatus(e.target.value)}>
				<option value="">All Status</option>
				<option value="active">Active</option>
				<option value="suspended">Suspended</option>
				<option value="banned">Banned</option>
			</select>

			<div className="toolbar-spacer" />

			<button className="btn btn-outline">
				<Filter size={14} /> Filter
			</button>
			<button className="btn btn-outline">
				<Download size={14} /> Export
			</button> */}
			<button className="btn btn-primary">
				<Plus size={14} /> Add User
			</button>
		</div>
	);
};

export default TableToolbar;
