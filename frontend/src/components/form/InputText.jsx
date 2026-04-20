import React from 'react';
import { Form } from 'react-bootstrap';

const InputText = ({
	label,
	type = 'text',
	name,
	value,
	onChange,
	placeholder,
	required = false,
	className = 'mb-3',
}) => {
	return (
		<Form.Group className={className}>
			{label && (
				<Form.Label className="small fw-bold">
					{label} {required && <span className="text-danger">*</span>}
				</Form.Label>
			)}
			<Form.Control
				type={type}
				name={name}
				value={value || ''} // Mencegah error "uncontrolled component" jika value null
				onChange={onChange}
				placeholder={placeholder}
				required={required}
			/>
		</Form.Group>
	);
};

export default InputText;
