// features/certificate-tool/index.js

// Cara 1: Kalau lo pakai 'export default' di filenya
export { default as CertificateList } from './components/list/CertificateList';
export { default as CertificateCard } from './components/list/CertificateCard';
// export { default as CertificateBuilder } from './components/builder/CertificateBuilder';

// Cara 2: Kalau nanti lo punya fungsi API, bisa juga di-export dari sini
// export * from './api/certificateApi';
