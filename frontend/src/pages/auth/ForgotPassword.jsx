import React, { useState } from 'react';
import { Form, Button, Alert } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import axios from 'axios';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    
    const [step, setStep] = useState(1); // Sekarang ada 3 Step
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [errorMsg, setErrorMsg] = useState('');

    const navigate = useNavigate();

    // TAHAP 1: Minta OTP
    const handleRequestOtp = async (e) => {
        e.preventDefault();
        setIsLoading(true); setErrorMsg(''); setMessage('');

        try {
            const response = await axios.post('http://localhost:8000/api/forgot-password', { email });
            setMessage(response.data.message || 'OTP dikirim ke email!');
            setStep(2); // Pindah ke Step 2 (Input OTP)
        } catch (error) {
            setErrorMsg(error.response?.data?.message || 'Gagal mengirim OTP.');
        } finally {
            setIsLoading(false);
        }
    };

    // TAHAP 2: Verifikasi OTP
    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        setIsLoading(true); setErrorMsg(''); setMessage('');

        try {
            // Kita akan buat endpoint ini di Laravel sebentar lagi
            await axios.post('http://localhost:8000/api/verify-otp', { email, otp });
            setMessage('OTP Valid! Silakan buat password baru.');
            setStep(3); // Pindah ke Step 3 (Input Password Baru)
        } catch (error) {
            setErrorMsg(error.response?.data?.message || 'OTP salah atau kedaluwarsa.');
        } finally {
            setIsLoading(false);
        }
    };

    // TAHAP 3: Simpan Password Baru
    const handleResetPassword = async (e) => {
        e.preventDefault();
        setIsLoading(true); setErrorMsg(''); setMessage('');

        try {
            await axios.post('http://localhost:8000/api/reset-password', {
                email, otp, password: newPassword
            });
            alert('Password berhasil direset! Silakan Log In.');
            navigate('/login'); // Redirect ke halaman login setelah reset berhasil
        } catch (error) {
            setErrorMsg(error.response?.data?.message || 'Gagal mereset password.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="w-100" style={{ maxWidth: '400px' }}>
            <div className="text-center mb-4">
                <h3 className="fw-bold" style={{ color: 'var(--color-text)' }}>Reset Password</h3>
                <p className="text-muted" style={{ fontSize: 'var(--font-sm)' }}>
                    {step === 1 && "Masukkan email Anda untuk menerima kode OTP."}
                    {step === 2 && "Masukkan 6 digit kode OTP yang dikirim ke email Anda."}
                    {step === 3 && "Buat password baru untuk akun Anda."}
                </p>
            </div>

            {message && <Alert variant="success">{message}</Alert>}
            {errorMsg && <Alert variant="danger">{errorMsg}</Alert>}

            {/* STEP 1: FORM EMAIL */}
            {step === 1 && (
                <Form onSubmit={handleRequestOtp}>
                    <Form.Group className="mb-4" controlId="formEmail">
                        <Form.Label className="fw-semibold">Email Address</Form.Label>
                        <Form.Control 
                            type="email" placeholder="johndoe@gmail.com" 
                            className="py-2 shadow-none" required
                            value={email} onChange={(e) => setEmail(e.target.value)}
                        />
                    </Form.Group>
                    <Button variant="primary" type="submit" disabled={isLoading} className="w-100 py-2 fw-semibold">
                        {isLoading ? 'Mengirim...' : 'Kirim Kode OTP'}
                    </Button>
                </Form>
            )}

            {/* STEP 2: FORM OTP */}
            {step === 2 && (
                <Form onSubmit={handleVerifyOtp}>
                    <Form.Group className="mb-4" controlId="formOtp">
                        <Form.Label className="fw-semibold">Kode OTP</Form.Label>
                        <Form.Control 
                            type="text" placeholder="Masukkan 6 digit OTP" 
                            className="py-2 shadow-none text-center fs-5 letter-spacing-2" 
                            maxLength={6} required
                            value={otp} onChange={(e) => setOtp(e.target.value)}
                        />
                    </Form.Group>
                    <Button variant="primary" type="submit" disabled={isLoading} className="w-100 py-2 fw-semibold">
                        {isLoading ? 'Memverifikasi...' : 'Verifikasi OTP'}
                    </Button>
                </Form>
            )}

            {/* STEP 3: FORM PASSWORD BARU */}
            {step === 3 && (
                <Form onSubmit={handleResetPassword}>
                    <Form.Group className="mb-4" controlId="formNewPassword">
                        <Form.Label className="fw-semibold">Password Baru</Form.Label>
                        <Form.Control 
                            type="password" placeholder="Minimal 6 karakter" 
                            className="py-2 shadow-none" required
                            value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                        />
                    </Form.Group>
                    <Button variant="success" type="submit" disabled={isLoading} className="w-100 py-2 fw-semibold">
                        {isLoading ? 'Menyimpan...' : 'Simpan Password Baru'}
                    </Button>
                </Form>
            )}

            <div className="text-center mt-4">
                <Link to="/login" className="text-decoration-none fw-semibold">
                    <ArrowLeft size={16} className="me-2" /> Kembali ke Log In
                </Link>
            </div>
        </div>
    );
};

export default ForgotPassword;