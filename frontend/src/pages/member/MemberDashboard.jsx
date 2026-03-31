import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Badge,
  Spinner,
  Carousel,
} from "react-bootstrap";
import {
  Calendar,
  MapPin,
  QrCode,
  ArrowRight,
  PlayCircle,
  Ticket,
  Award,
  Clock,
  User,
} from "lucide-react";
import { Link } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";

const MemberDashboard = () => {
  const { token, user } = useAuth();

  const [tickets, setTickets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
   const [allEvents, setAllEvents] = useState([]);


  useEffect(() => {
    const fetchEvents = async () => {
          try {
            const response = await axios.get("http://localhost:8000/api/events");
    
            // 1. Tambahkan baris ini persis seperti di halaman Explore
            const eventData = response.data.data || response.data;
    
            // 2. Ganti response.data.map menjadi eventData.map
            const formattedEvents = eventData.map((ev) => ({
              id: ev.id,
              title: ev.title,
              org: ev.organizer ? ev.organizer.name : "Unknown Organizer",
              image: `https://placehold.co/600x300/e2e8f0/64748b?text=Event+${ev.id}`,
    
              // 3. Pastikan ev.start_date adalah nama field yang benar dari API-mu.
              // Kita tambahkan fallback biar kalau datanya kosong nggak error 1970 lagi.
              date: ev.start_date
                ? new Date(ev.start_date).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })
                : "Tanggal Belum Ditentukan",
    
              price: "Cek Detail",
              location:
                ev.location_type === "online" ? "Online Meeting" : "Offline Venue",
              isOnline:
                ev.location_type === "online" || ev.location_type === "hybrid",
              isInPerson:
                ev.location_type === "offline" || ev.location_type === "hybrid",
              isFeatured: ev.id % 2 === 0,
            }));
    
            // Simpan semua data ke allEvents
            setAllEvents(formattedEvents);
          } catch (error) {
            console.error("Gagal mengambil data event:", error);
          } finally {
            setIsLoading(false);
          }
        };
    
        fetchEvents();
      }, []);

  useEffect(() => {
    
      
    const fetchMyTickets = async () => {
      try {
        if (!token) {
          setIsLoading(false);
          return;
        }
        // Ganti URL sesuai endpoint Laravel kamu
        const response = await axios.get(
          "http://localhost:8000/api/my-tickets",
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        setTickets(response.data.data);
      } catch (error) {
        console.error("Gagal mengambil tiket:", error);
        // DUMMY DATA JIKA API BELUM SIAP (Agar UI tetap bisa dilihat)
        setTickets([
          {
            id: 1,
            ticket_code: "TKT-ACTIVE-001",
            status: "active",
            order_item: {
              order: {
                event: {
                  id: 101,
                  title:
                    "Workshop UI/UX Design: Creating Accessible Interfaces",
                  start_date: "10 April 2026",
                  location: "Bandung, ID",
                  image:
                    "https://placehold.co/600x300/e2e8f0/64748b?text=UI/UX+Workshop",
                },
              },
            },
          },
          {
            id: 2,
            ticket_code: "TKT-USED-002",
            status: "used",
            order_item: {
              order: {
                event: {
                  id: 102,
                  title: "Tech Startup Conference 2026",
                  start_date: "15 Mei 2026",
                  location: "Zoom Meeting",
                  image:
                    "https://placehold.co/600x300/e2e8f0/64748b?text=Tech+Conference",
                },
              },
            },
          },
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMyTickets();
  }, [token]);

  if (isLoading) {
    return (
      <div className="text-center py-5 mt-5">
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  // Terbaru: Urutkan ID dari terbesar ke terkecil, ambil 3 teratas
    const eventTerbaru = [...allEvents].sort((a, b) => b.id - a.id).slice(0, 3);

    // Terpopuler: Ambil event yang isFeatured-nya true, ambil 3 teratas
    const eventTerpopuler = [...allEvents]
        .filter((ev) => ev.isFeatured)
        .slice(0, 3);
  // Pisahkan tiket aktif dan riwayat
  const activeTickets = tickets.filter((t) => t.status === "active");
  const historyTickets = tickets.filter(
    (t) => t.status === "used" || t.status === "cancelled",
  );

  
  const banners = [
    {
      id: 1,
      title: "Konser Musik Tahunan",
      image:
        "https://placehold.co/1200x500/e2e8f0/64748b?text=Banner+Konser+Musik",
    },
    {
      id: 2,
      title: "Seminar Nasional Teknologi",
      image:
        "https://placehold.co/1200x500/e2e8f0/64748b?text=Banner+Seminar+Nasional",
    },
    {
      id: 3,
      title: "Workshop Persiapan Karir",
      image:
        "https://placehold.co/1200x500/e2e8f0/64748b?text=Banner+Workshop+Karir",
    },
  ];

  return (
    <div className="bg-light min-vh-100 pb-5">
      <div>
        <section className="bg-light pb-5">
          <Carousel
            interval={3000}
            pause="hover"
            className="w-100 mb-5 custom-carousel"
          >
            {banners.map((banner) => (
              <Carousel.Item key={banner.id}>
                <img
                  src={banner.image}
                  alt={banner.title}
                  className="d-block w-100 object-fit-cover"
                  style={{ height: "clamp(180px, 30vw, 300px)" }}
                />
              </Carousel.Item>
            ))}
          </Carousel>
        </section>
      </div>

      <Container fluid className="px-0">
        {/* 2. SECTION TIKET AKTIF (EVENT BERJALAN) */}
        <div className="mb-5">
          <div className="d-flex justify-content-between align-items-center mb-4 overflow-auto gap-3 pb-2 px-2">
            <h4 className="fw-bold m-0" style={{ color: "var(--color-text)" }}>
              Event Aktif Saya
            </h4>
            <Badge bg="primary" className="rounded-pill px-3 py-2">
              {activeTickets.length} Event
            </Badge>
          </div>

          {activeTickets.length === 0 ? (
            <Card className="border-0 shadow-sm rounded-4 text-center py-5">
              <Card.Body>
                <Ticket size={48} className="text-muted mb-3 opacity-50" />
                <h5 className="fw-bold text-muted">Belum ada event aktif</h5>
                <p className="text-muted small mb-4">
                  Yuk cari event dan mulai tingkatkan *skill* kamu!
                </p>
                <Link to="/explore-events">
                  <Button
                    variant="outline-primary"
                    className="rounded-pill px-4"
                  >
                    Xplore Event
                  </Button>
                </Link>
              </Card.Body>
            </Card>
          ) : (
            <div className="d-flex overflow-auto gap-3 pb-2">
  {activeTickets.map(ticket => {
    const event = ticket.order_item?.order?.event;
    if (!event) return null;

    return (
      <Card 
        key={ticket.id}
        className="border-0 shadow-sm rounded-4 flex-shrink-0"
        style={{ width: "280px" }}
      >
        <img 
          src={event.image || `https://placehold.co/600x400`} 
          alt={event.title}
          className="w-100"
          style={{ height: "140px", objectFit: "cover" }}
        />

        <Card.Body className="p-3">
          <Badge bg="success" className="mb-2 small">
            ONGOING
          </Badge>

          <h6 className="fw-bold text-truncate">{event.title}</h6>

          <div className="text-muted small mb-2">
            <Calendar size={14}/> {event.start_date}
          </div>

          <div className="text-muted small mb-3">
            <MapPin size={14}/> {event.location}
          </div>

          <Link to={`/event-space/${event.id}`}>
            <Button size="sm" className="w-100 rounded-pill">
              Masuk
            </Button>
          </Link>
        </Card.Body>
      </Card>
    );
  })}
</div>
          )}
        </div>

        {/* 3. SECTION RIWAYAT EVENT (Di Bawahnya) */}
        {/* <div>
          <h5 className="fw-bold mb-4 text-muted">Riwayat Event</h5>
          {historyTickets.length === 0 ? (
            <div className="text-center py-4 text-muted small border rounded-4 bg-white">
              Belum ada riwayat event yang diselesaikan.
            </div>
          ) : (
            <Row className="g-3">
              {historyTickets.map((ticket) => {
                const event = ticket.order_item?.order?.event;
                if (!event) return null;

                return (
                  <Col xs={12} md={6} lg={4} key={ticket.id}>
                    <Card className="border-0 shadow-sm rounded-4 h-100">
                      <Card.Body className="p-3">
                        <div className="d-flex justify-content-between align-items-start mb-2">
                          <Badge
                            bg="secondary"
                            className="px-2 py-1 rounded-pill opacity-75"
                          >
                            {ticket.status === "used" ? "SELESAI" : "BATAL"}
                          </Badge>
                        </div>
                        <h6 className="fw-bold mb-2 text-truncate">
                          {event.title}
                        </h6>
                        <div className="d-flex align-items-center text-muted small mb-3 gap-2">
                          <Calendar size={14} /> {event.start_date}
                        </div>
                        <div className="d-flex justify-content-between align-items-center mt-auto border-top pt-2">
                          <span className="text-muted small">
                            Tiket: {ticket.ticket_code}
                          </span>
                          <Link
                            to={`/ticket/${ticket.ticket_code}`}
                            className="text-decoration-none small fw-bold"
                          >
                            Detail
                          </Link>
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                );
              })}
            </Row>
          )}
        </div> */}
      </Container>

      {/* EVENT TERPOPULER*/}
        <section
            className="py-5"
            style={{
            backgroundColor: "var(--color-bg)",
            borderTop: "1px solid var(--color-border)",
            borderBottom: "1px solid var(--color-border)",
            }}
        >
            <Container>
            <h2
                className="fw-bold mb-5 text-center"
                style={{ color: "var(--color-text)" }}
            >
                Event Terpopuler
            </h2>
            {isLoading ? (
                <div className="text-center py-5">
                <Spinner animation="border" variant="primary" />
                <p className="mt-3 text-muted">
                    Mengambil data event dari server...
                </p>
                </div>
            ) : (
                <Row className="g-4">
                {/* SEKARANG .map() AKAN MEMBACA DATA DARI DATABASE */}
                {eventTerpopuler.map((ev) => (
                    <Col xs={12} md={4} key={ev.id}>
                    <Card
                        className="h-100 shadow-sm p-3 hover-lift"
                        style={{
                        borderRadius: "12px",
                        backgroundColor: "var(--color-white)",
                        border: "1px solid var(--color-border)",
                        }}
                    >
                        {/* --- BADGES ATAS (In-Person, Online, Featured) --- */}
                        {/* Ditambahkan minHeight: '28px' agar sejajar */}
                        <div
                        className="d-flex justify-content-between align-items-center mb-3"
                        style={{ minHeight: "28px" }}
                        >
                        <div
                            className="d-flex px-2 py-1 gap-2"
                            style={{ fontSize: "var(--font-xs)" }}
                        >
                            {/* UBAH MENJADI: */}
                            {ev.isInPerson ? (
                            <div
                                className="rounded-pill px-2 py-1 d-flex align-items-center fw-medium bg-white"
                                style={{
                                fontSize: "var(--font-xs)",
                                color: "var(--color-primary)",
                                border: "1px solid var(--color-primary)",
                                }}
                            >
                                <Users size={14} className="me-2" /> In-Person
                            </div>
                            ) : null}
                            {ev.isOnline ? (
                            <div
                                className="rounded-pill px-2 py-1 d-flex align-items-center fw-medium bg-white"
                                style={{
                                fontSize: "var(--font-xs)",
                                color: "var(--color-primary)",
                                border: "1px solid var(--color-primary)",
                                }}
                            >
                                <Wifi size={14} className="me-2" /> Online
                            </div>
                            ) : null}
                        </div>
                        {ev.isFeatured ? (
                            <div
                            className="rounded-pill px-2 py-1 fw-medium"
                            style={{
                                fontSize: "var(--font-xs)",
                                backgroundColor: "var(--bahama-blue-500)",
                                color: "var(--color-white)",
                            }}
                            >
                            Featured
                            </div>
                        ) : null}
                        </div>
    
                        {/* --- GAMBAR EVENT --- */}
                        <img
                        src={ev.image}
                        alt={ev.title}
                        className="w-100 object-fit-cover rounded mb-3"
                        style={{ height: "180px" }}
                        />
    
                        <Card.Body className="p-0 d-flex flex-column">
                        {/* --- INFO TANGGAL & HARGA --- */}
                        <div
                            className="d-flex justify-content-between mb-3 fw-medium"
                            style={{
                            color: "var(--color-primary)",
                            fontSize: "var(--font-sm)",
                            }}
                        >
                            <div className="d-flex align-items-center">
                            <Calendar size={18} className="me-2" /> {ev.date}
                            </div>
                            <div className="d-flex align-items-center">
                            <Ticket size={18} className="me-2" /> {ev.price}
                            </div>
                        </div>
    
                        {/* --- JUDUL EVENT --- */}
                        <Card.Title
                            className="fw-bold mb-auto"
                            style={{
                            color: "var(--color-text)",
                            fontSize: "var(--font-lg)",
                            lineHeight: "1.4",
                            }}
                        >
                            {ev.title}
                        </Card.Title>
    
                        {/* --- GARIS PEMISAH --- */}
                        <hr
                            className="opacity-100 my-3"
                            style={{ color: "var(--color-border)" }}
                        />
    
                        {/* --- INFO LOKASI & PENYELENGGARA --- */}
                        {/* Ditambahkan text-truncate agar teks yang panjang tidak merusak layout */}
                        <div
                            className="d-flex justify-content-between fw-medium"
                            style={{
                            color: "var(--color-primary)",
                            fontSize: "var(--font-sm)",
                            }}
                        >
                            <div
                            className="d-flex align-items-center text-truncate"
                            style={{ maxWidth: "60%" }}
                            >
                            <MapPin size={18} className="me-2 flex-shrink-0" />{" "}
                            <span className="text-truncate">{ev.location}</span>
                            </div>
                            <div
                            className="d-flex align-items-center text-truncate ms-2"
                            style={{ maxWidth: "40%" }}
                            >
                            <User size={18} className="me-2 flex-shrink-0" />{" "}
                            <span className="text-truncate">{ev.org}</span>
                            </div>
                        </div>
                        </Card.Body>
                    </Card>
                    </Col>
                ))}
                </Row>
            )}
            </Container>
        </section>
    </div>
  );
};

export default MemberDashboard;
