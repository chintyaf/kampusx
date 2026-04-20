import React, { useState } from 'react';
import { Form, Button, Alert } from 'react-bootstrap';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

const RegisterPage = () => {
	const [name, setName] = useState('');
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [errorMsg, setErrorMsg] = useState('');
	const [loading, setLoading] = useState(false);

	const navigate = useNavigate();
	const location = useLocation();
	const { login } = useAuth();

	const from = location.state?.from || '/';

	const handleRegister = async (e) => {
		e.preventDefault();
		setErrorMsg('');
		setLoading(true);

		try {
			const response = await axios.post(
				'http://localhost:8000/api/register',
				{
					name: name,
					email: email,
					password: password,
					// Jika ingin kirim nomor HP, tambahkan state phone juga di atas
				},
				{
					headers: { Accept: 'application/json' },
				},
			);

			// Simpan token otomatis setelah register (karena di controller register kita juga return token)
			// localStorage.setItem('token', response.data.access_token);
			// localStorage.setItem('user', JSON.stringify(response.data.data));
			login(response.data.access_token, response.data.data);

			// alert('Registrasi Berhasil!');
			navigate(from, { replace: true });
		} catch (error) {
			if (error.response && error.response.data.errors) {
				// Menampilkan error validasi dari Laravel (misal: email sudah dipakai)
				const errors = error.response.data.errors;
				const firstError = Object.values(errors)[0][0];
				setErrorMsg(firstError);
			} else {
				setErrorMsg('Gagal melakukan registrasi.');
			}
		}
	};

	return (
		<div className="w-100" style={{ maxWidth: '400px' }}>
			<div className="text-center mb-4">
				<h3 className="fw-bold" style={{ color: 'var(--color-text)' }}>
					Create a new account
				</h3>
				<p className="text-muted" style={{ fontSize: 'var(--font-sm)' }}>
					or{' '}
					<Link
						to="/login"
						className="text-decoration-none fw-semibold"
						style={{ color: 'var(--color-primary)' }}>
						Login to your account
					</Link>
				</p>
			</div>

			{errorMsg && <Alert variant="danger">{errorMsg}</Alert>}

			<Form onSubmit={handleRegister}>
				<Form.Group className="mb-3" controlId="formName">
					<Form.Label className="fw-semibold">Full Name</Form.Label>
					<Form.Control
						type="text"
						placeholder="John Doe"
						value={name}
						onChange={(e) => setName(e.target.value)}
						required
					/>
				</Form.Group>

				<Form.Group className="mb-3" controlId="formEmail">
					<Form.Label className="fw-semibold">Email</Form.Label>
					<Form.Control
						type="email"
						placeholder="johndoe@gmail.com"
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						required
					/>
				</Form.Group>

				<Form.Group className="mb-4" controlId="formPassword">
					<Form.Label className="fw-semibold">Password</Form.Label>
					<Form.Control
						type="password"
						placeholder="******"
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						required
					/>
				</Form.Group>
				<button
					disabled={loading}
					type="submit"
					className="btn-primary w-100 py-2 fw-semibold border-0 text-center"
					style={{ backgroundColor: 'var(--color-primary)' }}>
					Register
				</button>
			</Form>

			<div className="text-center">
				<span style={{ fontSize: 'var(--font-sm)', color: 'var(--color-secondary)' }}>
					Sudah punya akun?{' '}
				</span>
				<Link
					to="/login"
					className="text-decoration-none fw-semibold"
					style={{ fontSize: 'var(--font-sm)', color: 'var(--color-primary)' }}>
					Login di sini
				</Link>
			</div>
		</div>
	);
};

export default RegisterPage;
