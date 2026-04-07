// pages/NotFound.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
    return (
        <div style={{ textAlign: 'center', padding: '50px' }}>
            <h1>404 - Halaman Tidak Ditemukan</h1>
            <p>Maaf, halaman yang kamu cari tidak ada.</p>
            <Link to="/">Kembali ke Beranda</Link>
        </div>
    );
};

export default NotFound;