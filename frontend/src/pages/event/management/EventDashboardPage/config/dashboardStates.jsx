/* ─── Page Component ──────────────────────────────────────────────────────── */
// Bisa diletakkan di file terpisah (misal: config/dashboardStates.js) atau di atas komponen utama
export const DASHBOARD_CONFIG = {
    draft: {
        theme: 'amber',
        badgeText: 'Draft · Belum Dipublikasikan',
        headerBorder: 'border-amber-400',
        primaryCTA: { label: 'Publish Event', action: 'publish', icon: 'Upload' },
        secondaryCTA: { label: 'Preview Tampilan', action: 'preview' },
        showStats: false,
        uiFlags: {
            alertMissingInfo: true, // Membedakan border MissingInfo jadi amber/berkedip
            collapseStaticInfo: false,
        }
    },
    published: {
        theme: 'blue',
        badgeText: 'Live · Pendaftaran Terbuka',
        headerBorder: 'border-blue-500',
        primaryCTA: { label: 'Bagikan Event', action: 'share', icon: 'Share2' },
        secondaryCTA: null,
        showStats: true,
        uiFlags: {
            showProgressBar: true, // Menampilkan progress bar di StatCard 'Tickets Sold'
            alertMissingInfo: false,
            collapseStaticInfo: false,
        }
    },
    ongoing: {
        theme: 'emerald',
        badgeText: 'Ongoing · Sedang Berlangsung',
        headerBorder: 'border-emerald-500',
        primaryCTA: { label: 'Buka Scanner Absensi', action: 'scanner', icon: 'ScanFace' },
        secondaryCTA: null,
        showStats: true,
        uiFlags: {
            showProgressBar: false,
            alertMissingInfo: false,
            collapseStaticInfo: true, // Menyembunyikan info statis ke dalam accordion
        }
    },
    completed: {
        theme: 'slate',
        badgeText: 'Completed · Acara Selesai',
        headerBorder: 'border-slate-800',
        primaryCTA: { label: 'Kirim Sertifikat', action: 'certificate', icon: 'Award' },
        secondaryCTA: { label: 'Download Laporan', action: 'download' },
        showStats: true,
        uiFlags: {
            showProgressBar: false,
            alertMissingInfo: false,
            collapseStaticInfo: false,
        }
    }
};
