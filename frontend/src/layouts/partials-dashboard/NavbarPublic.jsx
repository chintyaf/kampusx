import React from "react";
import { Link } from "react-router-dom";
import { Container, Button } from "react-bootstrap";

const NavbarPublic = () => {
    return (
        <nav className="navbar bg-white border-bottom py-3 shadow-sm">
            <Container className="d-flex justify-content-between align-items-center">
                <Link to="/" className="navbar-brand fw-bold text-primary">
                    KampusX
                </Link>
                <div className="d-flex gap-3 me-2" >
                    <Link to="/signin">
                        <Button variant="outline-primary" >Log In</Button>
                    </Link>
                    <Link to="/signup">
                        <Button variant="primary" >Sign Up</Button>
                    </Link>
                </div>
            </Container>
        </nav>
    );
};

export default NavbarPublic;