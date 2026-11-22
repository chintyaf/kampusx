import React from 'react';
import './srl-fields.css';

export const formatDuration = (totalSeconds = 0) => {
	const s = Math.max(0, Math.floor(totalSeconds));
	const h = Math.floor(s / 3600);
	const m = Math.floor((s % 3600) / 60);
	const sec = s % 60;
	const pad = (n) => String(n).padStart(2, '0');
	return h > 0 ? `${pad(h)}:${pad(m)}:${pad(sec)}` : `${pad(m)}:${pad(sec)}`;
};

export const Field = ({ label, hint, required, children }) => (
	<div className="srlf-field">
		<label className="srlf-label">
			{label}
			{required && <span className="srlf-required"> *</span>}
		</label>
		{hint && <p className="srlf-hint">{hint}</p>}
		{children}
	</div>
);

// Pilih banyak opsi (strategi belajar, faktor refleksi) + opsi tambahan buatan sendiri
export const ChipGroup = ({
	options,
	value = [],
	onChange,
	allowCustom = false,
	customPlaceholder,
}) => {
	const [custom, setCustom] = React.useState('');

	const toggle = (opt) => {
		onChange(value.includes(opt) ? value.filter((v) => v !== opt) : [...value, opt]);
	};

	const addCustom = () => {
		const v = custom.trim().slice(0, 255);
		if (!v) return;
		if (!value.includes(v)) onChange([...value, v]);
		setCustom('');
	};

	// Opsi custom yang sudah dipilih ikut ditampilkan sebagai chip
	const all = [...options, ...value.filter((v) => !options.includes(v))];

	return (
		<div>
			<div className="srlf-chips">
				{all.map((opt) => (
					<button
						type="button"
						key={opt}
						className={`srlf-chip ${value.includes(opt) ? 'is-active' : ''}`}
						onClick={() => toggle(opt)}
						aria-pressed={value.includes(opt)}
					>
						{opt}
					</button>
				))}
			</div>
			{allowCustom && (
				<div className="srlf-custom">
					<input
						type="text"
						className="form-control form-control-sm"
						value={custom}
						maxLength={255}
						placeholder={customPlaceholder || 'Tambahkan sendiri…'}
						onChange={(e) => setCustom(e.target.value)}
						onKeyDown={(e) => {
							if (e.key === 'Enter') {
								e.preventDefault();
								addCustom();
							}
						}}
					/>
					<button
						type="button"
						className="btn btn-sm btn-outline-secondary"
						onClick={addCustom}
					>
						Tambah
					</button>
				</div>
			)}
		</div>
	);
};

// Skala 1–5
export const RatingScale = ({ value, onChange, lowLabel, highLabel }) => (
	<div>
		<div className="srlf-rating" role="radiogroup">
			{[1, 2, 3, 4, 5].map((n) => (
				<button
					type="button"
					key={n}
					role="radio"
					aria-checked={value === n}
					className={`srlf-rate ${value === n ? 'is-active' : ''}`}
					onClick={() => onChange(n)}
				>
					{n}
				</button>
			))}
		</div>
		{(lowLabel || highLabel) && (
			<div className="srlf-rating-labels">
				<span>{lowLabel}</span>
				<span>{highLabel}</span>
			</div>
		)}
	</div>
);
