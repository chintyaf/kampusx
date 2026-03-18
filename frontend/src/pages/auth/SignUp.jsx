import React from 'react';
import { Form, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const SignUp = () => {
    return (
        <div className="w-100" style={{ maxWidth: '400px' }}>
            <div className="text-center mb-4">
                <h3 className="fw-bold" style={{ color: 'var(--color-text)' }}>Create a new account</h3>
                <p className="text-muted" style={{ fontSize: 'var(--font-sm)' }}>
                    or{' '}
                    <Link to="/signin" className="text-decoration-none fw-semibold" style={{ color: 'var(--color-primary)' }}>
                        sign in to your account
                    </Link>
                </p>
            </div>

            <Form>
                <Form.Group className="mb-3" controlId="formName">
                    <Form.Label className="fw-semibold" style={{ fontSize: 'var(--font-sm)', color: 'var(--color-text)' }}>Full Name</Form.Label>
                    <Form.Control type="text" placeholder="John Doe" className="py-2 shadow-none" style={{ borderColor: 'var(--color-border)' }} />
                </Form.Group>

                <Form.Group className="mb-3" controlId="formEmail">
                    <Form.Label className="fw-semibold" style={{ fontSize: 'var(--font-sm)', color: 'var(--color-text)' }}>Email / Phone Number</Form.Label>
                    <Form.Control type="email" placeholder="johndoe@gmail.com" className="py-2 shadow-none" style={{ borderColor: 'var(--color-border)' }} />
                </Form.Group>

                <Form.Group className="mb-4" controlId="formPassword">
                    <Form.Label className="fw-semibold" style={{ fontSize: 'var(--font-sm)', color: 'var(--color-text)' }}>Password</Form.Label>
                    <Form.Control type="password" placeholder="******" className="py-2 shadow-none" style={{ borderColor: 'var(--color-border)' }} />
                </Form.Group>

                <Button variant="primary" type="submit" className="w-100 py-2 fw-semibold border-0 mb-4" style={{ backgroundColor: 'var(--color-primary)' }}>
                    Sign Up
                </Button>
            </Form>

            <div className="text-center">
                <span style={{ fontSize: 'var(--font-sm)', color: 'var(--color-secondary)' }}>Sudah punya akun? </span>
                <Link to="/signin" className="text-decoration-none fw-semibold" style={{ fontSize: 'var(--font-sm)', color: 'var(--color-primary)' }}>
                    Sign In di sini
                </Link>
            </div>
        </div>
    );
};

export default SignUp;