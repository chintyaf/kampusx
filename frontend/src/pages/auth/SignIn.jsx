import React from 'react';
import { Form, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Github } from 'lucide-react'; // Anggap ini icon social login

const SignIn = () => {
    return (
        <div className="w-100" style={{ maxWidth: '400px' }}>
            <div className="text-center mb-4">
                <h3 className="fw-bold" style={{ color: 'var(--color-text)' }}>Enter your info to sign in</h3>
                <p className="text-muted" style={{ fontSize: 'var(--font-sm)' }}>
                    or{' '}
                    <Link to="/signup" className="text-decoration-none fw-semibold" style={{ color: 'var(--color-primary)' }}>
                        get started with a new account
                    </Link>
                </p>
            </div>

            <Form>
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
                </Form.Group>

                <div className="text-end mb-4">
                    <Link to="/forgot-password" className="text-decoration-none" style={{ fontSize: 'var(--font-xs)', color: 'var(--color-secondary)' }}>
                        Lupa Password?
                    </Link>
                </div>

                <Button 
                    variant="primary" 
                    type="submit" 
                    className="w-100 py-2 fw-semibold border-0" 
                    style={{ backgroundColor: 'var(--color-primary)' }}
                >
                    Sign In
                </Button>
            </Form>

            {/* Divider "metode lain" */}
            <div className="d-flex align-items-center my-4">
                <hr className="flex-grow-1" style={{ borderColor: 'var(--color-border)' }} />
                <span className="mx-3" style={{ fontSize: 'var(--font-xs)', color: 'var(--color-secondary)' }}>metode lain</span>
                <hr className="flex-grow-1" style={{ borderColor: 'var(--color-border)' }} />
            </div>

            {/* Social Login Icons */}
            <div className="d-flex justify-content-center gap-3 mb-4">
                <Button variant="light" className="rounded-circle d-flex align-items-center justify-content-center p-2 border" style={{ width: '45px', height: '45px', borderColor: 'var(--color-border)' }}>
                    <Facebook size={20} style={{ color: 'var(--color-secondary)' }} />
                </Button>
                <Button variant="light" className="rounded-circle d-flex align-items-center justify-content-center p-2 border" style={{ width: '45px', height: '45px', borderColor: 'var(--color-border)' }}>
                    <Twitter size={20} style={{ color: 'var(--color-secondary)' }} />
                </Button>
                <Button variant="light" className="rounded-circle d-flex align-items-center justify-content-center p-2 border" style={{ width: '45px', height: '45px', borderColor: 'var(--color-border)' }}>
                    <Github size={20} style={{ color: 'var(--color-secondary)' }} />
                </Button>
            </div>

            <div className="text-center">
                <Link to="/signup" className="text-decoration-none" style={{ fontSize: 'var(--font-sm)', color: 'var(--color-secondary)' }}>
                    belum punya akun?
                </Link>
            </div>
        </div>
    );
};

export default SignIn;