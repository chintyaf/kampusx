import React from 'react';
import { Form, InputGroup } from 'react-bootstrap';
import { Search, X, ShieldCheck } from 'lucide-react';

/**
 * Komponen CandidateFilters
 * Filter kandidat yang ringkas dan hanya menggunakan parameter yang didukung backend
 */
const CandidateFilters = ({
  search,
  onSearchChange,
  tier,
  onTierChange,
  sbtOnly,
  onSbtOnlyChange,
  onReset,
}) => {
  const hasActiveFilter = search || tier !== 'ALL' || sbtOnly;

  return (
    <div className="clean-card p-3 mb-3">
      <div className="d-flex align-items-center justify-content-between mb-2">
        <span className="fw-bold text-dark small text-uppercase" style={{ fontSize: '11px', letterSpacing: '0.04em' }}>
          Filter Kandidat
        </span>
        {hasActiveFilter && (
          <button
            type="button"
            className="btn btn-link btn-sm text-decoration-none text-danger p-0"
            style={{ fontSize: '11.5px' }}
            onClick={onReset}
          >
            Reset Filter
          </button>
        )}
      </div>

      {/* Search Input */}
      <div className="mb-2.5">
        <InputGroup size="sm">
          <InputGroup.Text className="bg-white border-end-0 text-muted ps-2.5">
            <Search size={14} />
          </InputGroup.Text>
          <Form.Control
            type="text"
            placeholder="Cari nama atau email..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="border-start-0 border-end-0 ps-1"
            style={{ fontSize: '12.5px' }}
          />
          {search ? (
            <InputGroup.Text
              className="bg-white border-start-0 cursor-pointer text-muted pe-2.5"
              onClick={() => onSearchChange('')}
            >
              <X size={14} />
            </InputGroup.Text>
          ) : (
            <InputGroup.Text className="bg-white border-start-0 pe-2.5 text-muted" />
          )}
        </InputGroup>
      </div>

      {/* Tier Filter */}
      <div className="mb-2.5">
        <Form.Label className="text-muted small mb-1" style={{ fontSize: '11.5px' }}>
          Tingkat Pencapaian (Tier):
        </Form.Label>
        <Form.Select
          size="sm"
          value={tier}
          onChange={(e) => onTierChange(e.target.value)}
          className="rounded-3"
          style={{ fontSize: '12px' }}
        >
          <option value="ALL">Semua Tier</option>
          <option value="Silver">Tier Silver</option>
          <option value="Gold">Tier Gold</option>
          <option value="Platinum">Tier Platinum</option>
        </Form.Select>
      </div>

      {/* Verified Credential Switch */}
      <div className="pt-1">
        <Form.Check
          type="switch"
          id="recruiter-sbt-filter-switch"
          label={
            <span className="small text-dark fw-medium d-inline-flex align-items-center gap-1" style={{ fontSize: '12px' }}>
              <ShieldCheck size={13} className="text-success" /> Kredensial Terverifikasi
            </span>
          }
          checked={sbtOnly}
          onChange={(e) => onSbtOnlyChange(e.target.checked)}
        />
      </div>
    </div>
  );
};

export default CandidateFilters;
