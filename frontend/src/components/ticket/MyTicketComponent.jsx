import React, { useState, useEffect } from 'react';
import { Card, Button, Badge, Spinner } from 'react-bootstrap';
import { RefreshCcw } from 'lucide-react';
import QRCode from 'react-qr-code';
import axios from 'axios';

const MyTicketComponent = ({ ticketData }) => {
  const [qrToken, setQrToken] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchQrCode = async () => {
      if (!ticketData?.ticket_code) return;
      setLoading(true);
      try {
          const res = await axios.get(`/api/tickets/${ticketData.ticket_code}/qr-string`);
          setQrToken(res.data.qr_string);
      } catch (error) {
          console.error("Gagal mengambil QR Code:", error);
      } finally {
          setLoading(false);
      }
  };

  useEffect(() => {
      fetchQrCode();
  }, [ticketData]);

  return (
    <Card className="text-center p-4 border-0 shadow-sm mx-auto" style={{ maxWidth: '400px', borderRadius: '16px' }}>
      <Card.Body>
        <Card.Title className="fw-bold mb-1">Tiket Saya</Card.Title>
        <Badge bg="success" className="mb-3 px-3 py-2 rounded-pill">Active</Badge>
        <Card.Text className="text-muted small mb-4">
          Tunjukkan QR Code ini kepada panitia saat registrasi event.
        </Card.Text>
        
        <div className="my-4 d-flex justify-content-center align-items-center border border-2 p-3 rounded-4 bg-light mx-auto" style={{ width: '220px', height: '220px' }}>
          {loading ? (
             <Spinner animation="border" variant="primary" />
          ) : qrToken ? (
             <QRCode value={qrToken} size={180} />
          ) : (
             <span className="text-muted small">Loading QR...</span>
          )}
        </div>

        <h5 className="font-monospace mb-4 letter-spacing-2">
            {ticketData?.ticket_code || '---'}
        </h5>

        <Button 
            variant="outline-primary" 
            onClick={fetchQrCode} 
            disabled={loading}
            className="d-flex align-items-center justify-content-center gap-2 mx-auto lh-1 rounded-pill px-4"
        >
          <RefreshCcw size={16} className={loading ? "animate-spin" : ""} /> Refresh Code
        </Button>
      </Card.Body>
    </Card>
  );
};

export default MyTicketComponent;
