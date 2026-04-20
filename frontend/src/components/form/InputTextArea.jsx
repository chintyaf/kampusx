import React from 'react';
import { Form } from 'react-bootstrap';

const InputTextArea = ({
	label,
	name,
	value,
	onChange,
	placeholder,
	minLimit = 50,
	maxLimit = 500,
	rows = 3,
	required = false, // Tambahkan props required
}) => {
	const currentLength = value?.length || 0;
	const isTooShort = currentLength < minLimit;

	return (
		<Form.Group className="mb-3">
			{label && (
				<Form.Label className="small fw-bold">
					{label} {required && '*'}
				</Form.Label>
			)}

			<Form.Control
				as="textarea"
				rows={rows}
				name={name}
				value={value}
				onChange={onChange}
				placeholder={placeholder}
				minLength={minLimit}
				maxLength={maxLimit}
				required={required} // Masukkan ke sini agar validasi HTML5 jalan
			/>

			<Form.Text className="text-muted small d-block mt-1 text-end">
				{currentLength} / {maxLimit} karakter
				{/* Validasi visual: hanya muncul jika sudah mulai mengetik tapi belum cukup */}
				{isTooShort && currentLength > 0 && (
					<span className="text-danger"> (Minimal {minLimit} karakter)</span>
				)}
			</Form.Text>
		</Form.Group>
	);
};

export default InputTextArea;
