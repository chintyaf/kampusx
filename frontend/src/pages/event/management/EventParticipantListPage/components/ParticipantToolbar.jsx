import React from 'react';
import { Dropdown, Button, Spinner } from 'react-bootstrap';
import { Search, Filter, Download } from 'lucide-react';
import { ATTENDANCE_FILTERS } from './ParticipantHelpers';

const ParticipantToolbar = ({
	attendanceFilter,
	setAttendanceFilter,
	showAll,
	setShowAll,
	isExporting,
	handleExportCSV,
}) => {
	const currentFilterLabel =
		ATTENDANCE_FILTERS.find((f) => f.value === attendanceFilter)?.label ?? 'Semua Status';

	return (
		<div className="participant-toolbar">
			<div className="d-flex gap-2">
				<div className="participant-search">
					<Search size={16} className="participant-search__icon" />
					<input
						type="text"
						placeholder="Cari peserta… (segera hadir)"
						className="participant-search__input"
						disabled
					/>
				</div>

				<Dropdown>
					<Dropdown.Toggle
						variant="outline-secondary"
						size="sm"
						className="d-flex align-items-center gap-2"
					>
						<Filter size={15} />
						{currentFilterLabel}
					</Dropdown.Toggle>
					<Dropdown.Menu className="shadow-sm">
						{ATTENDANCE_FILTERS.map((f) => (
							<Dropdown.Item
								key={f.value}
								onClick={() => setAttendanceFilter(f.value)}
								active={attendanceFilter === f.value}
							>
								{f.label}
							</Dropdown.Item>
						))}
					</Dropdown.Menu>
				</Dropdown>

				<Button
					variant="outline-secondary"
					size="sm"
					onClick={handleExportCSV}
					disabled={isExporting}
					className="d-flex align-items-center gap-2"
				>
					{isExporting ? <Spinner size="sm" /> : <Download size={15} />}
					Export Excel
				</Button>
			</div>

			<div className="d-flex align-items-center gap-3">
				<label className="show-all-toggle">
					<div
						className={`toggle-track${showAll ? ' toggle-track--on' : ''}`}
						onClick={() => setShowAll((v) => !v)}
					>
						<div className="toggle-thumb" />
					</div>
					<span className="toggle-label">Tampilkan semua data</span>
				</label>
			</div>
		</div>
	);
};

export default ParticipantToolbar;
