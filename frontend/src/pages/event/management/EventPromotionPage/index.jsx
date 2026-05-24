import React, { useState } from "react";
import { Container, Card, Badge, Button, Modal } from "react-bootstrap";
import {
  Crown,
  TrendingUp,
  Layers,
  CheckCircle2,
  Clock,
  ChevronRight,
  Info,
} from "lucide-react";
import { Link } from "react-router-dom";

/* ─── Mock Data ─── */
const currentEvent = {
  name: "Tech Summit 2026",
  date: "12–14 Jun 2026",
};

const packages = [
  {
    key: "featured",
    icon: Crown,
    label: "Featured Banner",
    desc: "Banner event tampil di homepage dengan rotasi prioritas.",
    price: "Rp 500.000",
    duration: "14 hari",
    color: "#9333ea", // text-purple-600
    bg: "#faf5ff", // bg-purple-50
  },
  {
    key: "boost",
    icon: TrendingUp,
    label: "Event Boost",
    desc: 'Prioritas di Explore + badge "Sponsored" di listing.',
    price: "Rp 300.000",
    duration: "7 hari",
    color: "#059669", // text-emerald-600
    bg: "#ecfdf5", // bg-emerald-50
  },
  {
    key: "bundle",
    icon: Layers,
    label: "Bundle (Featured + Boost)",
    desc: "Gabungan keduanya. Hemat 20% dibanding beli terpisah.",
    price: "Rp 640.000",
    originalPrice: "Rp 800.000",
    duration: "14 hari",
    color: "#4f46e5", // text-indigo-600
    bg: "#eef2ff", // bg-indigo-50
    recommended: true,
  },
];

/* ─── Sub Components ─── */

const PaymentModal = ({ open, onClose, packageType, eventName, onSuccess }) => {
  const pkg = packages.find((p) => p.key === packageType);

  const handlePay = () => {
    if (pkg) {
      onSuccess(pkg.key);
    }
    onClose();
  };

  return (
    <Modal show={open} onHide={onClose} centered backdrop="static">
      <Modal.Header closeButton className="border-0 pb-0">
        <Modal.Title style={{ fontSize: "1.125rem", fontWeight: 600 }}>
          Konfirmasi Pembayaran
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="pt-2">
        <p className="text-muted" style={{ fontSize: "14px" }}>
          Anda akan mengaktifkan paket promosi untuk event{" "}
          <strong className="text-dark">{eventName}</strong>.
        </p>
        {pkg && (
          <div
            className="p-3 rounded-3 mb-4"
            style={{ backgroundColor: "#f8fafc", border: "1px solid #e2e8f0" }}
          >
            <div className="d-flex justify-content-between mb-2">
              <span style={{ fontSize: "14px", fontWeight: 500 }}>Paket</span>
              <span style={{ fontSize: "14px", fontWeight: 600 }}>
                {pkg.label}
              </span>
            </div>
            <div className="d-flex justify-content-between mb-2">
              <span style={{ fontSize: "14px", fontWeight: 500 }}>Durasi</span>
              <span style={{ fontSize: "14px" }}>{pkg.duration}</span>
            </div>
            <hr className="my-2" style={{ borderColor: "#cbd5e1" }} />
            <div className="d-flex justify-content-between">
              <span style={{ fontSize: "14px", fontWeight: 500 }}>Total Pembayaran</span>
              <span style={{ fontSize: "16px", fontWeight: 700, color: "#4f46e5" }}>
                {pkg.price}
              </span>
            </div>
          </div>
        )}
        <div className="d-flex gap-2 justify-content-end">
          <Button variant="outline-secondary" onClick={onClose} style={{ fontSize: "14px", fontWeight: 500 }}>
            Batal
          </Button>
          <Button
            onClick={handlePay}
            style={{
              backgroundColor: "#4f46e5",
              borderColor: "#4f46e5",
              fontSize: "14px",
              fontWeight: 500,
            }}
          >
            Bayar Sekarang
          </Button>
        </div>
      </Modal.Body>
    </Modal>
  );
};

const InfoAlert = () => (
  <div
    className="d-flex align-items-start gap-2 p-3 rounded-3 mb-4"
    style={{
      backgroundColor: "#fffbeb",
      borderColor: "#fde68a",
      borderWidth: "1px",
      borderStyle: "solid",
      color: "#b45309",
      fontSize: "14px",
    }}
  >
    <Info size={16} className="mt-1 flex-shrink-0" />
    <span>
      Promosi akan ditinjau Admin Pusat sebelum tayang. Estimasi{" "}
      <strong style={{ fontWeight: 600 }}>1×24 jam</strong>.
    </span>
  </div>
);

const PackageCard = ({
  pkg,
  promo,
  onActivate,
}) => {
  const Icon = pkg.icon;
  const isRecommended = pkg.recommended;
  const isPending = promo?.status === "pending";
  const isActive = promo?.status === "active";

  let borderColor = "#e2e8f0";
  if (isRecommended && !promo) borderColor = "#a5b4fc";
  if (isActive) borderColor = "#86efac";
  if (isPending) borderColor = "#fcd34d";

  return (
    <Card
      className="mb-3 border transition-all"
      style={{
        borderRadius: "12px",
        borderColor: borderColor,
        boxShadow: isRecommended && !promo ? "0 1px 2px 0 rgba(0, 0, 0, 0.05)" : "none",
      }}
    >
      <Card.Body className="p-3 p-sm-4 d-flex align-items-sm-center flex-column flex-sm-row gap-3">
        <div
          className="rounded-3 d-flex align-items-center justify-content-center flex-shrink-0"
          style={{
            backgroundColor: pkg.bg,
            width: "48px",
            height: "48px",
          }}
        >
          <Icon size={24} color={pkg.color} />
        </div>

        <div className="flex-grow-1">
          <div className="d-flex align-items-center gap-2 mb-1">
            <h6 className="mb-0 fw-semibold" style={{ color: "#111827", fontSize: "15px" }}>
              {pkg.label}
            </h6>
            {isRecommended && !promo && (
              <Badge
                bg=""
                className="fw-medium px-2 py-1"
                style={{
                  backgroundColor: "#e0e7ff",
                  color: "#4f46e5",
                  fontSize: "11px",
                }}
              >
                Rekomendasi
              </Badge>
            )}
          </div>
          <p className="mb-2 text-muted" style={{ fontSize: "13px" }}>
            {pkg.desc}
          </p>
          <div className="d-flex align-items-baseline gap-2">
            <span className="fw-bold" style={{ color: "#111827", fontSize: "15px" }}>
              {pkg.price}
            </span>
            {pkg.originalPrice && (
              <span
                className="text-muted text-decoration-line-through"
                style={{ fontSize: "12px" }}
              >
                {pkg.originalPrice}
              </span>
            )}
            <span className="text-muted" style={{ fontSize: "12px" }}>
              · {pkg.duration}
            </span>
          </div>
        </div>

        <div className="mt-2 mt-sm-0 flex-shrink-0">
          {promo ? (
            <div
              className="d-inline-flex align-items-center gap-1 px-3 py-2 rounded-3 fw-medium"
              style={{
                fontSize: "13px",
                backgroundColor: isPending ? "#fffbeb" : "#f0fdf4",
                color: isPending ? "#d97706" : "#16a34a",
              }}
            >
              {isPending ? (
                <>
                  <Clock size={16} /> Dalam Review
                </>
              ) : (
                <>
                  <CheckCircle2 size={16} /> Aktif
                </>
              )}
            </div>
          ) : (
            <Button
              className="d-inline-flex align-items-center gap-1 border-0 px-3 py-2"
              style={{
                backgroundColor: isRecommended ? "#4f46e5" : "#111827",
                fontSize: "13px",
                fontWeight: 500,
                borderRadius: "8px",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = isRecommended ? "#4338ca" : "#1f2937";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = isRecommended ? "#4f46e5" : "#111827";
              }}
              onClick={() => onActivate(pkg.key)}
            >
              Aktifkan <ChevronRight size={14} />
            </Button>
          )}
        </div>
      </Card.Body>
    </Card>
  );
};

/* ─── Main Page Component ─── */

const EventPromotionPage = () => {
  const [activePromos, setActivePromos] = useState([]);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const handleSuccess = (pkgKey) => {
    setActivePromos((prev) => {
      if (prev.some((p) => p.package === pkgKey)) return prev;
      return [...prev, { package: pkgKey, status: "pending" }];
    });
  };

  const openModal = (pkgKey) => {
    setSelectedPackage(pkgKey);
    setModalOpen(true);
  };

  return (
    <Container className="py-4" style={{ maxWidth: "672px" }}>
      {/* Header */}
      <div className="mb-4">
        <h4 className="fw-semibold mb-1" style={{ color: "#111827" }}>
          Promosikan Event
        </h4>
        <p className="text-muted mb-0" style={{ fontSize: "14px" }}>
          {currentEvent.name} · {currentEvent.date}
        </p>
      </div>

      {/* Info Alert */}
      <InfoAlert />

      {/* Package List */}
      <div>
        {packages.map((pkg) => {
          const promo = activePromos.find((p) => p.package === pkg.key);
          return (
            <PackageCard
              key={pkg.key}
              pkg={pkg}
              promo={promo}
              onActivate={openModal}
            />
          );
        })}
      </div>

      {/* Link ke Analitik */}
      <div className="text-center mt-4">
        <Link
          to="/organizer/1/event-dashboard/statistik"
          style={{ color: "#4f46e5", fontSize: "14px", textDecoration: "none" }}
          className="fw-medium"
        >
          Lihat analitik promosi →
        </Link>
      </div>

      {/* Modal Pembayaran */}
      {selectedPackage && (
        <PaymentModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          packageType={selectedPackage}
          eventName={currentEvent.name}
          onSuccess={handleSuccess}
        />
      )}
    </Container>
  );
};

export default EventPromotionPage;
