import React, { useState } from 'react';
import { Form, Button, Alert } from 'react-bootstrap';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Facebook, Twitter, Github } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

const LoginPage = () => {
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [errorMsg, setErrorMsg] = useState('');
	const [loading, setLoading] = useState(false);

	const navigate = useNavigate();
	const location = useLocation();
	const { login } = useAuth();

	const from = location.state?.from || '/';

	const handleLogin = async (e) => {
		e.preventDefault();
		setErrorMsg('');
		setLoading(true);
		try {
			const response = await axios.post(
				'http://localhost:8000/api/login',
				{
					email: email,
					password: password,
				},
				{
					headers: { Accept: 'application/json' },
				},
			);

			login(response.data.access_token, response.data.data);

			// alert('Login Berhasil!');
			// console.log('User Info:', response.data.data);
			navigate(from, { replace: true });
		} catch (error) {
			if (error.response && error.response.data.errors) {
				setErrorMsg(error.response.data.errors.email[0]);
			} else if (error.response && error.response.data.message) {
				setErrorMsg(error.response.data.message);
			} else {
				setErrorMsg('Terjadi kesalahan pada server.');
			}
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="w-100 mt-5 pt-5" style={{ maxWidth: '400px' }}>
			<div className="text-center mb-4">
				<h3 className="fw-bold" style={{ color: 'var(--color-text)' }}>
					Enter your info to login
				</h3>
				<p className="text-muted" style={{ fontSize: 'var(--font-sm)' }}>
					or{' '}
					<Link
						to="/register"
						className="text-decoration-none fw-semibold"
						style={{ color: 'var(--color-primary)' }}>
						get started with a new account
					</Link>
				</p>
			</div>

			{/* Tampilkan pesan error jika ada */}
			{errorMsg && <Alert variant="danger">{errorMsg}</Alert>}

			<Form onSubmit={handleLogin}>
				<Form.Group className="mb-3" controlId="formEmail">
					<Form.Label
						className="fw-semibold"
						style={{
							fontSize: 'var(--font-sm)',
							color: 'var(--color-text)',
						}}>
						Email / Phone Number
					</Form.Label>
					<Form.Control
						type="email"
						placeholder="johndoe@gmail.com"
						className="py-2 shadow-none"
						style={{ borderColor: 'var(--color-border)' }}
						value={email} // Hubungkan dengan state
						onChange={(e) => setEmail(e.target.value)} // Update state saat diketik
						required
					/>
				</Form.Group>

				<Form.Group className="mb-2" controlId="formPassword">
					<Form.Label
						className="fw-semibold"
						style={{
							fontSize: 'var(--font-sm)',
							color: 'var(--color-text)',
						}}>
						Password
					</Form.Label>
					<Form.Control
						type="password"
						placeholder="******"
						className="py-2 shadow-none"
						style={{ borderColor: 'var(--color-border)' }}
						value={password} // Hubungkan dengan state
						onChange={(e) => setPassword(e.target.value)} // Update state saat diketik
						required
					/>
				</Form.Group>

				{/* <Form>
                <Form.Group className="mb-3" controlId="formEmail">
                    <Form.Label className="fw-semibold" style={{ fontSize: 'var(--font-sm)', color: 'var(--color-text)' }}>Email / Phone Number</Form.Label>
                    <Form.Control
                        type="email"
                        placeholder="johndoe@gmail.com"
                        className="py-2 shadow-none"
                        style={{ borderColor: 'var(--color-border)' }}
                    />
                </Form.Group>

                <Form.Group className="mb-2" controlId="formPassword">
                    <Form.Label className="fw-semibold" style={{ fontSize: 'var(--font-sm)', color: 'var(--color-text)' }}>Password</Form.Label>
                    <Form.Control
                        type="password"
                        placeholder="******"
                        className="py-2 shadow-none"
                        style={{ borderColor: 'var(--color-border)' }}
                    />
                </Form.Group> */}

				<div className="text-end mb-4">
					<Link
						to="/forgot-password"
						className="text-decoration-none"
						style={{
							fontSize: 'var(--font-xs)',
							color: 'var(--color-secondary)',
						}}>
						Lupa Password?
					</Link>
				</div>

				<button
					disabled={loading}
					type="submit"
					className="btn-primary w-100 py-2 fw-semibold border-0 text-center"
					style={{ backgroundColor: 'var(--color-primary)' }}>
					Login
				</button>
			</Form>

			<div className="d-flex align-items-center my-4">
				<hr className="flex-grow-1" style={{ borderColor: 'var(--color-border)' }} />
				<span
					className="mx-3"
					style={{
						fontSize: 'var(--font-xs)',
						color: 'var(--color-secondary)',
					}}>
					metode lain
				</span>
				<hr className="flex-grow-1" style={{ borderColor: 'var(--color-border)' }} />
			</div>

			<div className="d-flex justify-content-center gap-3 mb-4">
				<Button
					variant="light"
					className="rounded-circle d-flex align-items-center justify-content-center p-2 border"
					style={{
						width: '45px',
						height: '45px',
						borderColor: 'var(--color-border)',
					}}>
					<Facebook size={20} style={{ color: 'var(--color-secondary)' }} />
				</Button>
				<Button
					variant="light"
					className="rounded-circle d-flex align-items-center justify-content-center p-2 border"
					style={{
						width: '45px',
						height: '45px',
						borderColor: 'var(--color-border)',
					}}>
					<Twitter size={20} style={{ color: 'var(--color-secondary)' }} />
				</Button>
				<Button
					variant="light"
					className="rounded-circle d-flex align-items-center justify-content-center p-2 border"
					style={{
						width: '45px',
						height: '45px',
						borderColor: 'var(--color-border)',
					}}>
					<Github size={20} style={{ color: 'var(--color-secondary)' }} />
				</Button>
			</div>

			<div className="text-center">
				<Link
					to="/register"
					className="text-decoration-none"
					style={{
						fontSize: 'var(--font-sm)',
						color: 'var(--color-secondary)',
					}}>
					belum punya akun?
				</Link>
			</div>
		</div>
	);
};

export default LoginPage;
