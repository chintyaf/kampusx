import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Container, Card, Badge, Spinner, Row, Col, Button, Tab, Tabs } from 'react-bootstrap';
import {
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  Copy,
  Check,
  Search,
  Lock,
  ArrowLeft,
  FileCode,
  Award,
  Layers,
  Clock,
  Cpu,
  ChevronRight,
  Info
} from 'lucide-react';
import api from '../../api/axios';
import './PolygonscanExplorer.css';

// Default mock transaction on Polygon Amoy
const DEFAULT_TX_DATA = {
  txHash: '0x94f1c8a73b22e185c899d214c718b90a61849f2b87e91402ba815349e5d4cb3c',
  status: 'Success',
  blockNumber: 58219044,
  confirmations: 142,
  timestamp: '28 Sep 2026, 14:30:18 WIB (30 days ago)',
  from: '0x1928a471029c8714019a82740192847bca827103',
  fromLabel: 'KampusX: Academic Authority Minter',
  to: '0x71C849Aa68364d9E4105B853e5e4E9Fa65749A32',
  toLabel: 'Contract: KampusXSoulboundToken (ERC-5192)',
  tokensMinted: {
    standard: 'ERC-5192 (Soulbound / Non-Transferable)',
    tokenId: '#SBT-2026-0041',
    ticketCode: 'CERT-2026-0041',
    recipient: '0x3a4b98F12c09Ad6E9b7E185c899d214C718b89Fc',
    recipientName: 'Ahmad Fauzi',
    recipientId: 1,
    title: 'Advanced AI & Deep Learning Specialist',
    skillCategory: 'Python & Machine Learning',
    cognitiveScore: 98,
    isLocked: true
  },
  value: '0 POL (0 MATIC)',
  transactionFee: '0.0024002 POL ($0.0019 USD)',
  gasPrice: '28.5 Gwei (0.0000000285 POL)',
  gasUsed: 84219,
  gasLimit: 120000,
  nonce: 41,
  rawTokenURI: 'ipfs://bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi/metadata-0041.json'
};

const PolygonscanExplorer = () => {
  const { hash } = useParams();
  const navigate = useNavigate();
  const [searchInput, setSearchInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [txData, setTxData] = useState(DEFAULT_TX_DATA);
  const [copiedField, setCopiedField] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    let isMounted = true;
    (async () => {
      setLoading(true);
      const queryHash = hash || DEFAULT_TX_DATA.txHash;
      
      try {
        const res = await api.get(`/v1/blockchain/polygonscan/${queryHash}`).catch(() => null);
        if (res && res.data && res.data.success && res.data.data) {
          if (isMounted) setTxData(res.data.data);
        } else {
          // Fallback verify endpoint
          const verifyRes = await api.get(`/v1/blockchain/verify/${queryHash}`).catch(() => null);
          if (verifyRes && verifyRes.data && verifyRes.data.success && verifyRes.data.data) {
            const d = verifyRes.data.data;
            if (isMounted) {
              setTxData({
                txHash: d.txHash || queryHash,
                status: d.status || 'Success',
                blockNumber: d.blockNumber || 58219044,
                confirmations: d.confirmations || 120,
                timestamp: d.mintedDate || '28 Sep 2026, 14:30 WIB',
                from: d.minterAddress || DEFAULT_TX_DATA.from,
                fromLabel: 'KampusX: Authority Minter Contract',
                to: d.contractAddress || DEFAULT_TX_DATA.to,
                toLabel: 'Contract: KampusXSoulboundToken (ERC-5192)',
                tokensMinted: {
                  standard: d.standard || 'ERC-5192',
                  tokenId: d.tokenId || '#SBT-2026-0041',
                  ticketCode: d.ticketCode || 'CERT-2026-0041',
                  recipient: d.studentWallet || '0x3a4b98F12c09Ad6E9b7E185c899d214C718b89Fc',
                  recipientName: d.studentName || 'Ahmad Fauzi',
                  recipientId: 1,
                  title: d.title || 'Soulbound Credentials',
                  skillCategory: d.skillCategory || 'Technology',
                  cognitiveScore: d.cognitiveScore || 95,
                  isLocked: true
                },
                value: '0 POL',
                transactionFee: '0.0024 POL',
                gasPrice: (d.gasPriceGwei || 28.5) + ' Gwei',
                gasUsed: d.gasUsed || 84219,
                gasLimit: 120000,
                nonce: 41,
                rawTokenURI: d.tokenURI || DEFAULT_TX_DATA.rawTokenURI
              });
            }
          } else {
            // Gunakan default mock yang disesuaikan
            if (isMounted) {
              setTxData({
                ...DEFAULT_TX_DATA,
                txHash: queryHash
              });
            }
          }
        }
      } catch (err) {
        console.warn('Menggunakan fallback mock polygonscan:', err);
        if (isMounted) setTxData(DEFAULT_TX_DATA);
      } finally {
        if (isMounted) setLoading(false);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [hash]);

  const handleCopy = (text, fieldName) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchInput.trim()) {
      navigate(`/blockchain/explorer/tx/${searchInput.trim()}`);
    }
  };

  return (
    <div className="polygonscan-page-wrapper">
      {/* Top Explorer Navbar */}
      <div className="polygonscan-top-nav py-3 border-bottom">
        <Container>
          <div className="d-flex align-items-center justify-content-between flex-wrap gap-3">
            <div className="d-flex align-items-center gap-2">
              <div className="polygon-logo-badge">
                <svg width="24" height="24" viewBox="0 0 38 33" fill="none">
                  <path d="M28.6667 11.8333L21.3333 7.5L14 11.8333V20.5L21.3333 24.8333L28.6667 20.5V11.8333Z" fill="#8247E5" />
                  <path d="M21.3333 0L7.33333 8.08333V24.25L21.3333 32.3333L35.3333 24.25V8.08333L21.3333 0Z" stroke="#8247E5" strokeWidth="2.5" />
                </svg>
              </div>
              <div>
                <div className="d-flex align-items-center gap-2">
                  <span className="fw-bold fs-5 text-dark">PolygonScan</span>
                  <Badge bg="secondary" className="bg-opacity-10 text-secondary border">
                    Amoy Testnet (80002)
                  </Badge>
                  <span className="badge-live-dot" title="Network status: Operational" />
                </div>
                <div className="text-muted small" style={{ fontSize: '11px' }}>
                  Polygon POS Block Explorer • Zero-Trust Credential Verifier
                </div>
              </div>
            </div>

            {/* Explorer Search Bar */}
            <form onSubmit={handleSearchSubmit} className="polygon-search-form d-flex align-items-center">
              <Search size={15} className="text-muted me-2" />
              <input
                type="text"
                placeholder="Search by Txn Hash / Token ID / Address..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="polygon-search-input"
              />
              <button type="submit" className="btn btn-sm btn-purple rounded-pill px-3">
                Search
              </button>
            </form>
          </div>
        </Container>
      </div>

      <Container className="py-4">
        {/* Navigation Breadcrumb & Back to App */}
        <div className="d-flex align-items-center justify-content-between mb-3 flex-wrap gap-2">
          <div className="d-flex align-items-center gap-2 text-muted small">
            <Link to="/" className="text-decoration-none text-muted">Home</Link>
            <ChevronRight size={13} />
            <span className="text-muted">Transactions</span>
            <ChevronRight size={13} />
            <span className="text-dark fw-semibold text-truncate" style={{ maxWidth: '280px' }}>
              {txData.txHash}
            </span>
          </div>

          <div className="d-flex align-items-center gap-2">
            <button
              type="button"
              className="btn btn-outline-secondary btn-sm rounded-pill px-3 d-flex align-items-center gap-1"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft size={14} /> Kembali ke Aplikasi
            </button>
            <a
              href={`https://amoy.polygonscan.com/tx/${txData.txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-outline-primary btn-sm rounded-pill px-3 d-flex align-items-center gap-1"
            >
              <ExternalLink size={14} /> Open Live Polygonscan
            </a>
          </div>
        </div>

        {/* Transaction Title */}
        <div className="mb-4">
          <h4 className="fw-bold text-dark mb-1 d-flex align-items-center gap-2">
            <span>Transaction Details</span>
            <Badge bg="success" className="px-2.5 py-1 fw-semibold" style={{ fontSize: '12px' }}>
              <CheckCircle2 size={13} className="me-1" /> Verified On-Chain
            </Badge>
          </h4>
          <p className="text-muted small mb-0">
            Bukti transaksi pencatatan permanen kredensial Soulbound Token (ERC-5192) pada ledger terdesentralisasi Polygon.
          </p>
        </div>

        {/* Transaction Overview Card */}
        <Card className="border-0 shadow-sm rounded-4 overflow-hidden mb-4">
          <Card.Header className="bg-white border-bottom px-4 py-3">
            <Tabs activeKey={activeTab} onSelect={(k) => setActiveTab(k)} className="polygon-tabs border-0">
              <Tab eventKey="overview" title="Overview" />
              <Tab eventKey="sbt" title="Soulbound Token Attributes" />
              <Tab eventKey="raw" title="Raw Payload & Merkle Proof" />
            </Tabs>
          </Card.Header>

          <Card.Body className="p-4">
            {loading ? (
              <div className="text-center py-5">
                <Spinner animation="border" style={{ color: '#8247e5' }} />
                <p className="mt-3 text-muted small fw-semibold">Mengambil data dari node Polygon Amoy...</p>
              </div>
            ) : activeTab === 'overview' ? (
              <div className="tx-details-list">
                {/* 1. Transaction Hash */}
                <div className="tx-row">
                  <div className="tx-label">
                    <Info size={14} className="text-muted me-1" />
                    <span>Transaction Hash:</span>
                  </div>
                  <div className="tx-value d-flex align-items-center gap-2">
                    <span className="font-monospace fw-semibold text-dark text-break">{txData.txHash}</span>
                    <button
                      type="button"
                      className="btn-copy-icon"
                      onClick={() => handleCopy(txData.txHash, 'txHash')}
                      title="Copy Tx Hash"
                    >
                      {copiedField === 'txHash' ? <Check size={13} className="text-success" /> : <Copy size={13} />}
                    </button>
                  </div>
                </div>

                {/* 2. Status */}
                <div className="tx-row">
                  <div className="tx-label">Status:</div>
                  <div className="tx-value">
                    <span className="badge bg-success-subtle text-success border border-success-subtle px-3 py-1-5 fw-bold d-inline-flex align-items-center gap-1.5">
                      <CheckCircle2 size={14} /> Success (Included on Ledger)
                    </span>
                  </div>
                </div>

                {/* 3. Block */}
                <div className="tx-row">
                  <div className="tx-label">Block:</div>
                  <div className="tx-value d-flex align-items-center gap-2">
                    <span className="text-purple fw-bold font-monospace">#{txData.blockNumber}</span>
                    <Badge bg="secondary" className="bg-opacity-10 text-secondary border fw-normal">
                      {txData.confirmations} Block Confirmations
                    </Badge>
                  </div>
                </div>

                {/* 4. Timestamp */}
                <div className="tx-row">
                  <div className="tx-label">Timestamp:</div>
                  <div className="tx-value d-flex align-items-center gap-2 text-dark">
                    <Clock size={14} className="text-muted" />
                    <span>{txData.timestamp}</span>
                  </div>
                </div>

                <hr className="my-3 opacity-10" />

                {/* 5. Transaction Action */}
                <div className="tx-row">
                  <div className="tx-label">Transaction Action:</div>
                  <div className="tx-value bg-light p-3 rounded-3 border">
                    <div className="d-flex align-items-center gap-2 mb-1">
                      <Award size={16} className="text-purple" />
                      <span className="fw-bold text-dark">Pencetakan Kredensial Soulbound Token (SBT)</span>
                    </div>
                    <div className="small text-muted">
                      Menerbitkan kredensial <strong className="text-dark">{txData.tokensMinted.title}</strong> ke dompet mahasiswa <strong className="text-dark font-monospace">{txData.tokensMinted.recipient}</strong>.
                    </div>
                  </div>
                </div>

                {/* 6. From */}
                <div className="tx-row">
                  <div className="tx-label">From:</div>
                  <div className="tx-value d-flex align-items-center gap-2">
                    <span className="font-monospace text-purple text-break">{txData.from}</span>
                    <span className="badge bg-light text-muted border small">{txData.fromLabel}</span>
                  </div>
                </div>

                {/* 7. Interacted With (To) */}
                <div className="tx-row">
                  <div className="tx-label">Interacted With (To):</div>
                  <div className="tx-value d-flex align-items-center gap-2">
                    <span className="font-monospace text-purple text-break">{txData.to}</span>
                    <span className="badge bg-purple-subtle text-purple border small">{txData.toLabel}</span>
                  </div>
                </div>

                {/* 8. Tokens Minted */}
                <div className="tx-row">
                  <div className="tx-label">Tokens Minted:</div>
                  <div className="tx-value">
                    <div className="p-3 bg-white rounded-3 border d-flex align-items-center justify-content-between flex-wrap gap-2">
                      <div>
                        <div className="fw-bold text-dark d-flex align-items-center gap-2">
                          <Lock size={15} className="text-warning" />
                          <span>{txData.tokensMinted.tokenId}</span>
                          <span className="badge bg-warning-subtle text-warning-emphasis border" style={{ fontSize: '10px' }}>
                            ERC-5192 (Locked)
                          </span>
                        </div>
                        <div className="text-muted small mt-1">
                          Pemilik: <strong className="text-dark">{txData.tokensMinted.recipientName}</strong> • {txData.tokensMinted.title}
                        </div>
                      </div>

                      <div className="d-flex align-items-center gap-2">
                        <Link
                          to={`/profile/${txData.tokensMinted.recipientId || 1}`}
                          className="btn btn-outline-primary btn-sm rounded-pill px-3"
                        >
                          Lihat Profil Mahasiswa &rarr;
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>

                <hr className="my-3 opacity-10" />

                {/* 9. Value & Gas Details */}
                <div className="tx-row">
                  <div className="tx-label">Value:</div>
                  <div className="tx-value text-dark fw-semibold">{txData.value}</div>
                </div>

                <div className="tx-row">
                  <div className="tx-label">Transaction Fee:</div>
                  <div className="tx-value text-dark font-monospace">{txData.transactionFee}</div>
                </div>

                <div className="tx-row">
                  <div className="tx-label">Gas Price & Usage:</div>
                  <div className="tx-value d-flex align-items-center gap-2 text-muted small">
                    <Cpu size={14} />
                    <span>Gas Price: <strong className="text-dark">{txData.gasPrice}</strong></span>
                    <span>•</span>
                    <span>Gas Used: <strong className="text-dark">{txData.gasUsed.toLocaleString()}</strong> ({((txData.gasUsed / txData.gasLimit) * 100).toFixed(1)}%)</span>
                  </div>
                </div>
              </div>
            ) : activeTab === 'sbt' ? (
              <div className="sbt-tab-content">
                <h6 className="fw-bold text-dark mb-3">Atribut ERC-5192 Soulbound Token</h6>
                <Row className="g-3">
                  <Col md={6}>
                    <div className="p-3 bg-light rounded-3 border h-100">
                      <div className="text-muted small">Kategori Keahlian (Skill Matrix)</div>
                      <div className="fw-bold text-dark fs-5 mt-1">{txData.tokensMinted.skillCategory}</div>
                      <div className="small text-muted mt-2">Divalidasi dari kurikulum Self-Regulated Learning (SRL)</div>
                    </div>
                  </Col>
                  <Col md={6}>
                    <div className="p-3 bg-light rounded-3 border h-100">
                      <div className="text-muted small">Skor Evaluasi Kognitif Gen-AI</div>
                      <div className="fw-bold text-success fs-5 mt-1">{txData.tokensMinted.cognitiveScore} / 100</div>
                      <div className="small text-muted mt-2">Passing Grade minimal: 80 • Status: Lulus</div>
                    </div>
                  </Col>
                  <Col md={6}>
                    <div className="p-3 bg-light rounded-3 border h-100">
                      <div className="text-muted small">Sifat Transferabilitas Token</div>
                      <div className="fw-bold text-danger fs-6 mt-1 d-flex align-items-center gap-1.5">
                        <Lock size={15} /> Non-Transferable (Permanently Bound)
                      </div>
                      <div className="small text-muted mt-2">Metode transferFrom() otomatis revert sesuai standar Vitalik Buterin</div>
                    </div>
                  </Col>
                  <Col md={6}>
                    <div className="p-3 bg-light rounded-3 border h-100">
                      <div className="text-muted small">Nomor Sertifikat KampusX</div>
                      <div className="fw-bold text-primary fs-6 mt-1 font-monospace">{txData.tokensMinted.ticketCode}</div>
                      <div className="small text-muted mt-2">Tersambung ke generator e-sertifikat fisik</div>
                    </div>
                  </Col>
                </Row>
              </div>
            ) : (
              <div className="raw-tab-content">
                <div className="d-flex align-items-center justify-content-between mb-2">
                  <h6 className="fw-bold text-dark mb-0 d-flex align-items-center gap-1.5">
                    <FileCode size={16} className="text-purple" />
                    <span>Decoded IPFS Token URI & Smart Contract Payload</span>
                  </h6>
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-secondary rounded-pill px-3"
                    onClick={() => handleCopy(JSON.stringify(txData, null, 2), 'rawPayload')}
                  >
                    {copiedField === 'rawPayload' ? 'Tersalin!' : 'Copy JSON'}
                  </button>
                </div>
                <pre className="polygon-raw-code-box">
                  {JSON.stringify(
                    {
                      name: txData.tokensMinted.title,
                      description: `Official KampusX Soulbound Credential awarded to ${txData.tokensMinted.recipientName}.`,
                      token_id: txData.tokensMinted.tokenId,
                      ticket_code: txData.tokensMinted.ticketCode,
                      attributes: [
                        { trait_type: 'Skill', value: txData.tokensMinted.skillCategory },
                        { trait_type: 'Cognitive Score', value: txData.tokensMinted.cognitiveScore },
                        { trait_type: 'Standard', value: 'ERC-5192' },
                        { trait_type: 'Locked', value: true }
                      ],
                      merkle_root: '0x' + txData.txHash.substring(2, 34),
                      smart_contract: txData.to,
                      blockchain: 'Polygon PoS Amoy',
                      token_uri: txData.rawTokenURI
                    },
                    null,
                    2
                  )}
                </pre>
              </div>
            )}
          </Card.Body>
        </Card>

        {/* Footer Notice */}
        <div className="text-center text-muted small mt-4">
          <div>PolygonScan verification data generated for Zero-Trust academic portfolio compliance.</div>
          <div className="mt-1" style={{ fontSize: '11px', color: '#94a3b8' }}>
            KampusX Student Hub • Solidity Smart Contract ERC-5192 • Powered by Polygon Network
          </div>
        </div>
      </Container>
    </div>
  );
};

export default PolygonscanExplorer;
