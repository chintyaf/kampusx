import React, { useState, useEffect } from "react";
import {
  Container, Row, Col, Card, Form, Button, Spinner, Alert,
} from "react-bootstrap";
import {
  Users, Wifi, Calendar, Ticket, MapPin, User,
  Filter, RotateCcw, Search, SlidersHorizontal, X,
} from "lucide-react";
import { Link } from "react-router-dom";
import api from "../api/axios";

// ── Helpers ───────────────────────────────────────────────────────────────────
const formatPrice = (price) => {
  if (!price || price === 0 || price === "0") return "Gratis";
  if (typeof price === "string" && price.toLowerCase().includes("rp")) return price;
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(price);
};

const formatDate = (dateString) => {
  if (!dateString) return "TBA";
  return new Date(dateString).toLocaleDateString("id-ID", { year: "numeric", month: "long", day: "numeric" });
};

// ── EventCard ─────────────────────────────────────────────────────────────────
const EventCard = ({ ev }) => (
  <Link to={`/event/${ev.id}`} style={{ textDecoration: "none", color: "inherit", display: "block", height: "100%" }}>
    <Card
      className="h-100"
      style={{ borderRadius: 12, border: "1px solid var(--color-border)", boxShadow: "0 2px 8px rgba(0,105,158,0.06)", overflow: "hidden", transition: "transform .15s, box-shadow .15s", background: "var(--color-white)" }}
      onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,105,158,0.12)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)";    e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,105,158,0.06)"; }}
    >
      {/* Badges */}
      <div style={{ padding: "10px 12px 0", display: "flex", justifyContent: "space-between", alignItems: "center", minHeight: 34 }}>
        <div style={{ display: "flex", gap: 6 }}>
          {ev.is_in_person && (
            <span style={{ fontSize: 10, color: "var(--color-primary)", border: "1px solid var(--color-primary)", borderRadius: 99, padding: "2px 8px", fontWeight: 600, display: "flex", alignItems: "center", gap: 3 }}>
              <Users size={10} /> In-Person
            </span>
          )}
          {ev.is_online && (
            <span style={{ fontSize: 10, color: "var(--color-primary)", border: "1px solid var(--color-primary)", borderRadius: 99, padding: "2px 8px", fontWeight: 600, display: "flex", alignItems: "center", gap: 3 }}>
              <Wifi size={10} /> Online
            </span>
          )}
        </div>
        {ev.is_featured && (
          <span style={{ fontSize: 10, background: "var(--bahama-blue-500)", color: "#fff", borderRadius: 99, padding: "2px 9px", fontWeight: 700 }}>
            Featured
          </span>
        )}
      </div>

      {/* Image */}
      <img
        src={ev.image || `https://placehold.co/600x300/dff3ff/00699e?text=Event+${ev.id}`}
        alt={ev.title}
        style={{ width: "100%", height: 165, objectFit: "cover", marginTop: 8 }}
      />

      <Card.Body style={{ padding: "12px 14px 14px", display: "flex", flexDirection: "column" }}>
        {/* Date & price */}
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "var(--font-sm)", color: "var(--color-primary)", fontWeight: 600, marginBottom: 8 }}>
          <span style={{ display: "flex", alignItems: "center", gap: 5 }}><Calendar size={13} />{formatDate(ev.date || ev.start_date)}</span>
          <span style={{ display: "flex", alignItems: "center", gap: 5 }}><Ticket size={13} />{formatPrice(ev.price)}</span>
        </div>

        {/* Title */}
        <Card.Title style={{ fontSize: "var(--font-md)", fontWeight: 700, color: "var(--color-text)", lineHeight: 1.4, marginBottom: "auto" }}>
          {ev.title}
        </Card.Title>

        <hr style={{ margin: "10px 0", borderColor: "var(--color-border)", opacity: 1 }} />

        {/* Location & org */}
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "var(--font-sm)", color: "var(--color-primary)", fontWeight: 500 }}>
          <span style={{ display: "flex", alignItems: "center", gap: 5, overflow: "hidden", maxWidth: "60%" }}>
            <MapPin size={13} style={{ flexShrink: 0 }} />
            <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{ev.location || "TBA"}</span>
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: 5, overflow: "hidden", maxWidth: "40%" }}>
            <User size={13} style={{ flexShrink: 0 }} />
            <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{ev.org || ev.institution?.name || "KampusX"}</span>
          </span>
        </div>
      </Card.Body>
    </Card>
  </Link>
);

// ── FilterSidebar ─────────────────────────────────────────────────────────────
const FilterSidebar = ({ filters, onChange, onReset, onApply }) => (
  <Card style={{ borderRadius: 12, border: "1px solid var(--color-border)", boxShadow: "0 2px 8px rgba(0,105,158,0.06)", overflow: "hidden" }}>
    <div style={{ padding: "14px 16px", borderBottom: "1px solid var(--color-border)", display: "flex", justifyContent: "space-between", alignItems: "center", background: "var(--color-white)" }}>
      <span style={{ fontWeight: 700, fontSize: "var(--font-sm)", color: "var(--color-text)", display: "flex", alignItems: "center", gap: 6 }}>
        <SlidersHorizontal size={15} color="var(--color-primary)" /> Filter
      </span>
      <button onClick={onReset}
        style={{ background: "none", border: "none", padding: 0, fontSize: "var(--font-xs)", color: "var(--color-secondary)", cursor: "pointer", display: "flex", alignItems: "center", gap: 4, fontWeight: 500 }}>
        <RotateCcw size={12} /> Reset
      </button>
    </div>

    <div style={{ padding: "16px", maxHeight: "calc(100vh - 200px)", overflowY: "auto" }}>
      <Form>
        {/* Search */}
        <Form.Group style={{ marginBottom: 20 }}>
          <Form.Label style={{ fontSize: "var(--font-sm)", fontWeight: 600, color: "var(--color-text)", marginBottom: 6 }}>Cari Event</Form.Label>
          <div style={{ position: "relative" }}>
            <Search size={14} style={{ position: "absolute", top: 10, left: 10, color: "var(--color-secondary)" }} />
            <Form.Control
              type="text"
              placeholder="Judul event..."
              value={filters.search}
              onChange={(e) => onChange("search", e.target.value)}
              style={{ paddingLeft: 32, fontSize: "var(--font-sm)", borderColor: "var(--color-border)", borderRadius: 8 }}
            />
          </div>
        </Form.Group>

        {/* Tipe Lokasi */}
        <Form.Group style={{ marginBottom: 20 }}>
          <Form.Label style={{ fontSize: "var(--font-sm)", fontWeight: 600, color: "var(--color-text)", marginBottom: 8 }}>Tipe Lokasi</Form.Label>
          {["Online", "In-Person"].map((type) => (
            <Form.Check key={type} type="checkbox" id={`loc-${type}`} label={type}
              checked={filters.locationType.includes(type)}
              onChange={(e) => {
                const next = e.target.checked
                  ? [...filters.locationType, type]
                  : filters.locationType.filter((t) => t !== type);
                onChange("locationType", next);
              }}
              style={{ fontSize: "var(--font-sm)", marginBottom: 6 }}
            />
          ))}
        </Form.Group>

        {/* Harga */}
        <Form.Group style={{ marginBottom: 20 }}>
          <Form.Label style={{ fontSize: "var(--font-sm)", fontWeight: 600, color: "var(--color-text)", marginBottom: 8 }}>Harga</Form.Label>
          {["Semua", "Gratis", "Berbayar"].map((p) => (
            <Form.Check key={p} type="radio" id={`price-${p}`} label={p} name="price"
              checked={filters.price === p}
              onChange={() => onChange("price", p)}
              style={{ fontSize: "var(--font-sm)", marginBottom: 6 }}
            />
          ))}
        </Form.Group>

        {/* Kategori */}
        <Form.Group style={{ marginBottom: 24 }}>
          <Form.Label style={{ fontSize: "var(--font-sm)", fontWeight: 600, color: "var(--color-text)", marginBottom: 6 }}>Kategori</Form.Label>
          <Form.Select
            value={filters.category}
            onChange={(e) => onChange("category", e.target.value)}
            style={{ fontSize: "var(--font-sm)", borderColor: "var(--color-border)", borderRadius: 8 }}
          >
            <option value="">Semua Kategori</option>
            <option>Bisnis & Ekonomi</option>
            <option>Teknik & Teknologi</option>
            <option>Kesehatan</option>
            <option>Pendidikan</option>
            <option>Seni & Desain</option>
            <option>Ilmu Sosial</option>
          </Form.Select>
        </Form.Group>

        <Button
          onClick={onApply}
          style={{ width: "100%", background: "var(--color-primary)", border: "none", borderRadius: 8, fontWeight: 700, fontSize: "var(--font-sm)", padding: "9px 0", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}
        >
          <Filter size={14} /> Terapkan Filter
        </Button>
      </Form>
    </div>
  </Card>
);

// ── Main ──────────────────────────────────────────────────────────────────────
const ExploreEvents = () => {
  const [events,       setEvents]       = useState([]);
  const [filtered,     setFiltered]     = useState([]);
  const [isLoading,    setIsLoading]    = useState(true);
  const [error,        setError]        = useState(null);
  const [showMobileFilter, setShowMobileFilter] = useState(false);

  const defaultFilters = { search: "", locationType: [], price: "Semua", category: "" };
  const [filters,      setFilters]      = useState(defaultFilters);
  const [applied,      setApplied]      = useState(defaultFilters);

  // Fetch
  useEffect(() => {
    (async () => {
      try {
        const res    = await api.get("/events");
        const result = res.data;
        const raw    = result?.data?.data ?? result?.data ?? result;
        setEvents(raw);
        setFiltered(raw);
      } catch (err) {
        console.error(err);
        setError("Gagal memuat data event. Pastikan server menyala.");
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  // Apply filters
  const applyFilters = () => {
    setApplied(filters);
    let result = [...events];

    if (filters.search.trim()) {
      result = result.filter((ev) =>
        ev.title?.toLowerCase().includes(filters.search.toLowerCase())
      );
    }
    if (filters.locationType.includes("Online") && !filters.locationType.includes("In-Person")) {
      result = result.filter((ev) => ev.is_online);
    }
    if (filters.locationType.includes("In-Person") && !filters.locationType.includes("Online")) {
      result = result.filter((ev) => ev.is_in_person);
    }
    if (filters.price === "Gratis")   result = result.filter((ev) => !ev.price || ev.price === 0 || ev.price === "0");
    if (filters.price === "Berbayar") result = result.filter((ev) => ev.price && ev.price !== 0 && ev.price !== "0");

    setFiltered(result);
    setShowMobileFilter(false);
  };

  const resetFilters = () => {
    setFilters(defaultFilters);
    setApplied(defaultFilters);
    setFiltered(events);
  };

  const handleChange = (key, val) => setFilters((prev) => ({ ...prev, [key]: val }));

  // Active filter count
  const activeCount =
    (applied.search ? 1 : 0) +
    applied.locationType.length +
    (applied.price !== "Semua" ? 1 : 0) +
    (applied.category ? 1 : 0);

  return (
    <div style={{ background: "var(--color-bg)", minHeight: "100vh", paddingBottom: 56 }}>

      {/* ── PAGE HEADER ─────────────────────────────────────────────────── */}
      <div style={{ background: "var(--color-white)", borderBottom: "1px solid var(--color-border)", padding: "28px 0 24px", marginBottom: 32, boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
        <Container>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 12 }}>
            <div>
              <h2 style={{ fontWeight: 800, color: "var(--color-text)", margin: 0, fontSize: "var(--font-xl)" }}>Eksplor Event</h2>
              <p style={{ color: "var(--color-secondary)", margin: "4px 0 0", fontSize: "var(--font-sm)" }}>
                Temukan event terbaik dari seluruh kampus Indonesia
              </p>
            </div>
            {/* Mobile filter toggle */}
            <button
              className="d-lg-none"
              onClick={() => setShowMobileFilter(true)}
              style={{ background: "var(--color-primary)", color: "#fff", border: "none", borderRadius: 8, padding: "8px 16px", fontSize: "var(--font-sm)", fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}
            >
              <SlidersHorizontal size={14} /> Filter {activeCount > 0 && `(${activeCount})`}
            </button>
          </div>
        </Container>
      </div>

      {/* ── MOBILE FILTER OVERLAY ────────────────────────────────────────── */}
      {showMobileFilter && (
        <div style={{ position: "fixed", inset: 0, zIndex: 1050, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "flex-end" }}
          onClick={() => setShowMobileFilter(false)}>
          <div style={{ background: "var(--color-white)", borderRadius: "16px 16px 0 0", width: "100%", maxHeight: "85vh", overflow: "auto", padding: 20 }}
            onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <span style={{ fontWeight: 700, fontSize: "var(--font-md)", color: "var(--color-text)" }}>Filter Event</span>
              <button onClick={() => setShowMobileFilter(false)} style={{ background: "none", border: "none", cursor: "pointer" }}>
                <X size={20} color="var(--color-secondary)" />
              </button>
            </div>
            <FilterSidebar filters={filters} onChange={handleChange} onReset={resetFilters} onApply={applyFilters} />
          </div>
        </div>
      )}

      <Container>
        <Row className="g-4">

          {/* ── SIDEBAR (desktop) ───────────────────────────────────────── */}
          <Col lg={3} className="d-none d-lg-block">
            <FilterSidebar filters={filters} onChange={handleChange} onReset={resetFilters} onApply={applyFilters} />
          </Col>

          {/* ── CONTENT ─────────────────────────────────────────────────── */}
          <Col lg={9}>

            {/* Result info + active filter chips */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8, marginBottom: activeCount > 0 ? 10 : 0 }}>
                <span style={{ fontSize: "var(--font-sm)", color: "var(--color-secondary)", fontWeight: 500 }}>
                  {isLoading ? "Memuat…" : `Menampilkan ${filtered.length} event`}
                </span>
              </div>

              {/* Active filter chips */}
              {activeCount > 0 && (
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {applied.search && (
                    <span style={chipStyle}>"{applied.search}" <X size={10} style={{ cursor: "pointer", marginLeft: 2 }} onClick={() => { handleChange("search",""); setFilters((p) => ({...p, search:""})); }} /></span>
                  )}
                  {applied.locationType.map((t) => (
                    <span key={t} style={chipStyle}>{t} <X size={10} style={{ cursor: "pointer", marginLeft: 2 }} onClick={() => handleChange("locationType", applied.locationType.filter((x) => x !== t))} /></span>
                  ))}
                  {applied.price !== "Semua" && (
                    <span style={chipStyle}>{applied.price} <X size={10} style={{ cursor: "pointer", marginLeft: 2 }} onClick={() => handleChange("price","Semua")} /></span>
                  )}
                  {applied.category && (
                    <span style={chipStyle}>{applied.category} <X size={10} style={{ cursor: "pointer", marginLeft: 2 }} onClick={() => handleChange("category","")} /></span>
                  )}
                  <button onClick={resetFilters} style={{ background: "none", border: "none", fontSize: "var(--font-xs)", color: "var(--color-secondary)", cursor: "pointer", padding: "2px 4px", fontWeight: 600 }}>
                    Hapus semua
                  </button>
                </div>
              )}
            </div>

            {/* Loading */}
            {isLoading && (
              <div style={{ textAlign: "center", padding: "56px 0" }}>
                <Spinner animation="border" style={{ color: "var(--color-primary)" }} />
                <p style={{ marginTop: 12, color: "var(--color-secondary)", fontSize: "var(--font-sm)" }}>Memuat data event…</p>
              </div>
            )}

            {/* Error */}
            {error && (
              <Alert style={{ borderRadius: 10, fontSize: "var(--font-sm)", background: "var(--error-bg)", border: "1px solid var(--error-border)", color: "var(--error-text)" }}>
                {error}
              </Alert>
            )}

            {/* Empty */}
            {!isLoading && !error && filtered.length === 0 && (
              <div style={{ textAlign: "center", padding: "56px 0", color: "var(--color-secondary)" }}>
                <Search size={40} style={{ marginBottom: 12, opacity: 0.3 }} />
                <p style={{ fontWeight: 600, margin: "0 0 6px", color: "var(--color-text)" }}>Tidak ada event ditemukan</p>
                <p style={{ fontSize: "var(--font-sm)", margin: 0 }}>Coba ubah filter pencarianmu</p>
                <button onClick={resetFilters} style={{ marginTop: 16, background: "var(--color-primary)", color: "#fff", border: "none", borderRadius: 8, padding: "8px 20px", fontSize: "var(--font-sm)", fontWeight: 600, cursor: "pointer" }}>
                  Reset Filter
                </button>
              </div>
            )}

            {/* Grid */}
            {!isLoading && !error && filtered.length > 0 && (
              <Row className="g-4">
                {filtered.map((ev) => (
                  <Col xs={12} md={6} xl={4} key={ev.id}>
                    <EventCard ev={ev} />
                  </Col>
                ))}
              </Row>
            )}
          </Col>
        </Row>
      </Container>
    </div>
  );
};

// ── Shared chip style ─────────────────────────────────────────────────────────
const chipStyle = {
  display: "inline-flex", alignItems: "center", gap: 4,
  background: "var(--bahama-blue-50)", color: "var(--color-primary)",
  border: "1px solid var(--color-border-blue)", borderRadius: 99,
  padding: "3px 10px", fontSize: 11, fontWeight: 600,
};

export default ExploreEvents;