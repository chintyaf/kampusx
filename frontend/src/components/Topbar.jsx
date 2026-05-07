import React from 'react';
import { Bell, Search } from 'lucide-react';
import './Topbar.css';

const PAGE_META = {
  editor: {
    title: 'Editor Template',
    sub: 'Desain dan mapping elemen sertifikat · Organizer Dashboard',
    tag: 'Organizer',
    tagColor: 'purple',
  },
  distribusi: {
    title: 'Manajemen Distribusi',
    sub: 'Atur prasyarat dan rilis sertifikat · Organizer Dashboard',
    tag: 'Organizer',
    tagColor: 'purple',
  },
  vault: {
    title: 'Sertifikat Vault',
    sub: 'Koleksi sertifikat kamu · Peserta PWA',
    tag: 'Peserta',
    tagColor: 'green',
  },
  verify: {
    title: 'Verifikasi Sertifikat',
    sub: 'Halaman publik · Dapat diakses tanpa login via QR Code',
    tag: 'Publik',
    tagColor: 'amber',
  },
};

const Topbar = ({ activePage }) => {
  const meta = PAGE_META[activePage] || PAGE_META.editor;

  return (
    <header className="topbar">
      <div className="topbar-left">
        <div className="topbar-title-row">
          <h1 className="topbar-title">{meta.title}</h1>
          <span className={`topbar-tag topbar-tag--${meta.tagColor}`}>{meta.tag}</span>
        </div>
        <p className="topbar-sub">{meta.sub}</p>
      </div>

      <div className="topbar-right">
        <button className="topbar-icon-btn">
          <Search size={16} />
        </button>
        <button className="topbar-icon-btn notif-btn">
          <Bell size={16} />
          <span className="notif-badge" />
        </button>
        <div className="topbar-avatar">CA</div>
      </div>
    </header>
  );
};

export default Topbar;
