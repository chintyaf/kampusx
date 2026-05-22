// File: src/utils/cropImage.js

/**
 * Membuat elemen Image dari sebuah URL untuk diproses ke Canvas
 */
export const createImage = (url) =>
	new Promise((resolve, reject) => {
		const image = new window.Image();
		image.addEventListener('load', () => resolve(image));
		image.addEventListener('error', (error) => reject(error));
		image.setAttribute('crossOrigin', 'anonymous'); // Menghindari isu CORS
		image.src = url;
	});

/**
 * Fungsi utama untuk memotong gambar menggunakan Canvas
 * Mengembalikan file gambar baru (File object)
 */
export default async function getCroppedImg(imageSrc, pixelCrop) {
	const image = await createImage(imageSrc);
	const canvas = document.createElement('canvas');
	const ctx = canvas.getContext('2d');

	if (!ctx) {
		return null;
	}

	// Set ukuran canvas sesuai dengan ukuran area crop
	canvas.width = pixelCrop.width;
	canvas.height = pixelCrop.height;

	// Gambar area yang dipotong ke dalam canvas
	ctx.drawImage(
		image,
		pixelCrop.x,
		pixelCrop.y,
		pixelCrop.width,
		pixelCrop.height,
		0,
		0,
		pixelCrop.width,
		pixelCrop.height,
	);

	// Bagian dalam fungsi getCroppedImg di utils/cropImage.js
	return new Promise((resolve, reject) => {
		canvas.toBlob(
			(blob) => {
				if (!blob) {
					reject(new Error('Canvas kosong'));
					return;
				}

				// Buat file baru dari hasil crop
				const file = new File([blob], 'cropped-banner.jpg', { type: 'image/jpeg' });

				// PENTING: Buat URL object agar bisa ditampilkan di elemen <img> preview
				file.preview = URL.createObjectURL(blob);

				resolve(file);
			},
			'image/jpeg',
			0.9,
		);
	});
}
