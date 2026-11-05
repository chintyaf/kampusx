import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
	Save,
	CheckCircle,
	AlertCircle,
	Image as ImageIcon,
	Upload,
	X,
	ArrowLeft,
	Tag,
	Check,
} from 'lucide-react';

const MAX_IMAGE_SIZE = 2 * 1024 * 1024; // 2MB
const ALLOWED_IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/webp'];
const MAX_DESCRIPTION = 1000;
const SUGGESTED_CATEGORIES = [
	'Artificial Intelligence',
	'Machine Learning',
	'Software Engineering',
	'Data Science',
	'UI/UX Design',
];

// Palet
const C = {
	brand: '#006699',
	brandSoft: '#e6f2f8',
	text: '#1e293b',
	muted: '#64748b',
	border: '#e2e8f0',
	cardBorder: '#eaecf0',
	field: '#f8fafc',
	danger: '#dc2626',
	dangerSoft: '#fef2f2',
	success: '#166534',
	successSoft: '#f0fdf4',
	successBorder: '#bbf7d0',
	warnSoft: '#fef3c7',
	warnText: '#92400e',
	warnBorder: '#fde68a',
};

// Langkah alur pembuatan microlearning
const STEPS = ['Learning Path', 'Module', 'Lesson'];

const styles = {
	page: {
		maxWidth: 960,
		margin: '0 auto',
		padding: '48px 24px',
		color: C.text,
		fontFamily: "system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif",
		boxSizing: 'border-box',
	},
	header: {
		display: 'flex',
		alignItems: 'flex-start',
		justifyContent: 'space-between',
		flexWrap: 'wrap',
		gap: 16,
		paddingBottom: 16,
		marginBottom: 24,
		borderBottom: `1px solid ${C.border}`,
	},
	titleRow: { display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' },
	h1: { fontSize: 22, fontWeight: 700, margin: 0 },
	badge: {
		fontSize: 12,
		padding: '3px 10px',
		borderRadius: 999,
		background: C.warnSoft,
		color: C.warnText,
		border: `1px solid ${C.warnBorder}`,
	},
	subtitle: { fontSize: 14, color: C.muted, margin: '6px 0 0', lineHeight: 1.5 },
	stepper: { display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
	card: {
		background: '#fff',
		border: `1px solid ${C.cardBorder}`,
		borderRadius: 16,
		padding: 32,
		boxShadow: '0 1px 2px rgba(16,24,40,0.04)',
	},
	cardTitle: { fontSize: 18, fontWeight: 700, margin: '0 0 4px' },
	cardDesc: { fontSize: 14, color: C.muted, margin: '0 0 28px', lineHeight: 1.5 },
	group: { marginBottom: 28 },
	label: { display: 'block', fontSize: 14, fontWeight: 600, marginBottom: 8 },
	required: { color: C.danger, marginLeft: 3 },
	field: {
		width: '100%',
		boxSizing: 'border-box',
		background: C.field,
		border: `1px solid ${C.border}`,
		borderRadius: 10,
		fontSize: 14,
		padding: '10px 14px',
		color: C.text,
		fontFamily: 'inherit',
		outline: 'none',
		transition: 'border-color 0.15s, box-shadow 0.15s',
	},
	fieldFocus: {
		borderColor: C.brand,
		boxShadow: `0 0 0 3px ${C.brandSoft}`,
	},
	fieldError: { borderColor: C.danger },
	errorText: {
		display: 'flex',
		alignItems: 'center',
		gap: 4,
		fontSize: 12,
		color: C.danger,
		marginTop: 6,
	},
	hint: { fontSize: 12, color: C.muted },
	footer: {
		display: 'flex',
		justifyContent: 'flex-end',
		alignItems: 'center',
		gap: 12,
		marginTop: 24,
	},
};

const StepIndicator = ({ activeIndex }) => (
	<div style={styles.stepper} aria-label="Alur pembuatan microlearning">
		{STEPS.map((step, i) => {
			const active = i === activeIndex;
			return (
				<React.Fragment key={step}>
					<div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
						<span
							style={{
								width: 22,
								height: 22,
								borderRadius: '50%',
								display: 'inline-flex',
								alignItems: 'center',
								justifyContent: 'center',
								fontSize: 12,
								fontWeight: 600,
								background: active ? C.brand : C.field,
								color: active ? '#fff' : C.muted,
								border: `1px solid ${active ? C.brand : C.border}`,
							}}
						>
							{i + 1}
						</span>
						<span
							style={{
								fontSize: 13,
								fontWeight: active ? 600 : 400,
								color: active ? C.text : C.muted,
							}}
						>
							{step}
						</span>
					</div>
					{i < STEPS.length - 1 && (
						<span
							style={{ width: 20, height: 1, background: C.border }}
							aria-hidden="true"
						/>
					)}
				</React.Fragment>
			);
		})}
	</div>
);

const CreateLearningPage = () => {
	const navigate = useNavigate();

	const [title, setTitle] = useState('');
	const [description, setDescription] = useState('');
	const [categories, setCategories] = useState([]);
	const [newCategory, setNewCategory] = useState('');
	const [imageCover, setImageCover] = useState(null); // { file, url }

	const [focused, setFocused] = useState('');
	const [errors, setErrors] = useState({});
	const [status] = useState('Draft');
	const [isSaving, setIsSaving] = useState(false);
	const [isSaved, setIsSaved] = useState(false);
	const [submitError, setSubmitError] = useState('');

	const fileInputRef = useRef(null);
	const redirectTimer = useRef(null);

	// Bersihkan object URL & timer saat unmount / ganti gambar
	useEffect(() => {
		return () => {
			if (imageCover?.url) URL.revokeObjectURL(imageCover.url);
		};
	}, [imageCover]);

	useEffect(() => () => clearTimeout(redirectTimer.current), []);

	const fieldStyle = (name) => ({
		...styles.field,
		...(focused === name ? styles.fieldFocus : {}),
		...(errors[name] ? styles.fieldError : {}),
	});

	const clearError = (name) =>
		setErrors((prev) => {
			if (!prev[name]) return prev;
			const next = { ...prev };
			delete next[name];
			return next;
		});

	// Kategori
	const addCategory = (value) => {
		const clean = value.trim();
		if (!clean) return;
		const exists = categories.some((c) => c.toLowerCase() === clean.toLowerCase());
		if (!exists) setCategories((prev) => [...prev, clean]);
		setNewCategory('');
		clearError('categories');
	};

	const removeCategory = (cat) => setCategories((prev) => prev.filter((c) => c !== cat));

	const handleCategoryKeyDown = (e) => {
		if (e.key === 'Enter' || e.key === ',') {
			e.preventDefault();
			addCategory(newCategory);
		} else if (e.key === 'Backspace' && !newCategory && categories.length) {
			setCategories((prev) => prev.slice(0, -1));
		}
	};

	// Gambar sampul
	const handleImageChange = (e) => {
		const file = e.target.files?.[0];
		e.target.value = ''; // izinkan pilih file yang sama lagi
		if (!file) return;

		if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
			setErrors((prev) => ({ ...prev, image: 'Format harus PNG, JPG, atau WEBP.' }));
			return;
		}
		if (file.size > MAX_IMAGE_SIZE) {
			setErrors((prev) => ({ ...prev, image: 'Ukuran gambar maksimal 2MB.' }));
			return;
		}
		setImageCover({ file, url: URL.createObjectURL(file) });
		clearError('image');
	};

	// Validasi
	const validate = () => {
		const next = {};
		if (!title.trim()) next.title = 'Judul Learning Path wajib diisi.';
		if (!description.trim()) next.description = 'Deskripsi wajib diisi.';
		if (!imageCover) next.image = 'Gambar sampul wajib diunggah.';
		if (categories.length === 0) next.categories = 'Pilih minimal satu kategori.';
		setErrors(next);
		return Object.keys(next).length === 0;
	};

	// Simpan draf
	const handleSaveDraft = async (e) => {
		e.preventDefault();
		setSubmitError('');
		if (!validate()) return;

		setIsSaving(true);
		try {
			// TODO: ganti dengan request ke backend, contoh:
			// const formData = new FormData();
			// formData.append('title', title.trim());
			// formData.append('description', description.trim());
			// formData.append('categories', JSON.stringify(categories));
			// formData.append('cover', imageCover.file);
			// const { data } = await api.post('/organizer/learning-paths', formData);
			// const learningId = data.id;
			const learningId = '123';

			setIsSaved(true);
			redirectTimer.current = setTimeout(() => {
				// Langkah berikutnya: kelola Module di dalam Learning Path
				navigate(`/organizer/learning-path/${learningId}`);
			}, 1200);
		} catch (err) {
			setSubmitError('Draf gagal disimpan. Periksa koneksi Anda lalu coba lagi.');
		} finally {
			setIsSaving(false);
		}
	};

	const availableSuggestions = SUGGESTED_CATEGORIES.filter(
		(s) => !categories.some((c) => c.toLowerCase() === s.toLowerCase()),
	);

	return (
		<div style={styles.page}>
			{/* Header */}
			<div style={styles.header}>
				<div style={{ flex: '1 1 320px' }}>
					<button
						type="button"
						onClick={() => navigate(-1)}
						style={{
							display: 'inline-flex',
							alignItems: 'center',
							gap: 6,
							background: 'none',
							border: 'none',
							padding: 0,
							marginBottom: 10,
							fontSize: 13,
							color: C.muted,
							cursor: 'pointer',
						}}
					>
						<ArrowLeft size={14} /> Kembali ke Microlearning
					</button>
					<div style={styles.titleRow}>
						<h1 style={styles.h1}>Buat Draf Learning Path</h1>
						<span style={styles.badge}>{status}</span>
					</div>
					<p style={styles.subtitle}>
						Mulai dari informasi dasar. Setelah draf tersimpan, Anda bisa menambahkan
						Module dan Lesson.
					</p>
				</div>
				<StepIndicator activeIndex={0} />
			</div>

			{/* Notifikasi */}
			{isSaved && (
				<div
					role="status"
					style={{
						display: 'flex',
						alignItems: 'center',
						gap: 8,
						padding: '12px 16px',
						marginBottom: 24,
						fontSize: 14,
						borderRadius: 10,
						background: C.successSoft,
						color: C.success,
						border: `1px solid ${C.successBorder}`,
					}}
				>
					<CheckCircle size={16} />
					<span style={{ flex: 1 }}>
						Draf Learning Path tersimpan. Mengalihkan ke pengelolaan Module…
					</span>
				</div>
			)}
			{submitError && (
				<div
					role="alert"
					style={{
						display: 'flex',
						alignItems: 'center',
						gap: 8,
						padding: '12px 16px',
						marginBottom: 24,
						fontSize: 14,
						borderRadius: 10,
						background: C.dangerSoft,
						color: C.danger,
						border: '1px solid #fecaca',
					}}
				>
					<AlertCircle size={16} />
					<span style={{ flex: 1 }}>{submitError}</span>
					<button
						type="button"
						aria-label="Tutup"
						onClick={() => setSubmitError('')}
						style={{
							background: 'none',
							border: 'none',
							cursor: 'pointer',
							color: 'inherit',
							display: 'flex',
						}}
					>
						<X size={16} />
					</button>
				</div>
			)}

			<form onSubmit={handleSaveDraft} noValidate>
				<div style={styles.card}>
					<h2 style={styles.cardTitle}>Informasi umum</h2>
					<p style={styles.cardDesc}>
						Detail ini tampil bagi calon peserta saat mereka mencari program belajar.
					</p>

					{/* Judul */}
					<div style={styles.group}>
						<label htmlFor="lp-title" style={styles.label}>
							Judul Learning Path<span style={styles.required}>*</span>
						</label>
						<input
							id="lp-title"
							type="text"
							style={fieldStyle('title')}
							value={title}
							onChange={(e) => {
								setTitle(e.target.value);
								clearError('title');
							}}
							onFocus={() => setFocused('title')}
							onBlur={() => setFocused('')}
							placeholder="Contoh: AI Engineering & RAG Masterclass"
							maxLength={120}
							aria-invalid={!!errors.title}
						/>
						{errors.title && (
							<div style={styles.errorText}>
								<AlertCircle size={13} /> {errors.title}
							</div>
						)}
					</div>

					{/* Deskripsi */}
					<div style={styles.group}>
						<label htmlFor="lp-desc" style={styles.label}>
							Deskripsi lengkap<span style={styles.required}>*</span>
						</label>
						<textarea
							id="lp-desc"
							rows={4}
							style={{
								...fieldStyle('description'),
								resize: 'vertical',
								lineHeight: 1.5,
							}}
							value={description}
							onChange={(e) => {
								setDescription(e.target.value);
								clearError('description');
							}}
							onFocus={() => setFocused('description')}
							onBlur={() => setFocused('')}
							maxLength={MAX_DESCRIPTION}
							placeholder="Jelaskan tujuan, topik, dan hasil belajar yang akan didapat peserta…"
							aria-invalid={!!errors.description}
						/>
						<div
							style={{
								display: 'flex',
								justifyContent: errors.description ? 'space-between' : 'flex-end',
								marginTop: 6,
							}}
						>
							{errors.description && (
								<span style={{ ...styles.errorText, marginTop: 0 }}>
									<AlertCircle size={13} /> {errors.description}
								</span>
							)}
							<span style={styles.hint}>
								{description.length} / {MAX_DESCRIPTION} karakter
							</span>
						</div>
					</div>

					{/* Gambar sampul */}
					<div style={styles.group}>
						<div
							style={{
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'space-between',
								flexWrap: 'wrap',
								gap: 8,
								marginBottom: 8,
							}}
						>
							<span
								style={{
									...styles.label,
									marginBottom: 0,
									display: 'flex',
									alignItems: 'center',
									gap: 6,
								}}
							>
								<ImageIcon size={15} color={C.brand} />
								Gambar sampul / banner
								<span style={{ ...styles.required, marginLeft: 0 }}>*</span>
							</span>
							<span style={styles.hint}>1280×720 px · Maks. 2MB</span>
						</div>

						<input
							ref={fileInputRef}
							id="lp-cover"
							type="file"
							accept="image/png,image/jpeg,image/webp"
							onChange={handleImageChange}
							style={{ display: 'none' }}
						/>

						{!imageCover ? (
							<button
								type="button"
								onClick={() => fileInputRef.current?.click()}
								style={{
									width: '100%',
									padding: '28px 16px',
									textAlign: 'center',
									background: C.field,
									border: `2px dashed ${errors.image ? C.danger : C.border}`,
									borderRadius: 12,
									cursor: 'pointer',
									color: C.text,
									fontFamily: 'inherit',
								}}
							>
								<Upload size={22} color={C.brand} style={{ marginBottom: 6 }} />
								<div style={{ fontSize: 14, fontWeight: 600 }}>
									Klik untuk unggah gambar banner
								</div>
								<div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>
									PNG, JPG, atau WEBP · rasio 16:9
								</div>
							</button>
						) : (
							<div style={{ display: 'flex', justifyContent: 'center', padding: 8 }}>
								<div
									style={{
										position: 'relative',
										width: '100%',
										maxWidth: 420,
										borderRadius: 14,
										overflow: 'hidden',
										border: `1px solid ${C.border}`,
										boxShadow: '0 1px 3px rgba(16,24,40,0.1)',
									}}
								>
									<img
										src={imageCover.url}
										alt="Pratinjau sampul"
										style={{
											display: 'block',
											width: '100%',
											aspectRatio: '16 / 9',
											objectFit: 'cover',
										}}
									/>
									<button
										type="button"
										aria-label="Hapus gambar sampul"
										onClick={() => setImageCover(null)}
										style={{
											position: 'absolute',
											top: 8,
											right: 8,
											width: 28,
											height: 28,
											borderRadius: '50%',
											border: 'none',
											background: C.danger,
											color: '#fff',
											display: 'flex',
											alignItems: 'center',
											justifyContent: 'center',
											cursor: 'pointer',
											boxShadow: '0 2px 6px rgba(0,0,0,0.25)',
										}}
									>
										<X size={14} />
									</button>
								</div>
							</div>
						)}
						{errors.image && (
							<div style={styles.errorText}>
								<AlertCircle size={13} /> {errors.image}
							</div>
						)}
					</div>

					{/* Kategori */}
					<div style={{ marginBottom: 0 }}>
						<label htmlFor="lp-category" style={styles.label}>
							Kategori Learning Path<span style={styles.required}>*</span>
						</label>
						<div
							onClick={() => document.getElementById('lp-category')?.focus()}
							style={{
								...fieldStyle('categories'),
								display: 'flex',
								alignItems: 'center',
								flexWrap: 'wrap',
								gap: 8,
								minHeight: 46,
								cursor: 'text',
							}}
						>
							<Tag size={15} color={C.muted} />
							{categories.map((cat) => (
								<span
									key={cat}
									style={{
										display: 'inline-flex',
										alignItems: 'center',
										gap: 6,
										padding: '3px 6px 3px 12px',
										fontSize: 13,
										fontWeight: 500,
										background: '#fff',
										border: '1px solid #cbd5e1',
										borderRadius: 8,
									}}
								>
									{cat}
									<button
										type="button"
										aria-label={`Hapus kategori ${cat}`}
										onClick={(e) => {
											e.stopPropagation();
											removeCategory(cat);
										}}
										style={{
											display: 'flex',
											background: 'none',
											border: 'none',
											padding: 2,
											cursor: 'pointer',
											color: C.muted,
										}}
									>
										<X size={13} />
									</button>
								</span>
							))}
							<input
								id="lp-category"
								type="text"
								value={newCategory}
								onChange={(e) => setNewCategory(e.target.value)}
								onKeyDown={handleCategoryKeyDown}
								onFocus={() => setFocused('categories')}
								onBlur={() => {
									setFocused('');
									addCategory(newCategory);
								}}
								placeholder={
									categories.length === 0
										? 'Ketik kategori lalu tekan Enter…'
										: 'Tambah…'
								}
								style={{
									flex: '1 1 120px',
									minWidth: 120,
									border: 'none',
									background: 'transparent',
									outline: 'none',
									fontSize: 14,
									color: C.text,
									fontFamily: 'inherit',
								}}
							/>
							{categories.length > 0 && (
								<button
									type="button"
									aria-label="Hapus semua kategori"
									onClick={(e) => {
										e.stopPropagation();
										setCategories([]);
									}}
									style={{
										display: 'flex',
										background: 'none',
										border: 'none',
										padding: 2,
										cursor: 'pointer',
										color: C.muted,
									}}
								>
									<X size={15} />
								</button>
							)}
						</div>
						{errors.categories && (
							<div style={styles.errorText}>
								<AlertCircle size={13} /> {errors.categories}
							</div>
						)}

						{availableSuggestions.length > 0 && (
							<div
								style={{
									display: 'flex',
									flexWrap: 'wrap',
									alignItems: 'center',
									gap: 8,
									marginTop: 10,
								}}
							>
								<span style={styles.hint}>Saran:</span>
								{availableSuggestions.map((s) => (
									<button
										key={s}
										type="button"
										onClick={() => addCategory(s)}
										style={{
											padding: '3px 10px',
											fontSize: 12,
											color: C.brand,
											background: C.brandSoft,
											border: 'none',
											borderRadius: 999,
											cursor: 'pointer',
											fontFamily: 'inherit',
										}}
									>
										+ {s}
									</button>
								))}
							</div>
						)}
					</div>
				</div>

				{/* Aksi */}
				<div style={styles.footer}>
					<button
						type="button"
						onClick={() => navigate(-1)}
						disabled={isSaving || isSaved}
						style={{
							padding: '10px 20px',
							fontSize: 14,
							fontWeight: 600,
							color: C.text,
							background: '#fff',
							border: `1px solid ${C.border}`,
							borderRadius: 10,
							cursor: isSaving || isSaved ? 'not-allowed' : 'pointer',
							fontFamily: 'inherit',
						}}
					>
						Batal
					</button>
					<button
						type="submit"
						disabled={isSaving || isSaved}
						style={{
							display: 'inline-flex',
							alignItems: 'center',
							gap: 8,
							padding: '10px 22px',
							fontSize: 14,
							fontWeight: 600,
							color: '#fff',
							background: C.brand,
							border: `1px solid ${C.brand}`,
							borderRadius: 10,
							boxShadow: '0 1px 2px rgba(16,24,40,0.1)',
							cursor: isSaving || isSaved ? 'not-allowed' : 'pointer',
							opacity: isSaving || isSaved ? 0.7 : 1,
							fontFamily: 'inherit',
						}}
					>
						{isSaved ? <Check size={16} /> : <Save size={16} />}
						{isSaving ? 'Menyimpan…' : isSaved ? 'Tersimpan' : 'Simpan Learning Path'}
					</button>
				</div>
			</form>
		</div>
	);
};

export default CreateLearningPage;
