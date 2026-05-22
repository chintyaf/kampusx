import React, { useEffect, useState } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import api from "@/api/axios";

const ScanDashboard = ({ event, position, pin, onLogout }) => {
  const [stats, setStats] = useState({
    total_registered: 0,
    total_scanned: 0,
    recent: [],
  });

  const [message, setMessage] = useState("");
  const [manualCode, setManualCode] = useState("");

  // ambil statistik
  const fetchStats = async () => {
    try {
      const res = await api.get(
        `/committee/stats?pin=${pin}&position_id=${position.id}`
      );

      setStats(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  // proses scan
  const processScan = async (qrString) => {

  try {

    const res = await api.post(
      "/attendance/scan",
      {
        qr_string: qrString,
        event_id: event.id,
      }
    );

    setMessage("✅ Check-in berhasil");

    fetchStats();

  } catch (error) {

    setMessage(
      error.response?.data?.message ||
      "Gagal scan"
    );
  }
};

  // init qr scanner
  useEffect(() => {
    fetchStats();

    const scanner = new Html5QrcodeScanner(
      "reader",
      {
        fps: 5,
        qrbox: 250,
      },
      false
    );

    scanner.render(
      (decodedText) => {
        processScan(decodedText);
      },
      (error) => {
        // optional
        // console.log(error);
      }
    );

    return () => {
      scanner.clear().catch(() => {});
    };
  }, []);

  // submit manual
  const handleSubmit = (e) => {
    e.preventDefault();

    processScan(manualCode);

    setManualCode("");
  };

  return (
    <div className="container py-4">

      {/* header */}
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <div>
          <h3>{event.title}</h3>

          <p className="text-muted mb-0">
            Pos: {position.name}
          </p>
        </div>

        <button
          className="btn btn-danger"
          onClick={onLogout}
        >
          Logout
        </button>
      </div>

      {/* alert */}
      {message && (
        <div className="alert alert-info">
          {message}
        </div>
      )}

      <div className="row">

        {/* scanner */}
        <div className="col-lg-6 mb-4">

          <div className="card">
            <div className="card-body">

              <h5 className="mb-3">
                Scan QR
              </h5>

              <div id="reader"></div>

            </div>
          </div>

          {/* manual input */}
          <div className="card mt-3">
            <div className="card-body">

              <h5 className="mb-3">
                Input Manual
              </h5>

              <form onSubmit={handleSubmit}>
                <div className="d-flex gap-2">

                  <input
                    type="text"
                    className="form-control"
                    placeholder="Masukkan kode tiket"
                    value={manualCode}
                    onChange={(e) =>
                      setManualCode(e.target.value)
                    }
                  />

                  <button
                    className="btn btn-primary"
                    type="submit"
                  >
                    Scan
                  </button>

                </div>
              </form>

            </div>
          </div>

        </div>

        {/* statistik */}
        <div className="col-lg-6">

          <div className="row g-3 mb-4">

            <div className="col-6">
              <div className="card text-center p-3">
                <h3>{stats.total_registered}</h3>
                <p className="mb-0">
                  Total Tamu
                </p>
              </div>
            </div>

            <div className="col-6">
              <div className="card text-center p-3">
                <h3>{stats.total_scanned}</h3>
                <p className="mb-0">
                  Sudah Hadir
                </p>
              </div>
            </div>

          </div>

          {/* recent scan */}
          <div className="card">
            <div className="card-body">

              <h5 className="mb-3">
                Scan Terbaru
              </h5>

              {stats.recent.length > 0 ? (
                <div>

                  {stats.recent.map((item, index) => (
                    <div
                      key={index}
                      className="border-bottom py-2"
                    >
                      <strong>
                        {item.name}
                      </strong>

                      <br />

                      <small className="text-muted">
                        {item.ticket_code}
                      </small>
                    </div>
                  ))}

                </div>
              ) : (
                <p className="text-muted">
                  Belum ada scan
                </p>
              )}

            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default ScanDashboard;