const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');

// 1. Update CertificatePublicView.jsx
const certPublicPath = path.resolve(rootDir, 'frontend/src/pages/certificate/CertificatePublicView.jsx');
let certPublicContent = fs.readFileSync(certPublicPath, 'utf8');

// Ensure LogoKampusX import exists
if (!certPublicContent.includes("import LogoKampusX from '../../assets/images/logo/Logo_KampusX.svg'")) {
  certPublicContent = certPublicContent.replace(
    "import { formatDate } from '@/utils/dateUtils';",
    "import { formatDate } from '@/utils/dateUtils';\nimport LogoKampusX from '../../assets/images/logo/Logo_KampusX.svg';"
  );
}

// In FallbackCertificate, replace the letter K and KAMPUSX text with LogoKampusX image
const oldBannerRegex = /<div className="d-flex align-items-center justify-content-center gap-2 mb-1">[\s\S]*?<div style=\{\{[\s\S]*?width: '28px'[\s\S]*?K[\s\S]*?<\/div>[\s\S]*?<span style=\{\{[\s\S]*?KAMPUSX[\s\S]*?<\/span>[\s\S]*?<span style=\{\{ fontSize: '11px', letterSpacing: '1.5px', color: '#64748b'/;

if (oldBannerRegex.test(certPublicContent)) {
  certPublicContent = certPublicContent.replace(
    oldBannerRegex,
    `<div className="d-flex align-items-center justify-content-center gap-2 mb-1">
                    <img
                        src={LogoKampusX}
                        alt="KampusX Logo"
                        style={{ height: '32px', width: 'auto', objectFit: 'contain' }}
                    />
                    <span style={{ fontSize: '11px', letterSpacing: '1.5px', color: '#64748b'`
  );
  console.log('Updated logo banner in CertificatePublicView.jsx');
} else {
  console.log('Old banner pattern not found or already replaced in CertificatePublicView.jsx');
}

// Update contract address default in FallbackCertificate
certPublicContent = certPublicContent.replace(
  "contractAddress = '0x71C849Aa68364d9E4105B853e5e4E9Fa65749A32'",
  "contractAddress = '0xc0eA36D5bbd3056682Fd8a9EBB06015Eb00bCaA5'"
);
certPublicContent = certPublicContent.replace(
  "contractAddress || '0x71C849Aa68364d9E4105B853e5e4E9Fa65749A32'",
  "contractAddress || '0xc0eA36D5bbd3056682Fd8a9EBB06015Eb00bCaA5'"
);

// Update fetchCertificate in CertificatePublicView to also fetch from /certificates/{ticketCode} first
if (!certPublicContent.includes("api.get(`/certificates/${ticketCode}`)")) {
  certPublicContent = certPublicContent.replace(
    "// 1. Coba panggil API Render",
    `// 0. Coba endpoint langsung /certificates/{ticketCode}
                const directRes = await api.get(\`/certificates/\${ticketCode}\`).catch(() => null);
                if (directRes?.data?.success && directRes.data.data) {
                    setCertData(directRes.data.data);
                    return;
                }

                // 1. Coba panggil API Render`
  );
  console.log('Added /certificates/{ticketCode} API check in CertificatePublicView.jsx');
}

// Update mapping variables in CertificatePublicView
certPublicContent = certPublicContent.replace(
  "const attendeeName = certData?.ticket?.attendee_name || certData?.attendee_name || 'Peserta KampusX';",
  "const attendeeName = certData?.student_name || certData?.ticket?.attendee_name || certData?.attendee_name || 'Peserta KampusX';"
);
certPublicContent = certPublicContent.replace(
  "const eventTitle = certData?.event?.title || certData?.event_title || 'Event KampusX';",
  "const eventTitle = certData?.event_title || certData?.event?.title || 'Event KampusX';"
);
certPublicContent = certPublicContent.replace(
  "const organizerName = certData?.event?.organizer_name || certData?.organizer_name || 'KampusX Organizer';",
  "const organizerName = certData?.issuer || certData?.event?.organizer_name || certData?.organizer_name || 'KampusX Verified Authority & GDSC Indonesia';"
);
certPublicContent = certPublicContent.replace(
  "const certificateNumber = certData?.ticket?.ticket_code || certData?.certificate_number || ticketCode;",
  "const certificateNumber = certData?.ticket_code || certData?.ticket?.ticket_code || certData?.certificate_number || ticketCode;"
);

fs.writeFileSync(certPublicPath, certPublicContent, 'utf8');
console.log('Saved CertificatePublicView.jsx');

// 2. Update CertificateFileModal.jsx
const certModalPath = path.resolve(rootDir, 'frontend/src/pages/public/PublicProfile/CertificateFileModal.jsx');
let certModalContent = fs.readFileSync(certModalPath, 'utf8');

if (!certModalContent.includes("import LogoKampusX from '@/assets/images/logo/Logo_KampusX.svg'")) {
  certModalContent = certModalContent.replace(
    "import html2pdf from 'html2pdf.js';",
    "import html2pdf from 'html2pdf.js';\nimport LogoKampusX from '@/assets/images/logo/Logo_KampusX.svg';"
  );
}

const oldModalBannerRegex = /<div className="d-flex align-items-center justify-content-center gap-2 mb-2">[\s\S]*?<div[\s\S]*?style=\{\{[\s\S]*?width: '32px'[\s\S]*?K[\s\S]*?<\/div>[\s\S]*?<span[\s\S]*?KAMPUSX[\s\S]*?<\/span>[\s\S]*?<span[\s\S]*?• VERIFIED CREDENTIALS[\s\S]*?<\/span>[\s\S]*?<\/div>/;

if (oldModalBannerRegex.test(certModalContent)) {
  certModalContent = certModalContent.replace(
    oldModalBannerRegex,
    `<div className="d-flex align-items-center justify-content-center gap-2 mb-2">
                <img
                  src={LogoKampusX}
                  alt="KampusX Logo"
                  style={{ height: '34px', width: 'auto', objectFit: 'contain' }}
                />
                <span
                  style={{
                    fontSize: '11px',
                    letterSpacing: '1.5px',
                    color: '#64748b',
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    fontWeight: 700
                  }}
                >
                  • VERIFIED CREDENTIALS
                </span>
              </div>`
  );
  console.log('Updated logo banner in CertificateFileModal.jsx');
} else {
  console.log('Old modal banner pattern not found or already replaced in CertificateFileModal.jsx');
}

fs.writeFileSync(certModalPath, certModalContent, 'utf8');
console.log('Saved CertificateFileModal.jsx');
