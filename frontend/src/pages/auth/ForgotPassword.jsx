import React from 'react';
import { Form, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const ForgotPassword = () => {
    return (
        <div className="w-100" style={{ maxWidth: '400px' }}>
            <div className="text-center mb-4">
                <h3 className="fw-bold" style={{ color: 'var(--color-text)' }}>Reset Password</h3>
                <p className="text-muted" style={{ fontSize: 'var(--font-sm)' }}>
                    Masukkan email Anda dan kami akan mengirimkan instruksi untuk mereset password.
                </p>
            </div>

            <Form>
                <Form.Group className="mb-4" controlId="formEmail">
                    <Form.Label className="fw-semibold" style={{ fontSize: 'var(--font-sm)', color: 'var(--color-text)' }}>Email Address</Form.Label>
                    <Form.Control 
                        type="email" 
                        placeholder="johndoe@gmail.com" 
                        className="py-2 shadow-none" 
                        style={{ borderColor: 'var(--color-border)' }}
                    />
                </Form.Group>

                <Button 
                    variant="primary" 
                    type="submit" 
                    className="w-100 py-2 fw-semibold border-0 mb-4" 
                    style={{ backgroundColor: 'var(--color-primary)' }}
                >
                    Kirim Link Reset
                </Button>
            </Form>

            <div className="text-center">
                <Link to="/signin" className="text-decoration-none d-inline-flex align-items-center fw-semibold" style={{ fontSize: 'var(--font-sm)', color: 'var(--color-secondary)' }}>
                    <ArrowLeft size={16} className="me-2" /> Kembali ke Sign In
                </Link>
            </div>
        </div>
    );
};

export default ForgotPassword;