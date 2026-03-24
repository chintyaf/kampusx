import React, { useState } from "react";
import { Form, Button, Alert } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { Facebook, Twitter, Github } from "lucide-react"; // Anggap ini icon social login
import axios from "axios";

const SignIn = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [errorMsg, setErrorMsg] = useState("");

    const navigate = useNavigate();
    const handleLogin = async (e) => {
        e.preventDefault(); // Cegah reload halaman
        setErrorMsg(""); // Reset pesan error
        try {
            const response = await axios.post(
                "http://localhost:8000/api/login",
                {
                    email: email,
                    password: password,
                },
                {
                    headers: { Accept: "application/json" },
                },
            );

            // Simpan token dan info user di localStorage
            localStorage.setItem("token", response.data.access_token);
            localStorage.setItem("user", JSON.stringify(response.data.data));

            alert("Login Berhasil!");
            navigate("/"); // Pindahkan ke halaman yang diinginkan
        } catch (error) {
            if (error.response && error.response.data.errors) {
                // Error validasi (email/password salah)
                setErrorMsg(error.response.data.errors.email[0]);
            } else if (error.response && error.response.data.message) {
                setErrorMsg(error.response.data.message);
            } else {
                setErrorMsg("Terjadi kesalahan pada server.");
            }
        }
    };

    return (
        <div className="w-100" style={{ maxWidth: "400px" }}>
            <div className="text-center mb-4">
                <h3 className="fw-bold" style={{ color: "var(--color-text)" }}>
                    Enter your info to sign in
                </h3>
                <p
                    className="text-muted"
                    style={{ fontSize: "var(--font-sm)" }}
                >
                    or{" "}
                    <Link
                        to="/signup"
                        className="text-decoration-none fw-semibold"
                        style={{ color: "var(--color-primary)" }}
                    >
                        get started with a new account
                    </Link>
                </p>
            </div>

            {/* Tampilkan pesan error jika ada */}
            {errorMsg && <Alert variant="danger">{errorMsg}</Alert>}

            {/* Tambahkan onSubmit di sini 👇 */}
            <Form onSubmit={handleLogin}>
                <Form.Group className="mb-3" controlId="formEmail">
                    <Form.Label
                        className="fw-semibold"
                        style={{
                            fontSize: "var(--font-sm)",
                            color: "var(--color-text)",
                        }}
                    >
                        Email / Phone Number
                    </Form.Label>
                    <Form.Control
                        type="email"
                        placeholder="johndoe@gmail.com"
                        className="py-2 shadow-none"
                        style={{ borderColor: "var(--color-border)" }}
                        value={email} // Hubungkan dengan state
                        onChange={(e) => setEmail(e.target.value)} // Update state saat diketik
                        required
                    />
                </Form.Group>

                <Form.Group className="mb-2" controlId="formPassword">
                    <Form.Label
                        className="fw-semibold"
                        style={{
                            fontSize: "var(--font-sm)",
                            color: "var(--color-text)",
                        }}
                    >
                        Password
                    </Form.Label>
                    <Form.Control
                        type="password"
                        placeholder="******"
                        className="py-2 shadow-none"
                        style={{ borderColor: "var(--color-border)" }}
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
                            fontSize: "var(--font-xs)",
                            color: "var(--color-secondary)",
                        }}
                    >
                        Lupa Password?
                    </Link>
                </div>

                <Button
                    variant="primary"
                    type="submit"
                    className="w-100 py-2 fw-semibold border-0"
                    style={{ backgroundColor: "var(--color-primary)" }}
                >
                    Sign In
                </Button>
            </Form>

            {/* Divider "metode lain" */}
            <div className="d-flex align-items-center my-4">
                <hr
                    className="flex-grow-1"
                    style={{ borderColor: "var(--color-border)" }}
                />
                <span
                    className="mx-3"
                    style={{
                        fontSize: "var(--font-xs)",
                        color: "var(--color-secondary)",
                    }}
                >
                    metode lain
                </span>
                <hr
                    className="flex-grow-1"
                    style={{ borderColor: "var(--color-border)" }}
                />
            </div>

            {/* Social Login Icons */}
            <div className="d-flex justify-content-center gap-3 mb-4">
                <Button
                    variant="light"
                    className="rounded-circle d-flex align-items-center justify-content-center p-2 border"
                    style={{
                        width: "45px",
                        height: "45px",
                        borderColor: "var(--color-border)",
                    }}
                >
                    <Facebook
                        size={20}
                        style={{ color: "var(--color-secondary)" }}
                    />
                </Button>
                <Button
                    variant="light"
                    className="rounded-circle d-flex align-items-center justify-content-center p-2 border"
                    style={{
                        width: "45px",
                        height: "45px",
                        borderColor: "var(--color-border)",
                    }}
                >
                    <Twitter
                        size={20}
                        style={{ color: "var(--color-secondary)" }}
                    />
                </Button>
                <Button
                    variant="light"
                    className="rounded-circle d-flex align-items-center justify-content-center p-2 border"
                    style={{
                        width: "45px",
                        height: "45px",
                        borderColor: "var(--color-border)",
                    }}
                >
                    <Github
                        size={20}
                        style={{ color: "var(--color-secondary)" }}
                    />
                </Button>
            </div>

            <div className="text-center">
                <Link
                    to="/signup"
                    className="text-decoration-none"
                    style={{
                        fontSize: "var(--font-sm)",
                        color: "var(--color-secondary)",
                    }}
                >
                    belum punya akun?
                </Link>
            </div>
        </div>
    );
};

export default SignIn;
