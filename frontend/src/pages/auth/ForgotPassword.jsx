import React, { useState, useRef, useEffect } from 'react';
import { Form, Button, Alert } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import api from '../../api/axios';

const ForgotPassword = () => {
    const [identifier, setIdentifier] = useState('');
    const [resolvedEmail, setResolvedEmail] = useState(''); // Stores the email resolved from the backend
    
    // OTP State
    const [otpValues, setOtpValues] = useState(['', '', '', '', '', '']);
    const otpRefs = useRef([]);
    
    // Password State
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    
    const [step, setStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [errorMsg, setErrorMsg] = useState('');

    const navigate = useNavigate();

    // Reset messages when step changes
    useEffect(() => {
        setMessage('');
        setErrorMsg('');
    }, [step]);

    // TAHAP 1: Minta OTP
    const handleRequestOtp = async (e) => {
        e.preventDefault();
        if (!identifier.trim()) {
            setErrorMsg('Silakan masukkan Email Anda');
            return;
        }
        setIsLoading(true); setErrorMsg(''); setMessage('');

        try {
            const response = await api.post('/forgot-password', { identifier });
            setMessage(response.data.message || 'OTP berhasil dikirim!');
            setResolvedEmail(response.data.email); // Save the resolved email for next steps
            setStep(2); // Pindah ke Step 2 (Input OTP)
        } catch (error) {
            setErrorMsg(error.response?.data?.message || 'Gagal mengirim OTP. Pastikan Email terdaftar.');
        } finally {
            setIsLoading(false);
        }
    };

    // TAHAP 2: Verifikasi OTP
    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        const otpCode = otpValues.join('');
        if (otpCode.length < 6) {
            setErrorMsg('Silakan masukkan 6 digit kode OTP.');
            return;
        }

        setIsLoading(true); setErrorMsg(''); setMessage('');

        try {
            await api.post('/verify-otp', { email: resolvedEmail, otp: otpCode });
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
        if (newPassword.length < 8) {
            setErrorMsg('Password minimal 8 karakter.');
            return;
        }
        if (newPassword !== confirmPassword) {
            setErrorMsg('Konfirmasi password tidak cocok.');
            return;
        }

        const otpCode = otpValues.join('');
        setIsLoading(true); setErrorMsg(''); setMessage('');

        try {
            await api.post('/reset-password', {
                email: resolvedEmail, 
                otp: otpCode, 
                password: newPassword,
                password_confirmation: confirmPassword
            });
            alert('Password berhasil direset! Silakan Log In.');
            navigate('/login'); // Redirect ke halaman login setelah reset berhasil
        } catch (error) {
            setErrorMsg(error.response?.data?.message || 'Gagal mereset password.');
        } finally {
            setIsLoading(false);
        }
    };

    // Handle OTP input change
    const handleOtpChange = (index, value) => {
        // Only allow numbers
        if (!/^\d*$/.test(value)) return;

        const newOtpValues = [...otpValues];
        // Handle paste (if pasting multiple characters into one box)
        if (value.length > 1) {
            const pastedData = value.slice(0, 6).split('');
            for (let i = 0; i < pastedData.length; i++) {
                if (index + i < 6) {
                    newOtpValues[index + i] = pastedData[i];
                }
            }
            setOtpValues(newOtpValues);
            
            // Focus on the next empty input or the last input
            const nextIndex = Math.min(index + pastedData.length, 5);
            otpRefs.current[nextIndex].focus();
            return;
        }

        newOtpValues[index] = value;
        setOtpValues(newOtpValues);

        // Move to next input if value is entered
        if (value && index < 5) {
            otpRefs.current[index + 1].focus();
        }
    };

    // Handle backspace in OTP input
    const handleOtpKeyDown = (index, e) => {
        if (e.key === 'Backspace') {
            if (!otpValues[index] && index > 0) {
                // If current input is empty, focus on previous input and clear it
                const newOtpValues = [...otpValues];
                newOtpValues[index - 1] = '';
                setOtpValues(newOtpValues);
                otpRefs.current[index - 1].focus();
            } else {
                // Let the onChange handler clear the current input
            }
        }
    };

    return (
        <div className="w-100" style={{ maxWidth: '450px' }}>
            <div className="text-center mb-4">
                <h3 className="fw-bold" style={{ color: 'var(--color-text)' }}>Reset Password</h3>
                <p className="text-muted" style={{ fontSize: 'var(--font-sm)' }}>
                    {step === 1 && "Masukkan Email Anda untuk menerima kode OTP."}
                    {step === 2 && "Masukkan 6 digit kode OTP yang dikirim ke Email Anda."}
                    {step === 3 && "Buat password baru untuk akun Anda (minimal 8 karakter)."}
                </p>
            </div>

            {message && <Alert variant="success">{message}</Alert>}
            {errorMsg && <Alert variant="danger">{errorMsg}</Alert>}

            {/* STEP 1: FORM EMAIL/PHONE */}
            {step === 1 && (
                <Form onSubmit={handleRequestOtp}>
                    <Form.Group className="mb-4" controlId="formIdentifier">
                        <Form.Label className="fw-semibold">Email</Form.Label>
                        <Form.Control 
                            type="email" placeholder="Contoh: johndoe@gmail.com" 
                            className="py-2 shadow-none" required
                            value={identifier} onChange={(e) => setIdentifier(e.target.value)}
                        />
                    </Form.Group>
                    <Button variant="primary" type="submit" disabled={isLoading} className="w-100 py-2 fw-semibold">
                        {isLoading ? 'Mengirim...' : 'Kirim Kode OTP / Link'}
                    </Button>
                </Form>
            )}

            {/* STEP 2: FORM OTP */}
            {step === 2 && (
                <Form onSubmit={handleVerifyOtp}>
                    <Form.Group className="mb-4 text-center">
                        <Form.Label className="fw-semibold d-block text-start">Kode OTP</Form.Label>
                        <div className="d-flex justify-content-between gap-2 mt-2">
                            {otpValues.map((value, index) => (
                                <Form.Control
                                    key={index}
                                    ref={(el) => (otpRefs.current[index] = el)}
                                    type="text"
                                    inputMode="numeric"
                                    maxLength={6} // Allow pasting up to 6 chars
                                    value={value}
                                    onChange={(e) => handleOtpChange(index, e.target.value)}
                                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                                    className="text-center fw-bold fs-4 shadow-none px-0"
                                    style={{ width: '50px', height: '55px', borderRadius: '10px' }}
                                    autoFocus={index === 0}
                                    required={index === 0} // Only first is strictly required to pass HTML validation, our JS handles the rest
                                />
                            ))}
                        </div>
                    </Form.Group>
                    <Button variant="primary" type="submit" disabled={isLoading} className="w-100 py-2 fw-semibold">
                        {isLoading ? 'Memverifikasi...' : 'Verifikasi OTP'}
                    </Button>
                    <div className="text-center mt-3">
                        <Button 
                            variant="link" 
                            className="text-decoration-none shadow-none text-muted" 
                            onClick={() => setStep(1)}
                            disabled={isLoading}
                        >
                            Salah kontak? Ganti Email
                        </Button>
                    </div>
                </Form>
            )}

            {/* STEP 3: FORM PASSWORD BARU */}
            {step === 3 && (
                <Form onSubmit={handleResetPassword}>
                    <Form.Group className="mb-3" controlId="formNewPassword">
                        <Form.Label className="fw-semibold">Password Baru</Form.Label>
                        <Form.Control 
                            type="password" placeholder="Minimal 8 karakter" 
                            className="py-2 shadow-none" required
                            value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                            minLength={8}
                        />
                    </Form.Group>
                    <Form.Group className="mb-4" controlId="formConfirmPassword">
                        <Form.Label className="fw-semibold">Konfirmasi Password Baru</Form.Label>
                        <Form.Control 
                            type="password" placeholder="Ketik ulang password baru" 
                            className="py-2 shadow-none" required
                            value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                            minLength={8}
                        />
                    </Form.Group>
                    <Button variant="success" type="submit" disabled={isLoading} className="w-100 py-2 fw-semibold">
                        {isLoading ? 'Menyimpan...' : 'Simpan Password Baru'}
                    </Button>
                </Form>
            )}

            <div className="text-center mt-4">
                <Link to="/login" className="text-decoration-none fw-semibold d-inline-flex align-items-center">
                    <ArrowLeft size={16} className="me-2" /> Kembali ke Log In
                </Link>
            </div>
        </div>
    );
};

export default ForgotPassword;