import React, { useState } from 'react';
import Icon from './Icon';

const GRADIENTS = [
	['#0b6fa4', '#5cc0e8'],
	['#4f46e5', '#9aa5ff'],
	['#0f766e', '#5eead4'],
	['#b45309', '#fbbf24'],
	['#7c3aed', '#c4b5fd'],
];

const hash = (s = '') => [...s].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7);

/**
 * Thumbnail modul. Memakai gambar jika ada; jika kosong atau gagal dimuat
 * (mis. "Clean Architecture" di versi lama), jatuh ke gradien berdasarkan kategori.
 */
const ModuleThumb = ({ module, className = '' }) => {
	const [failed, setFailed] = useState(false);
	const [from, to] = GRADIENTS[hash(module.category || module.title) % GRADIENTS.length];

	if (module.thumbnail && !failed) {
		return (
			<img
				src={module.thumbnail}
				alt=""
				className={`ld-thumb ${className}`}
				onError={() => setFailed(true)}
			/>
		);
	}
	return (
		<div
			className={`ld-thumb ${className}`}
			style={{ background: `linear-gradient(135deg, ${from}, ${to})` }}
			aria-hidden="true"
		>
			<Icon name="book-open" size={26} />
		</div>
	);
};

export default ModuleThumb;
