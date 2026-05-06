import React from "react";
import { Button } from "react-bootstrap";
import { Award, Eye, Save, Check } from "lucide-react";

const Topbar = ({ saved, onSave }) => {
  return (
    <div className="d-flex align-items-center justify-content-between px-4 py-2 bg-white border-bottom shadow-sm">
      <div className="d-flex align-items-center gap-3">
        <div>
          <h6 className="mb-0 fw-bold">Template Sertifikat</h6>
          <small className="text-muted">Klik elemen untuk mengedit · Tarik untuk memindahkan</small>
        </div>
      </div>

      <div className="d-flex align-items-center gap-2">
        <Button variant="outline-secondary" size="sm" className="d-flex align-items-center gap-2">
          <Eye size={16} /> Preview
        </Button>
        <Button
          variant={saved ? "success" : "dark"}
          size="sm"
          className="d-flex align-items-center gap-2"
          onClick={onSave}
        >
          {saved ? <><Check size={16} /> Tersimpan</> : <><Save size={16} /> Simpan Template</>}
        </Button>
      </div>
    </div>
  );
};

export default Topbar;