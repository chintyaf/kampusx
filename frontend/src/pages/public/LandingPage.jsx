import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../api/axios";
import {
  Carousel, Container, Row, Col, Card, Button,
  InputGroup, Form, Spinner,
} from "react-bootstrap";
import {
  ShieldCheck, Wallet, FileText, Users, Search, CreditCard,
  Ticket, Calendar, MapPin, User, Wifi, Briefcase, BookOpen,
  Cpu, Scale, Stethoscope, Calculator, FlaskConical, Globe,
  Palette, Music, Cat, ChevronRight, ArrowRight,
} from "lucide-react";

// ── Kategori ──────────────────────────────────────────────────────────────────
const CATEGORIES = [
  { id: 1,  name: "Sains Hewan",       Icon: Cat,          color: "#ef4444", bg: "#fee2e2" },
  { id: 2,  name: "Bisnis & Ekonomi",  Icon: Briefcase,    color: "#52525b", bg: "#f4f4f5" },
  { id: 3,  name: "Pendidikan",        Icon: BookOpen,     color: "#eab308", bg: "#fef9c3" },
  { id: 4,  name: "Teknik & Tech",     Icon: Cpu,          color: "#22c55e", bg: "#dcfce7" },
  { id: 5,  name: "Hukum",             Icon: Scale,        color: "#ca8a04", bg: "#fef9c3" },
  { id: 6,  name: "Kesehatan",         Icon: Stethoscope,  color: "#3b82f6", bg: "#dbeafe" },
  { id: 7,  name: "Matematika",        Icon: Calculator,   color: "#06b6d4", bg: "#cffafe" },
  { id: 8,  name: "Sains Fisik",       Icon: FlaskConical, color: "#00699e", bg: "#dff3ff" },
  { id: 9,  name: "Studi Regional",    Icon: Globe,        color: "#f59e0b", bg: "#fef3c7" },
  { id: 10, name: "Ilmu Sosial",       Icon: Users,        color: "#ec4899", bg: "#fce7f3" },
  { id: 11, name: "Seni & Desain",     Icon: Palette,      color: "#f43f5e", bg: "#ffe4e6" },
  { id: 12, name: "Musik & Hiburan",   Icon: Music,        color: "#6366f1", bg: "#e0e7ff" },
];

const FEATURES = [
  { id: 1, title: "Event Terverifikasi", desc: "Semua event dijamin resmi dari instansi terpercaya.",      Icon: ShieldCheck },
  { id: 2, title: "Pembayaran Aman",     desc: "Transaksi tiket dijamin aman dan mudah.",                  Icon: Wallet      },
  { id: 3, title: "E-Sertifikat",        desc: "Dapatkan e-sertifikat otomatis setelah event selesai.",   Icon: FileText    },
  { id: 4, title: "Jaringan Luas",       desc: "Perluas relasi profesionalmu bersama ribuan mahasiswa.",   Icon: Users       },
];

const STEPS = [
  { id: 1, title: "Cari Event",     desc: "Temukan event sesuai minat & kampusmu.",      Icon: Search    },
  { id: 2, title: "Daftar & Bayar", desc: "Registrasi cepat, bayar lewat berbagai metode.", Icon: CreditCard },
  { id: 3, title: "Hadir & Nikmati",desc: "Ikuti event & dapatkan sertifikat otomatis.", Icon: Ticket    },
];

const PARTNERS = [
  { id: 1, name: "Kampus A", logo: "https://placehold.co/150x60/ffffff/00699e?text=Kampus+A" },
  { id: 2, name: "Kampus B", logo: "https://placehold.co/150x60/ffffff/00699e?text=Kampus+B" },
  { id: 3, name: "Kampus C", logo: "https://placehold.co/150x60/ffffff/00699e?text=Kampus+C" },
  { id: 4, name: "Kampus D", logo: "https://placehold.co/150x60/ffffff/00699e?text=Kampus+D" },
];

// ── EventCard ─────────────────────────────────────────────────────────────────
const EventCard = ({ ev, onClick }) => (
  <Card
    onClick={onClick}
    className="h-100 shadow-sm"
    style={{ borderRadius: 12, border: "1px solid var(--color-border)", cursor: "pointer", transition: "transform .15s, box-shadow .15s", overflow: "hidden" }}
    onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,105,158,0.12)"; }}
    onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)";    e.currentTarget.style.boxShadow = ""; }}
  >
    {/* Badges baris atas */}
    <div style={{ padding: "12px 12px 0", display: "flex", justifyContent: "space-between", alignItems: "center", minHeight: 36 }}>
      <div style={{ display: "flex", gap: 6 }}>
        {ev.isInPerson && (
          <span style={{ fontSize: 11, color: "var(--color-primary)", border: "1px solid var(--color-primary)", borderRadius: 99, padding: "2px 8px", fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}>
            <Users size={11} /> In-Person
          </span>
        )}
        {ev.isOnline && (
          <span style={{ fontSize: 11, color: "var(--color-primary)", border: "1px solid var(--color-primary)", borderRadius: 99, padding: "2px 8px", fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}>
            <Wifi size={11} /> Online
          </span>
        )}
      </div>
      {ev.isFeatured && (
        <span style={{ fontSize: 11, background: "var(--bahama-blue-500)", color: "#fff", borderRadius: 99, padding: "2px 10px", fontWeight: 700 }}>
          Featured
        </span>
      )}
    </div>

    {/* Gambar */}
    <img src={ev.image} alt={ev.title}
      style={{ width: "100%", height: 170, objectFit: "cover", marginTop: 10 }} />

    <Card.Body style={{ padding: "12px 14px 14px", display: "flex", flexDirection: "column" }}>
      {/* Tanggal & harga */}
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "var(--font-sm)", color: "var(--color-primary)", fontWeight: 600, marginBottom: 8 }}>
        <span style={{ display: "flex", alignItems: "center", gap: 5 }}><Calendar size={14} />{ev.date}</span>
        <span style={{ display: "flex", alignItems: "center", gap: 5 }}><Ticket size={14} />{ev.price}</span>
      </div>

      {/* Judul */}
      <Card.Title style={{ fontSize: "var(--font-md)", fontWeight: 700, color: "var(--color-text)", lineHeight: 1.4, marginBottom: "auto" }}>
        {ev.title}
      </Card.Title>

      <hr style={{ margin: "10px 0", borderColor: "var(--color-border)", opacity: 1 }} />

      {/* Lokasi & organizer */}
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "var(--font-sm)", color: "var(--color-primary)", fontWeight: 500 }}>
        <span style={{ display: "flex", alignItems: "center", gap: 5, overflow: "hidden", maxWidth: "60%" }}>
          <MapPin size={14} style={{ flexShrink: 0 }} />
          <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{ev.location}</span>
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: 5, overflow: "hidden", maxWidth: "40%" }}>
          <User size={14} style={{ flexShrink: 0 }} />
          <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{ev.org}</span>
        </span>
      </div>
    </Card.Body>
  </Card>
);

// ── Main ──────────────────────────────────────────────────────────────────────
const LandingPage = () => {
  const navigate = useNavigate();
  const [allEvents, setAllEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [email, setEmail]         = useState("");

  const banners = [
    { id: 1, image: "https://placehold.co/1200x420/00699e/ffffff?text=Konser+Musik+Tahunan"        },
    { id: 2, image: "https://placehold.co/1200x420/0aabed/ffffff?text=Seminar+Nasional+Teknologi"  },
    { id: 3, image: "https://placehold.co/1200x420/055c87/ffffff?text=Workshop+Persiapan+Karir"    },
  ];

  useEffect(() => {
    (async () => {
      try {
        const res  = await api.get("events");
        const data = res.data?.data ?? res.data;
        setAllEvents(
          data.map((ev) => {
            const loc       = ev.location || {};
            const eventType = loc.type || ev.location_type || "offline";
            const display   = eventType === "online"
              ? (loc.platform ? `Online (${loc.platform})` : "Online Meeting")
              : (loc.location || "Offline Venue");
            return {
              id:         ev.id,
              title:      ev.title,
              org:        ev.organizer?.name ?? "Unknown",
              image:      `https://placehold.co/600x300/dff3ff/00699e?text=Event+${ev.id}`,
              date:       ev.start_date
                ? new Date(ev.start_date).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })
                : "Tanggal Belum Ditentukan",
              price:      "Cek Detail",
              location:   display,
              isOnline:   ["online","hybrid"].includes(eventType),
              isInPerson: ["offline","hybrid"].includes(eventType),
              isFeatured: ev.id % 2 === 0,
            };
          })
        );
      } catch (err) {
        console.error("Gagal fetch events:", err);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const eventTerpopuler = allEvents.filter((ev) => ev.isFeatured).slice(0, 3);
  const eventTerbaru    = [...allEvents].sort((a, b) => b.id - a.id).slice(0, 3);

  return (
    <div style={{ background: "var(--color-white)" }}>

      {/* ── 1. HERO ───────────────────────────────────────────────────────── */}
      <section style={{ background: "var(--color-bg)", borderBottom: "1px solid var(--color-border)" }}>
        <Carousel interval={3500} pause="hover" controls={false}>
          {banners.map((b) => (
            <Carousel.Item key={b.id}>
              <img src={b.image} alt="" className="d-block w-100"
                style={{ height: "clamp(180px,30vw,380px)", objectFit: "cover" }} />
            </Carousel.Item>
          ))}
        </Carousel>

        <Container style={{ paddingTop: 48, paddingBottom: 56, textAlign: "center" }}>
          <p style={{ fontSize: "var(--font-sm)", color: "var(--color-primary)", fontWeight: 600, marginBottom: 10, letterSpacing: "0.5px", textTransform: "uppercase" }}>
            Platform Event Mahasiswa #1
          </p>
          <h1 style={{ fontSize: "clamp(24px,4vw,40px)", fontWeight: 800, color: "var(--color-text)", lineHeight: 1.25, marginBottom: 16, maxWidth: 620, margin: "0 auto 16px" }}>
            Xplore Potensimu,<br />Dapatkan Xperience Baru!
          </h1>
          <p style={{ fontSize: "var(--font-md)", color: "var(--color-secondary)", maxWidth: 560, margin: "0 auto 32px", lineHeight: 1.7 }}>
            Lebih dari sekadar cari tiket. Setiap event yang kamu ikuti otomatis jadi portofolio profesionalmu.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <Button
              onClick={() => navigate("/explore-events")}
              style={{ background: "var(--color-primary)", border: "none", borderRadius: 8, padding: "10px 28px", fontWeight: 700, fontSize: "var(--font-md)", display: "flex", alignItems: "center", gap: 6 }}
            >
              Mulai Xplore <ArrowRight size={16} />
            </Button>
            <Button
              variant="outline-secondary"
              onClick={() => navigate("/register")}
              style={{ borderRadius: 8, padding: "10px 28px", fontWeight: 600, fontSize: "var(--font-md)" }}
            >
              Daftar Gratis
            </Button>
          </div>

          {/* Stats bar */}
          <div style={{ display: "flex", justifyContent: "center", gap: 40, marginTop: 44, flexWrap: "wrap" }}>
            {[["500+","Event Aktif"], ["12.000+","Mahasiswa"], ["200+","Kampus"], ["95%","Puas"]].map(([num, lbl]) => (
              <div key={lbl} style={{ textAlign: "center" }}>
                <div style={{ fontSize: 22, fontWeight: 800, color: "var(--color-primary)" }}>{num}</div>
                <div style={{ fontSize: "var(--font-xs)", color: "var(--color-secondary)", marginTop: 2 }}>{lbl}</div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* ── 2. KATEGORI ───────────────────────────────────────────────────── */}
      <section style={{ background: "var(--color-white)", padding: "56px 0" }}>
        <Container>
          <div style={{ textAlign: "center", marginBottom: 40 }}>
            <h2 style={{ fontSize: "var(--font-xl)", fontWeight: 800, color: "var(--color-text)", marginBottom: 8 }}>Kategori Event</h2>
            <p style={{ color: "var(--color-secondary)", fontSize: "var(--font-sm)", margin: 0 }}>Temukan event sesuai bidang studimu</p>
          </div>
          <Row className="g-3 justify-content-center">
            {CATEGORIES.map((cat) => (
              <Col xs={6} sm={4} md={3} lg={2} key={cat.id}>
                <div
                  style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", cursor: "pointer", padding: "12px 8px", borderRadius: 12, transition: "background .15s" }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "var(--color-bg-2)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  <div style={{ width: 68, height: 68, borderRadius: "50%", background: cat.bg, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 10, boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
                    <cat.Icon size={28} color={cat.color} />
                  </div>
                  <span style={{ fontSize: "var(--font-sm)", fontWeight: 700, color: "var(--color-text)", lineHeight: 1.3 }}>{cat.name}</span>
                  <span style={{ fontSize: "var(--font-xs)", color: "var(--color-secondary)", marginTop: 2 }}>Explore</span>
                </div>
              </Col>
            ))}
          </Row>
          <div style={{ textAlign: "center", marginTop: 36 }}>
            <Button
              onClick={() => navigate("/explore-events")}
              style={{ background: "var(--color-primary)", border: "none", borderRadius: 8, padding: "9px 24px", fontWeight: 600, fontSize: "var(--font-sm)", display: "inline-flex", alignItems: "center", gap: 6 }}
            >
              Lihat Semua Kategori <ChevronRight size={15} />
            </Button>
          </div>
        </Container>
      </section>

      {/* ── 3. EVENT TERPOPULER ───────────────────────────────────────────── */}
      <section style={{ background: "var(--color-bg)", borderTop: "1px solid var(--color-border)", borderBottom: "1px solid var(--color-border)", padding: "56px 0" }}>
        <Container>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
            <div>
              <h2 style={{ fontSize: "var(--font-xl)", fontWeight: 800, color: "var(--color-text)", margin: 0 }}>Event Terpopuler</h2>
              <p style={{ color: "var(--color-secondary)", fontSize: "var(--font-sm)", margin: "4px 0 0" }}>Paling banyak diminati minggu ini</p>
            </div>
            <button onClick={() => navigate("/explore-events?sort=popular")}
              style={{ background: "none", border: "none", color: "var(--color-primary)", fontSize: "var(--font-sm)", fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}>
              Lihat Semua <ChevronRight size={14} />
            </button>
          </div>

          {isLoading ? (
            <div style={{ textAlign: "center", padding: "40px 0" }}>
              <Spinner animation="border" style={{ color: "var(--color-primary)" }} />
              <p style={{ marginTop: 12, color: "var(--color-secondary)", fontSize: "var(--font-sm)" }}>Memuat event…</p>
            </div>
          ) : (
            <Row className="g-4">
              {eventTerpopuler.map((ev) => (
                <Col xs={12} md={4} key={ev.id}>
                  <EventCard ev={ev} onClick={() => navigate(`/event/${ev.id}`)} />
                </Col>
              ))}
            </Row>
          )}
        </Container>
      </section>

      {/* ── 4. EVENT TERBARU ──────────────────────────────────────────────── */}
      <section style={{ background: "var(--color-white)", padding: "56px 0" }}>
        <Container>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
            <div>
              <h2 style={{ fontSize: "var(--font-xl)", fontWeight: 800, color: "var(--color-text)", margin: 0 }}>Event Terbaru</h2>
              <p style={{ color: "var(--color-secondary)", fontSize: "var(--font-sm)", margin: "4px 0 0" }}>Baru saja ditambahkan</p>
            </div>
            <button onClick={() => navigate("/explore?sort=newest")}
              style={{ background: "none", border: "none", color: "var(--color-primary)", fontSize: "var(--font-sm)", fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}>
              Lihat Semua <ChevronRight size={14} />
            </button>
          </div>
          <Row className="g-4">
            {isLoading
              ? <div style={{ textAlign: "center", padding: "40px 0", width: "100%" }}><Spinner animation="border" style={{ color: "var(--color-primary)" }} /></div>
              : eventTerbaru.map((ev) => (
                  <Col xs={12} md={4} key={ev.id}>
                    <EventCard ev={ev} onClick={() => navigate(`/event/${ev.id}`)} />
                  </Col>
                ))
            }
          </Row>
        </Container>
      </section>

      {/* ── 5. KENAPA KAMPUSX? ────────────────────────────────────────────── */}
      <section style={{ background: "var(--color-bg)", borderTop: "1px solid var(--color-border)", padding: "56px 0" }}>
        <Container>
          <div style={{ textAlign: "center", marginBottom: 40 }}>
            <h2 style={{ fontSize: "var(--font-xl)", fontWeight: 800, color: "var(--color-text)", marginBottom: 8 }}>Mengapa Memilih KampusX?</h2>
            <p style={{ color: "var(--color-secondary)", fontSize: "var(--font-sm)", margin: 0 }}>Dibuat khusus untuk ekosistem mahasiswa Indonesia</p>
          </div>
          <Row className="g-4">
            {FEATURES.map((f) => (
              <Col xs={12} sm={6} md={3} key={f.id}>
                <div style={{ background: "var(--color-white)", borderRadius: 12, padding: "28px 20px", textAlign: "center", height: "100%", border: "1px solid var(--color-border)", boxShadow: "0 2px 8px rgba(0,105,158,0.05)" }}>
                  <div style={{ width: 56, height: 56, borderRadius: "50%", background: "var(--bahama-blue-50)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                    <f.Icon size={26} color="#00699e" strokeWidth={1.5} />
                  </div>
                  <h5 style={{ fontWeight: 700, color: "var(--color-text)", fontSize: "var(--font-md)", marginBottom: 8 }}>{f.title}</h5>
                  <p style={{ color: "var(--color-secondary)", fontSize: "var(--font-sm)", margin: 0 }}>{f.desc}</p>
                </div>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* ── 6. CARA KERJA ─────────────────────────────────────────────────── */}
      <section style={{ background: "var(--color-white)", padding: "56px 0" }}>
        <Container style={{ textAlign: "center" }}>
          <h2 style={{ fontSize: "var(--font-xl)", fontWeight: 800, color: "var(--color-text)", marginBottom: 8 }}>Cara Kerja</h2>
          <p style={{ color: "var(--color-secondary)", fontSize: "var(--font-sm)", marginBottom: 48 }}>Tiga langkah mudah untuk mulai</p>
          <Row className="justify-content-center g-4">
            {STEPS.map((s, i) => (
              <Col xs={12} md={4} key={s.id}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <div style={{ position: "relative", marginBottom: 16 }}>
                    <div style={{ width: 80, height: 80, borderRadius: "50%", background: "var(--bahama-blue-50)", border: "2px dashed var(--color-primary)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <s.Icon size={34} color="#00699e" strokeWidth={1.5} />
                    </div>
                    <span style={{ position: "absolute", top: -4, right: -4, width: 24, height: 24, borderRadius: "50%", background: "var(--color-primary)", color: "#fff", fontSize: 12, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      {s.id}
                    </span>
                  </div>
                  <h5 style={{ fontWeight: 700, color: "var(--color-text)", marginBottom: 6 }}>{s.title}</h5>
                  <p style={{ color: "var(--color-secondary)", fontSize: "var(--font-sm)", maxWidth: 200, margin: 0 }}>{s.desc}</p>
                </div>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* ── 7. PARTNER ────────────────────────────────────────────────────── */}
      <section style={{ background: "var(--color-bg)", borderTop: "1px solid var(--color-border)", padding: "56px 0" }}>
        <Container style={{ textAlign: "center" }}>
          <h2 style={{ fontSize: "var(--font-xl)", fontWeight: 800, color: "var(--color-text)", marginBottom: 8 }}>Kampus & Partner Terpopuler</h2>
          <p style={{ color: "var(--color-secondary)", fontSize: "var(--font-sm)", marginBottom: 40 }}>Bergabung bersama ratusan institusi terpercaya</p>
          <Row className="g-3 justify-content-center">
            {PARTNERS.map((p) => (
              <Col xs={6} md={3} key={p.id}>
                <div style={{ background: "var(--color-white)", borderRadius: 10, border: "1px solid var(--color-border)", height: 80, display: "flex", alignItems: "center", justifyContent: "center", padding: 12, boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
                  <img src={p.logo} alt={p.name} style={{ maxHeight: "100%", maxWidth: "100%", objectFit: "contain" }} />
                </div>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* ── 8. CTA ────────────────────────────────────────────────────────── */}
      <section style={{ background: "var(--bahama-blue-950)", padding: "72px 0" }}>
        <Container style={{ textAlign: "center" }}>
          <h2 style={{ fontSize: "clamp(22px,3vw,34px)", fontWeight: 800, color: "#fff", marginBottom: 12 }}>
            Siap Jadi Mahasiswa Xtra?
          </h2>
          <p style={{ color: "rgba(255,255,255,0.65)", fontSize: "var(--font-md)", marginBottom: 36, maxWidth: 480, margin: "0 auto 36px" }}>
            Daftar sekarang dan mulai bangun portofolio event-mu hari ini. Gratis!
          </p>
          <Row className="justify-content-center">
            <Col xs={12} md={6} lg={5}>
              <InputGroup size="lg" style={{ borderRadius: 10, overflow: "hidden", boxShadow: "0 4px 20px rgba(0,0,0,0.2)" }}>
                <Form.Control
                  placeholder="Masukkan email kamu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{ border: "none", fontSize: "var(--font-sm)" }}
                />
                <Button
                  onClick={() => navigate(`/register?email=${email}`)}
                  style={{ background: "var(--color-primary)", border: "none", fontWeight: 700, fontSize: "var(--font-sm)", padding: "0 24px" }}
                >
                  Mulai &rarr;
                </Button>
              </InputGroup>
              <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "var(--font-xs)", marginTop: 12 }}>
                Sudah punya akun?{" "}
                <Link to="/login" style={{ color: "rgba(255,255,255,0.75)", fontWeight: 600 }}>Masuk di sini</Link>
              </p>
            </Col>
          </Row>
        </Container>
      </section>

    </div>
  );
};

export default LandingPage;