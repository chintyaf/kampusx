const fs = require('fs');
const path = require('path');

const targetPath = path.resolve(__dirname, '../../frontend/src/pages/event/public/EventDetail/index.jsx');
let content = fs.readFileSync(targetPath, 'utf8');

// 1. Add isLockingSeat and lockError states if not present
if (!content.includes('isLockingSeat')) {
  content = content.replace(
    /const \[toastMsg, setToastMsg\] = useState\(''\);/,
    "const [toastMsg, setToastMsg] = useState('');\r\n\tconst [isLockingSeat, setIsLockingSeat] = useState(false);\r\n\tconst [lockError, setLockError] = useState(null);"
  );
}

// 2. Replace handleLanjutPembayaran
const newFn = `const handleLanjutPembayaran = async (e) => {
\t\te.preventDefault();
\t\tconsole.log('Tombol diklik! ID event:', eventDetails?.id);

\t\tif (!user) {
\t\t\tconsole.log('User belum login, redirect ke Sign In');
\t\t\talert('Silakan Sign In terlebih dahulu untuk mendaftar dan mengunci tiket.');
\t\t\tnavigate('/login', { state: { from: location.pathname } });
\t\t\treturn;
\t\t}

\t\tif (registration.registered) {
\t\t\tif (registration.status === 'paid') {
\t\t\t\tnavigate('/my-tickets');
\t\t\t} else if (registration.status === 'pending') {
\t\t\t\tconst apiBase = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api';
\t\t\t\tconst sandboxUrl =
\t\t\t\t\tapiBase.replace('/api/v1', '').replace('/api', '') +
\t\t\t\t\t'/payment-sandbox/' +
\t\t\t\t\tregistration.order_id;
\t\t\t\twindow.location.href = sandboxUrl;
\t\t\t}
\t\t\treturn;
\t\t}

\t\t// Flow 2: Atomic Redis SETNX Seat-Locking (15 Menit)
\t\tsetIsLockingSeat(true);
\t\tsetLockError(null);
\t\ttry {
\t\t\tconst res = await api.post(\`/events/\${eventDetails?.id}/lock-seat\`, {
\t\t\t\tticket_id: selectedTicket,
\t\t\t});

\t\t\tif (res.data?.success) {
\t\t\t\tconst lockData = res.data.data;
\t\t\t\tconsole.log('Kursi berhasil dikunci via Redis SETNX:', lockData);
\t\t\t\tnavigate(\`/checkout/\${eventDetails?.id}?ticketId=\${selectedTicket}&lockToken=\${lockData.lock_token}&ttl=\${lockData.ttl_seconds}\`);
\t\t\t} else {
\t\t\t\tsetLockError(res.data?.message || 'Tiket Penuh');
\t\t\t\talert(res.data?.message || 'Tiket Penuh: Semua kursi telah dipesan atau sedang dikunci.');
\t\t\t}
\t\t} catch (err) {
\t\t\tconsole.error('Error saat seat locking:', err);
\t\t\tconst errMsg = err?.response?.data?.message || 'Tiket Penuh: Semua kuota kursi sedang dipesan atau terkunci oleh peserta lain.';
\t\t\tsetLockError(errMsg);
\t\t\talert(errMsg);
\t\t} finally {
\t\t\tsetIsLockingSeat(false);
\t\t}
\t};`;

content = content.replace(/const handleLanjutPembayaran = \(e\) => {[\s\S]*?navigate\(\`\/checkout\/\$\{eventDetails\?\.id\}\?ticketId=\$\{selectedTicket\}\`\);[\s\S]*?\};/, newFn);

fs.writeFileSync(targetPath, content, 'utf8');
console.log('EventDetail updated successfully');
