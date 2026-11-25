import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, ExternalLink, Sparkles, TrendingUp } from 'lucide-react';

const TalentRightSidebar = ({ onFilterBySkill }) => {
  return (
    <div className="linkedin-right-col">
      {/* Live On-Chain SBT Ticker */}
      <div className="clean-card p-3">
        <div className="d-flex align-items-center justify-content-between mb-2">
          <div className="d-flex align-items-center gap-2">
            <span
              className="badge bg-success text-white p-1 rounded-circle"
              style={{ width: '8px', height: '8px', display: 'inline-block' }}
            />
            <h6 className="fw-bold mb-0 text-dark" style={{ fontSize: '13px' }}>
              Live SBT Minting Ticker
            </h6>
          </div>
          <Link
            to="/blockchain/explorer"
            className="text-primary small fw-semibold text-decoration-none"
            style={{ fontSize: '11px' }}
          >
            Explorer <ExternalLink size={11} />
          </Link>
        </div>
        <p className="text-muted small mb-3" style={{ fontSize: '11.5px' }}>
          Pencatatan real-time di ledger Polygon Amoy (ERC-5192):
        </p>

        <div className="d-flex flex-column gap-2 small">
          <Link
            to="/blockchain/explorer/tx/0x94f1c8a73b22e185c899d214c718b90a61849f2b87e91402ba815349e5d4cb3c"
            className="p-2 rounded bg-light border-start border-3 border-success text-decoration-none text-dark d-block hover-shadow"
          >
            <div className="d-flex justify-content-between align-items-center">
              <span className="fw-bold text-dark" style={{ fontSize: '12px' }}>
                Ahmad Fauzi (UGM)
              </span>
              <span className="badge bg-success-subtle text-success" style={{ fontSize: '9.5px' }}>
                Verified
              </span>
            </div>
            <div className="text-muted" style={{ fontSize: '10.5px' }}>
              Minted: Data Science Specialist • Block #58,219,044
            </div>
          </Link>

          <Link
            to="/blockchain/explorer/tx/0x53e1a902cbb3918a4d701e4a68291b29a674510b65f419c832e0192847aef921"
            className="p-2 rounded bg-light border-start border-3 border-primary text-decoration-none text-dark d-block hover-shadow"
          >
            <div className="d-flex justify-content-between align-items-center">
              <span className="fw-bold text-dark" style={{ fontSize: '12px' }}>
                Rian Hidayat (ITB)
              </span>
              <span className="badge bg-primary-subtle text-primary" style={{ fontSize: '9.5px' }}>
                Verified
              </span>
            </div>
            <div className="text-muted" style={{ fontSize: '10.5px' }}>
              Minted: Cloud & Microservices • Block #58,190,412
            </div>
          </Link>

          <Link
            to="/blockchain/explorer/tx/0x17c2f849a902eb3918d6a718c9492e85a67140b91e847192a54b38294719be1a"
            className="p-2 rounded bg-light border-start border-3 border-warning text-decoration-none text-dark d-block hover-shadow"
          >
            <div className="d-flex justify-content-between align-items-center">
              <span className="fw-bold text-dark" style={{ fontSize: '12px' }}>
                Dian Sastro (UI)
              </span>
              <span className="badge bg-warning-subtle text-warning-emphasis" style={{ fontSize: '9.5px' }}>
                Verified
              </span>
            </div>
            <div className="text-muted" style={{ fontSize: '10.5px' }}>
              Minted: UI/UX Master • Block #58,124,500
            </div>
          </Link>
        </div>
      </div>

      {/* Trending Skills Widget */}
      <div className="clean-card p-3">
        <h6 className="fw-bold mb-2 text-dark" style={{ fontSize: '13px' }}>
          🔥 Keahlian Paling Dicari
        </h6>
        <div className="d-flex flex-wrap gap-1-5">
          <button
            type="button"
            className="badge bg-light text-dark border p-1-5 btn border-0 text-start"
            onClick={() => onFilterBySkill && onFilterBySkill('Python')}
          >
            Python (96% demand)
          </button>
          <button
            type="button"
            className="badge bg-light text-dark border p-1-5 btn border-0 text-start"
            onClick={() => onFilterBySkill && onFilterBySkill('Machine Learning')}
          >
            Machine Learning
          </button>
          <button
            type="button"
            className="badge bg-light text-dark border p-1-5 btn border-0 text-start"
            onClick={() => onFilterBySkill && onFilterBySkill('React')}
          >
            React.js
          </button>
          <button
            type="button"
            className="badge bg-light text-dark border p-1-5 btn border-0 text-start"
            onClick={() => onFilterBySkill && onFilterBySkill('Figma')}
          >
            Figma UI/UX
          </button>
          <button
            type="button"
            className="badge bg-light text-dark border p-1-5 btn border-0 text-start"
            onClick={() => onFilterBySkill && onFilterBySkill('Solidity')}
          >
            Solidity (SBT Web3)
          </button>
        </div>
      </div>
    </div>
  );
};

export default TalentRightSidebar;
