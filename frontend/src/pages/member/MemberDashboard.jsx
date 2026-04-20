import React, { useState, useEffect } from "react";
import { Container, Row, Col, Spinner, Carousel } from "react-bootstrap";
import {
  Calendar, MapPin, Ticket, Navigation,
  Star, ChevronRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";

// ── Design tokens — semua pakai CSS variables dari index.css ─────────────────
const clr = {
  primary:    "var(--color-primary)",       // #00699e
  primaryHex: "#00699e",                    // untuk shadow / rgba
  success:    "#10B981",
  accent:     "var(--color-secondary)",     // #64748b
  bg:         "var(--color-bg)",            // #f8fafc
  bg2:        "var(--color-bg-2)",          // #f1f5f9
  white:      "var(--color-white)",
  text:       "var(--color-text)",          // #0f172a
  muted:      "var(--color-text-muted)",
  border:     "var(--color-border)",
  blue500:    "var(--bahama-blue-500)",     // #0aabed  — aksen terang
  blue700:    "var(--bahama-blue-700)",     // #00699e  — sama dgn primary
  blue50:     "var(--bahama-blue-50)",      // #f0f9ff  — bg ringan
  shadow:     "0 2px 12px rgba(0,105,158,0.08)",
};

// ── Haversine ─────────────────────────────────────────────────────────────────
const haversine = (lat1, lng1, lat2, lng2) => {
  const R = 6371, toRad = (x) => (x * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1), dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

// ── Atoms ─────────────────────────────────────────────────────────────────────
const SectionHeader = ({ title, onSeeAll }) => (
  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
    <span style={{ fontSize: "var(--font-md)", fontWeight: 700, color: clr.text }}>{title}</span>
    {onSeeAll && (
      <button
        onClick={onSeeAll}
        style={{ background: "none", border: "none", padding: 0, color: clr.primary, fontSize: "var(--font-xs)", fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 2 }}
      >
        Lihat Semua <ChevronRight size={13} />
      </button>
    )}
  </div>
);

const StatusPill = ({ status }) => {
  const map = {
    active:    ["AKTIF",   "#10B981"],
    used:      ["SELESAI", "#64748b"],
    cancelled: ["BATAL",   "#ef4444"],
  };
  const [label, bg] = map[status] ?? [status.toUpperCase(), "#64748b"];
  return (
    <span style={{ background: bg, color: "#fff", fontSize: 10, fontWeight: 700, borderRadius: 99, padding: "3px 8px", letterSpacing: "0.4px" }}>
      {label}
    </span>
  );
};

// ── EventCard ─────────────────────────────────────────────────────────────────
const EventCard = ({ ev, onClick }) => (
  <div
    onClick={onClick}
    style={{ flexShrink: 0, width: 196, background: clr.white, borderRadius: 12, overflow: "hidden", boxShadow: clr.shadow, cursor: "pointer", transition: "transform .15s" }}
    onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-3px)")}
    onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
  >
    <div style={{ position: "relative" }}>
      <img src={ev.image} alt={ev.title} style={{ width: "100%", height: 96, objectFit: "cover" }} />
      {ev.isFeatured && (
        <span style={{ position: "absolute", top: 6, right: 6, background: clr.primary, color: "#fff", fontSize: 9, fontWeight: 700, borderRadius: 99, padding: "2px 7px" }}>
          FEATURED
        </span>
      )}
    </div>
    <div style={{ padding: "10px 10px 12px" }}>
      <div style={{ display: "flex", gap: 4, marginBottom: 6, flexWrap: "wrap" }}>
        {ev.isOnline    && <span style={{ fontSize: 9, color: clr.primaryHex, border: `1px solid ${clr.primaryHex}`, borderRadius: 99, padding: "1px 6px", fontWeight: 600 }}>Online</span>}
        {ev.isInPerson  && <span style={{ fontSize: 9, color: clr.primaryHex, border: `1px solid ${clr.primaryHex}`, borderRadius: 99, padding: "1px 6px", fontWeight: 600 }}>Offline</span>}
      </div>
      <p style={{ margin: "0 0 6px", fontSize: "var(--font-xs)", fontWeight: 700, color: clr.text, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", lineHeight: 1.4 }}>
        {ev.title}
      </p>
      <div style={{ fontSize: 11, color: "var(--color-secondary)", display: "flex", flexDirection: "column", gap: 3 }}>
        <span style={{ display: "flex", alignItems: "center", gap: 4 }}><Calendar size={10} />{ev.date}</span>
        <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <MapPin size={10} />
          <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 130 }}>{ev.location}</span>
        </span>
      </div>
      <div style={{ marginTop: 8, paddingTop: 8, borderTop: `1px solid var(--color-border)`, fontSize: "var(--font-xs)", fontWeight: 700, color: clr.primary }}>
        {ev.price}
      </div>
    </div>
  </div>
);

// ── Main ──────────────────────────────────────────────────────────────────────
const MemberDashboard = () => {
  const { token, user } = useAuth();
  const navigate = useNavigate();

  const [tickets,        setTickets]        = useState([]);
  const [allEvents,      setAllEvents]      = useState([]);
  const [nearbyEvents,   setNearbyEvents]   = useState([]);
  const [locationStatus, setLocationStatus] = useState("idle"); // idle | loading | granted | denied
  const [isLoading,      setIsLoading]      = useState(true);

  const banners = [
    { id: 1, image: "https://placehold.co/1200x380/00699e/ffffff?text=Konser+Musik+Tahunan" },
    { id: 2, image: "https://placehold.co/1200x380/0aabed/ffffff?text=Seminar+Nasional+Teknologi" },
    { id: 3, image: "https://placehold.co/1200x380/055c87/ffffff?text=Workshop+Persiapan+Karir" },
  ];

  // Fetch all events
  useEffect(() => {
    (async () => {
      try {
        const res  = await api.get("events");
        const data = res.data?.data ?? res.data;
        setAllEvents(
          data.map((ev) => ({
            id:         ev.id,
            title:      ev.title,
            org:        ev.organizer?.name ?? "Unknown",
            image:      `https://placehold.co/600x300/dff3ff/00699e?text=Event+${ev.id}`,
            date:       ev.start_date
              ? new Date(ev.start_date).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })
              : "TBD",
            location:   ev.location_type === "online" ? "Online" : (ev.venue ?? "Offline"),
            lat:        ev.latitude  ?? null,
            lng:        ev.longitude ?? null,
            isOnline:   ["online", "hybrid"].includes(ev.location_type),
            isInPerson: ["offline", "hybrid"].includes(ev.location_type),
            isFeatured: ev.id % 2 === 0,
            price:      ev.price ? `Rp ${Number(ev.price).toLocaleString("id-ID")}` : "Gratis",
          }))
        );
      } catch (err) {
        console.error("Gagal fetch events:", err);
      }
    })();
  }, []);

  // Fetch my tickets
  useEffect(() => {
    (async () => {
      try {
        if (!token) { setIsLoading(false); return; }
        const res = await api.get("my-tickets", { headers: { Authorization: `Bearer ${token}` } });
        setTickets(res.data.data);
      } catch {
        setTickets([
          {
            id: 1, ticket_code: "TKT-001", status: "active",
            order_item: { order: { event: { id: 101, title: "Workshop UI/UX Design", start_date: "10 April 2026", location: "Bandung, ID", image: "https://placehold.co/600x300/dff3ff/00699e?text=Workshop" } } },
          },
          {
            id: 2, ticket_code: "TKT-002", status: "used",
            order_item: { order: { event: { id: 102, title: "Tech Startup Conference 2026", start_date: "15 Mei 2026", location: "Zoom", image: "https://placehold.co/600x300/f1f5f9/64748b?text=Conference" } } },
          },
        ]);
      } finally {
        setIsLoading(false);
      }
    })();
  }, [token]);

  // Request geolocation
  const requestLocation = () => {
    setLocationStatus("loading");
    navigator.geolocation.getCurrentPosition(
      ({ coords: { latitude, longitude } }) => {
        setLocationStatus("granted");
        const withDist = allEvents
          .filter((ev) => ev.lat && ev.lng)
          .map((ev)   => ({ ...ev, distance: haversine(latitude, longitude, ev.lat, ev.lng) }))
          .sort((a, b) => a.distance - b.distance)
          .slice(0, 6)
          .map((ev)   => ({ ...ev, distance: ev.distance.toFixed(1) }));

        // Fallback demo jika API belum kirim koordinat
        if (withDist.length === 0) {
          setNearbyEvents(
            allEvents.slice(0, 4).map((ev, i) => ({ ...ev, distance: (0.8 + i * 1.3).toFixed(1) }))
          );
        } else {
          setNearbyEvents(withDist);
        }
      },
      () => setLocationStatus("denied")
    );
  };

  const activeTickets   = tickets.filter((t) => t.status === "active");
  const eventTerbaru    = [...allEvents].sort((a, b) => b.id - a.id).slice(0, 8);
  const eventTerpopuler = allEvents.filter((ev) => ev.isFeatured).slice(0, 8);

  if (isLoading) return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
      <Spinner animation="border" style={{ color: clr.primaryHex }} />
    </div>
  );

  return (
    <div style={{ background: "var(--color-bg)", minHeight: "100vh", paddingBottom: 48 }}>

      {/* ── CAROUSEL ──────────────────────────────────────────────────────── */}
      <Carousel interval={4000} pause="hover" controls={false}>
        {banners.map((b) => (
          <Carousel.Item key={b.id}>
            <img src={b.image} alt="" className="d-block w-100"
              style={{ height: "clamp(150px,25vw,260px)", objectFit: "cover" }} />
          </Carousel.Item>
        ))}
      </Carousel>

      <Container style={{ paddingTop: 24 }}>

        {/* ── GREETING ────────────────────────────────────────────────────── */}
        <div style={{ marginBottom: 24 }}>
          <p style={{ margin: 0, fontSize: "var(--font-xs)", color: "var(--color-secondary)" }}>Selamat datang kembali 👋</p>
          <h1 style={{ margin: 0, fontSize: "var(--font-xl)", fontWeight: 800, color: "var(--color-text)" }}>
            {user?.name ?? "Member"}
          </h1>
        </div>

        {/* ── QUICK STATS ─────────────────────────────────────────────────── */}
        <Row className="g-3 mb-4">
          {[
            { icon: <Ticket size={16} />,   label: "Tiket Aktif",   value: activeTickets.length, color: "#00699e"  },
            { icon: <Star size={16} />,     label: "Poin Reward",   value: user?.points ?? 0,    color: "#F59E0B"  },
            { icon: <Calendar size={16} />, label: "Event Diikuti", value: tickets.length,        color: "#10B981"  },
          ].map((s, i) => (
            <Col xs={4} key={i}>
              <div style={{ background: "var(--color-white)", borderRadius: 12, padding: "12px 8px", textAlign: "center", boxShadow: clr.shadow }}>
                <div style={{ color: s.color, marginBottom: 4 }}>{s.icon}</div>
                <div style={{ fontSize: 20, fontWeight: 800, color: "var(--color-text)", lineHeight: 1 }}>{s.value}</div>
                <div style={{ fontSize: 11, color: "var(--color-secondary)", marginTop: 3 }}>{s.label}</div>
              </div>
            </Col>
          ))}
        </Row>

        {/* ── TIKET AKTIF ─────────────────────────────────────────────────── */}
        <section style={{ marginBottom: 36 }}>
          <SectionHeader title="🎟️ Event Aktif Saya" onSeeAll={() => navigate("/my-tickets")} />

          {activeTickets.length === 0 ? (
            <div style={{ background: "var(--color-white)", borderRadius: 12, padding: "20px 16px", textAlign: "center", color: "var(--color-secondary)", fontSize: "var(--font-sm)", boxShadow: clr.shadow }}>
              Belum ada event aktif.{" "}
              <span style={{ color: clr.primary, fontWeight: 600, cursor: "pointer" }} onClick={() => navigate("/explore")}>
                Cari event →
              </span>
            </div>
          ) : (
            <div style={{ display: "flex", gap: 12, overflowX: "auto", paddingBottom: 8 }}>
              {activeTickets.map((t) => {
                const ev = t.order_item?.order?.event;
                if (!ev) return null;
                return (
                  <div
                    key={t.id}
                    onClick={() => navigate(`/event-space/${ev.id}`)}
                    style={{ flexShrink: 0, width: 236, background: "var(--color-white)", borderRadius: 12, overflow: "hidden", boxShadow: clr.shadow, cursor: "pointer", transition: "transform .15s" }}
                    onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-3px)")}
                    onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
                  >
                    <img src={ev.image ?? "https://placehold.co/600x300"} alt={ev.title}
                      style={{ width: "100%", height: 108, objectFit: "cover" }} />
                    <div style={{ padding: "10px 12px 12px" }}>
                      <StatusPill status={t.status} />
                      <p style={{ margin: "6px 0 4px", fontSize: "var(--font-sm)", fontWeight: 700, color: "var(--color-text)", overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
                        {ev.title}
                      </p>
                      <div style={{ fontSize: 11, color: "var(--color-secondary)", display: "flex", flexDirection: "column", gap: 3 }}>
                        <span style={{ display: "flex", alignItems: "center", gap: 4 }}><Calendar size={10} />{ev.start_date}</span>
                        <span style={{ display: "flex", alignItems: "center", gap: 4 }}><MapPin size={10} />{ev.location}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* ── EVENT TERDEKAT ───────────────────────────────────────────────── */}
        <section style={{ marginBottom: 36 }}>
          <SectionHeader title="📍 Event Terdekat" />

          {locationStatus === "idle" && (
            <div style={{ background: "var(--color-white)", borderRadius: 12, padding: "22px 16px", textAlign: "center", boxShadow: clr.shadow }}>
              <div style={{ width: 48, height: 48, borderRadius: "50%", background: "var(--bahama-blue-50)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px" }}>
                <Navigation size={22} style={{ color: "#00699e" }} />
              </div>
              <p style={{ margin: "0 0 4px", fontWeight: 700, color: "var(--color-text)", fontSize: "var(--font-sm)" }}>Temukan Event di Sekitarmu</p>
              <p style={{ margin: "0 0 16px", color: "var(--color-secondary)", fontSize: "var(--font-xs)" }}>Aktifkan lokasi untuk melihat event paling dekat denganmu</p>
              <button
                onClick={requestLocation}
                style={{ background: "#00699e", color: "#fff", border: "none", borderRadius: 8, padding: "9px 22px", fontSize: "var(--font-sm)", fontWeight: 600, cursor: "pointer" }}
              >
                Aktifkan Lokasi
              </button>
            </div>
          )}

          {locationStatus === "loading" && (
            <div style={{ background: "var(--color-white)", borderRadius: 12, padding: "28px 16px", textAlign: "center", boxShadow: clr.shadow }}>
              <Spinner animation="border" size="sm" style={{ color: "#00699e" }} />
              <p style={{ marginTop: 8, fontSize: "var(--font-sm)", color: "var(--color-secondary)", marginBottom: 0 }}>Mendeteksi lokasimu…</p>
            </div>
          )}

          {locationStatus === "denied" && (
            <div style={{ background: "var(--error-bg)", borderRadius: 12, padding: "16px", border: "1px solid var(--error-border)", boxShadow: clr.shadow }}>
              <p style={{ margin: "0 0 4px", fontSize: "var(--font-sm)", fontWeight: 700, color: "var(--error-heading)" }}>Akses lokasi ditolak</p>
              <p style={{ margin: "0 0 12px", fontSize: "var(--font-xs)", color: "var(--color-secondary)" }}>Izinkan akses lokasi di pengaturan browser untuk fitur ini.</p>
              <button
                onClick={requestLocation}
                style={{ background: "none", border: "1px solid var(--error-text)", color: "var(--error-text)", borderRadius: 8, padding: "6px 14px", fontSize: "var(--font-xs)", fontWeight: 600, cursor: "pointer" }}
              >
                Coba Lagi
              </button>
            </div>
          )}

          {locationStatus === "granted" && nearbyEvents.length === 0 && (
            <div style={{ background: "var(--color-white)", borderRadius: 12, padding: "20px 16px", textAlign: "center", color: "var(--color-secondary)", fontSize: "var(--font-sm)", boxShadow: clr.shadow }}>
              Tidak ada event di sekitar lokasimu saat ini.
            </div>
          )}

          {locationStatus === "granted" && nearbyEvents.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {nearbyEvents.map((ev) => (
                <div
                  key={ev.id}
                  onClick={() => navigate(`/event/${ev.id}`)}
                  style={{ background: "var(--color-white)", borderRadius: 12, padding: 12, display: "flex", gap: 12, alignItems: "center", boxShadow: clr.shadow, cursor: "pointer", transition: "background .15s" }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bahama-blue-50)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "var(--color-white)")}
                >
                  <img src={ev.image} alt={ev.title}
                    style={{ width: 60, height: 60, borderRadius: 8, objectFit: "cover", flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ margin: "0 0 4px", fontWeight: 700, fontSize: "var(--font-sm)", color: "var(--color-text)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {ev.title}
                    </p>
                    <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "var(--color-secondary)" }}>
                      <Calendar size={10} />{ev.date}
                    </span>
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <div style={{ fontSize: "var(--font-sm)", fontWeight: 700, color: "#00699e" }}>{ev.distance} km</div>
                    <div style={{ fontSize: 11, color: "var(--color-secondary)" }}>dari lokasim</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ── EVENT TERPOPULER ──────────────────────────────────────────────── */}
        <section style={{ marginBottom: 36 }}>
          <SectionHeader title="🔥 Event Terpopuler" onSeeAll={() => navigate("/explore?sort=popular")} />
          <div style={{ display: "flex", gap: 12, overflowX: "auto", paddingBottom: 8 }}>
            {eventTerpopuler.map((ev) => (
              <EventCard key={ev.id} ev={ev} onClick={() => navigate(`/event/${ev.id}`)} />
            ))}
          </div>
        </section>

        {/* ── EVENT TERBARU ─────────────────────────────────────────────────── */}
        <section>
          <SectionHeader title="✨ Event Terbaru" onSeeAll={() => navigate("/explore?sort=newest")} />
          <div style={{ display: "flex", gap: 12, overflowX: "auto", paddingBottom: 8 }}>
            {eventTerbaru.map((ev) => (
              <EventCard key={ev.id} ev={ev} onClick={() => navigate(`/event/${ev.id}`)} />
            ))}
          </div>
        </section>

      </Container>
    </div>
  );
};

export default MemberDashboard;