import React, { useState } from 'react';
import { Button } from 'react-bootstrap';
import { ShieldCheck, Copy, Check, RefreshCw } from 'lucide-react';
// import './PosPinHeader.css';

const PosPinHeader = ({ pin }) => {
	const [pinCopied, setPinCopied] = useState(false);

	// Fungsi untuk menyalin PIN ke clipboard
	// TODO : ubah ini menjadi link yang bisa dibagikan
	const handleCopyPin = async () => {
		try {
			await navigator.clipboard.writeText(pin);
			setPinCopied(true);

			// Kembalikan tombol ke state awal setelah 2 detik
			setTimeout(() => {
				setPinCopied(false);
			}, 2000);
		} catch (err) {
			console.error('Gagal menyalin PIN', err);
		}
	};

	return (
		<div className="pos-banner d-flex align-items-center justify-content-between flex-wrap gap-3 mb-3 p-3">
			{/* Kiri: Icon & Info PIN */}
			<div className="d-flex align-items-center gap-3">
				<div className="pos-icon-wrapper d-flex align-items-center justify-content-center flex-shrink-0">
					<ShieldCheck size={16} className="pos-icon" />
				</div>

				<div>
					<p className="pos-subtitle mb-0">PIN Akses Panitia</p>
					<div className="d-flex align-items-center gap-2 mt-1">
						<span className="pos-pin-text">{pin}</span>
						<Button
							variant="light"
							onClick={handleCopyPin}
							className={`pos-btn pos-btn-copy d-inline-flex align-items-center gap-1 ${pinCopied ? 'copied' : ''}`}>
							{pinCopied ? <Check size={11} /> : <Copy size={11} />}
							{pinCopied ? 'Tersalin!' : 'Salin'}
						</Button>
					</div>
				</div>
			</div>
		</div>
	);
};

export default PosPinHeader;
