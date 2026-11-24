import React, { useState } from 'react';
import { Card, Form, Button } from 'react-bootstrap';
import { cardStyle, fieldStyle, T, CATEGORIES, ICONS, NETWORKS } from './config';

const EMPTY = { title: '', description: '', category: CATEGORIES[0], icon: ICONS[0], network: 'polygon' };

const BadgeForm = ({ onCreate }) => {
	const [form, setForm] = useState(EMPTY);
	const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

	const submit = (e) => {
		e.preventDefault();
		onCreate({ ...form, title: form.title.trim() });
		setForm({ ...form, title: '', description: '' });
	};

	return (
		<Card style={cardStyle}>
			<Card.Body as={Form} onSubmit={submit} className="d-grid gap-3">
				<h3 className="h6 fw-bold m-0">Buat Badge / Sertifikat Baru</h3>

				<Form.Group>
					<Form.Label className="small fw-semibold">Nama Badge / Sertifikat</Form.Label>
					<Form.Control
						style={fieldStyle}
						placeholder="Contoh: REST API Architecture Specialist"
						value={form.title}
						onChange={set('title')}
						required
					/>
				</Form.Group>

				<Form.Group>
					<Form.Label className="small fw-semibold">Deskripsi Capaian Pembelajaran</Form.Label>
					<Form.Control
						as="textarea"
						rows={3}
						style={fieldStyle}
						placeholder="Diberikan kepada peserta yang berhasil menyelesaikan seluruh modul..."
						value={form.description}
						onChange={set('description')}
					/>
				</Form.Group>

				<div className="row g-3">
					<Form.Group className="col-md-6">
						<Form.Label className="small fw-semibold">Kategori Kompetensi</Form.Label>
						<Form.Select style={fieldStyle} value={form.category} onChange={set('category')}>
							{CATEGORIES.map((c) => (
								<option key={c}>{c}</option>
							))}
						</Form.Select>
					</Form.Group>

					<Form.Group className="col-md-6">
						<Form.Label className="small fw-semibold">Tipe Penerbitan Kredensial</Form.Label>
						<Form.Select style={fieldStyle} value={form.network} onChange={set('network')}>
							{Object.entries(NETWORKS).map(([key, n]) => (
								<option key={key} value={key}>{n.option}</option>
							))}
						</Form.Select>
					</Form.Group>
				</div>

				<div>
					<div className="small fw-semibold mb-2">Pilih Lambang Badge</div>
					<div className="d-flex gap-2 flex-wrap">
						{ICONS.map((icon) => (
							<Button
								key={icon}
								type="button"
								variant="light"
								onClick={() => setForm({ ...form, icon })}
								style={{
									width: 40,
									height: 40,
									padding: 0,
									borderRadius: T.rMd,
									border: `1px solid ${form.icon === icon ? T.primary : T.border}`,
									background: form.icon === icon ? T.tint : T.card,
								}}
							>
								{icon}
							</Button>
						))}
					</div>
				</div>

				<Button
					type="submit"
					disabled={!form.title.trim()}
					className="ms-auto"
					style={{ background: T.primary, borderColor: T.primary, borderRadius: T.rMd, fontSize: T.fsm }}
				>
					Terbitkan Template Badge
				</Button>
			</Card.Body>
		</Card>
	);
};

export default BadgeForm;
