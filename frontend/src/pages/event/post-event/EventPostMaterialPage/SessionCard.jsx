import React, { useState } from 'react';
import { Card, Badge, Button, Form, ButtonGroup, Collapse } from 'react-bootstrap';
import {
  ChevronDown, ChevronRight, Trash2, Video, FileText, Link2, Upload,
  X, CheckCircle, Plus, Eye, ExternalLink, PlayCircle, Download, Users, BarChart2
} from 'lucide-react';
import FilePreviewModal from './FilePreviewModal';
import VideoPreviewModal from './VideoPreviewModal';
import { getFileIcon } from './utils';

const SessionCard = ({ session, sessionNumber, onUpdate, onDelete, hasPreviousSession }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [previewMaterial, setPreviewMaterial] = useState(null);
  const [showVideoPreview, setShowVideoPreview] = useState(false);

  const addMaterial = (e) => {
    const files = Array.from(e.target.files || []);
    const newMaterials = files.map((f) => ({
      id: Date.now().toString() + f.name,
      name: f.name,
      type: f.name.split('.').pop()?.toUpperCase() || 'FILE',
      size: f.size > 1048576 ? `${(f.size / 1048576).toFixed(1)} MB` : `${Math.round(f.size / 1024)} KB`,
      url: URL.createObjectURL(f),
    }));
    onUpdate({ materials: [...session.materials, ...newMaterials] });
  };

  const removeMaterial = (id) => {
    onUpdate({ materials: session.materials.filter((m) => m.id !== id) });
  };

  const completionColorClass =
    session.stats.completionRate >= 70
      ? 'text-success bg-success-subtle'
      : session.stats.completionRate >= 40
      ? 'text-warning bg-warning-subtle'
      : 'text-danger bg-danger-subtle';

  return (
    <>
      <Card className={`border transition-shadow ${isExpanded ? 'shadow-sm border-primary' : 'border-secondary-subtle'}`}>
        {/* Header (Clickable) */}
        <div
          className="d-flex align-items-center gap-3 p-3"
          style={{ cursor: 'pointer' }}
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {/* Badge */}
          <div
            className={`d-flex align-items-center justify-content-center rounded flex-shrink-0 ${session.published ? 'bg-primary text-white' : 'bg-light text-secondary'}`}
            style={{ width: '36px', height: '36px' }}
          >
            {sessionNumber}
          </div>

          {/* Title & Meta */}
          <div className="flex-grow-1 text-truncate">
            <div className="d-flex align-items-center gap-2 flex-wrap">
              <span className="fw-medium text-dark">{session.title}</span>
              {session.published ? (
                <Badge bg="success" className="d-flex align-items-center gap-1 rounded-pill fw-normal">
                  <CheckCircle size={12} /> Dipublikasikan
                </Badge>
              ) : (
                <Badge bg="secondary" className="rounded-pill fw-normal bg-opacity-25 text-secondary border border-secondary-subtle">
                  Draft
                </Badge>
              )}
            </div>
            <p className="text-muted small mb-0 text-truncate">
              {session.date} {session.speaker && `• ${session.speaker}`}
            </p>
          </div>

          {/* Stats */}
          {session.published && (
            <div className="d-none d-md-flex align-items-center gap-3 flex-shrink-0">
              <div className="d-flex align-items-center gap-1 small text-secondary">
                <Users size={16} />
                <span>{session.stats.totalAccess}</span>
              </div>
              <Badge bg="transparent" className={`d-flex align-items-center gap-1 rounded-pill border ${completionColorClass}`}>
                <BarChart2 size={14} />
                {session.stats.completionRate}% selesai
              </Badge>
            </div>
          )}

          {/* Material Count */}
          {session.materials.length > 0 && (
            <div className="d-none d-sm-flex align-items-center gap-1 small text-secondary flex-shrink-0">
              <FileText size={14} />
              {session.materials.length} materi
            </div>
          )}

          {/* Actions */}
          <div className="d-flex align-items-center gap-1 flex-shrink-0">
            <Button
              variant="link"
              className="p-1 text-secondary"
              onClick={(e) => { e.stopPropagation(); onDelete(); }}
              onMouseEnter={(e) => e.currentTarget.classList.replace('text-secondary', 'text-danger')}
              onMouseLeave={(e) => e.currentTarget.classList.replace('text-danger', 'text-secondary')}
            >
              <Trash2 size={18} />
            </Button>
            <span className="text-secondary p-1">
              {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
            </span>
          </div>
        </div>

        {/* Expanded Content */}
        <Collapse in={isExpanded}>
          <div>
            <div className="border-top p-4 d-flex flex-column gap-4">
              {/* Video Replay Section */}
              <div>
                <div className="d-flex align-items-center gap-2 mb-2">
                  <Video size={16} className="text-secondary" />
                  <h6 className="mb-0 text-dark">Video Replay</h6>
                </div>

                <ButtonGroup className="mb-3">
                  {(['none', 'url', 'upload']).map((type) => (
                    <Button
                      key={type}
                      variant={session.videoType === type ? 'light' : 'outline-secondary'}
                      className={`d-flex align-items-center gap-1 ${session.videoType === type ? 'border-secondary-subtle shadow-sm' : 'border-0'}`}
                      onClick={() => onUpdate({ videoType: type })}
                      size="sm"
                    >
                      {type === 'url' && <Link2 size={14} />}
                      {type === 'upload' && <Upload size={14} />}
                      {type === 'none' && 'Tidak Ada'}
                      {type === 'url' && 'Tautkan URL'}
                      {type === 'upload' && 'Upload Video'}
                    </Button>
                  ))}
                </ButtonGroup>

                {session.videoType === 'url' && (
                  <div className="d-flex gap-2">
                    <Form.Control
                      type="url"
                      value={session.videoUrl || ''}
                      onChange={(e) => onUpdate({ videoUrl: e.target.value })}
                      placeholder="https://youtube.com/... atau https://drive.google.com/..."
                      size="sm"
                    />
                    {session.videoUrl && (
                      <Button
                        variant="primary"
                        className="bg-primary-subtle text-primary border-primary-subtle d-flex align-items-center gap-1"
                        size="sm"
                        onClick={() => setShowVideoPreview(true)}
                        style={{ whiteSpace: 'nowrap' }}
                      >
                        <PlayCircle size={16} /> Putar
                      </Button>
                    )}
                  </div>
                )}

                {session.videoType === 'upload' && (
                  session.videoFileName ? (
                    <div className="d-flex align-items-center gap-3 p-3 bg-primary-subtle rounded border border-primary-subtle">
                      <div className="rounded d-flex align-items-center justify-content-center flex-shrink-0 bg-white" style={{ width: '40px', height: '40px' }}>
                        <Video size={20} className="text-primary" />
                      </div>
                      <div className="flex-grow-1 text-truncate">
                        <p className="mb-0 text-dark small">{session.videoFileName}</p>
                        <p className="mb-0 text-muted" style={{ fontSize: '11px' }}>Video • berhasil diunggah</p>
                      </div>
                      <Button variant="light" size="sm" className="d-flex align-items-center gap-1 text-primary border-primary-subtle">
                        <PlayCircle size={14} /> Putar
                      </Button>
                      <Button variant="link" className="p-1 text-secondary" onClick={() => onUpdate({ videoFileName: undefined })}>
                        <X size={16} />
                      </Button>
                    </div>
                  ) : (
                    <label className="d-block border border-2 border-dashed rounded p-5 text-center" style={{ cursor: 'pointer', borderColor: '#dee2e6' }}>
                      <div className="bg-light rounded d-flex align-items-center justify-content-center mx-auto mb-2" style={{ width: '48px', height: '48px' }}>
                        <Upload size={24} className="text-secondary" />
                      </div>
                      <p className="text-muted small mb-1">Klik untuk mengunggah atau seret & lepas</p>
                      <p className="text-muted" style={{ fontSize: '11px' }}>MP4, MOV, atau AVI (Maks. 500MB)</p>
                      <span className="btn btn-dark btn-sm d-inline-flex align-items-center gap-1">
                        <Upload size={14} /> Pilih File Video
                      </span>
                      <input
                        type="file"
                        className="d-none"
                        accept="video/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) onUpdate({ videoFileName: file.name });
                        }}
                      />
                    </label>
                  )
                )}
              </div>

              {/* Materi Unduhan Section */}
              <div>
                <div className="d-flex align-items-center justify-content-between mb-2">
                  <div className="d-flex align-items-center gap-2">
                    <FileText size={16} className="text-secondary" />
                    <h6 className="mb-0 text-dark">Materi Unduhan</h6>
                    {session.materials.length > 0 && (
                      <Badge bg="light" text="secondary" className="rounded-pill border border-secondary-subtle">
                        {session.materials.length}
                      </Badge>
                    )}
                  </div>
                  <label className="text-primary small" style={{ cursor: 'pointer' }}>
                    <Plus size={16} /> Tambah File
                    <input
                      type="file"
                      className="d-none"
                      multiple
                      accept=".pdf,.ppt,.pptx,.doc,.docx,.mp4,.jpg,.png"
                      onChange={addMaterial}
                    />
                  </label>
                </div>

                {session.materials.length > 0 ? (
                  <div className="d-flex flex-column gap-2">
                    {session.materials.map((material) => {
                      const { Icon, bg, color } = getFileIcon(material.type);
                      return (
                        <div
                          key={material.id}
                          className="d-flex align-items-center gap-3 p-2 border border-secondary-subtle rounded bg-white shadow-sm hover-bg-light"
                          style={{ transition: 'background-color 0.2s' }}
                        >
                          <div className="rounded d-flex align-items-center justify-content-center flex-shrink-0" style={{ width: '36px', height: '36px', backgroundColor: bg }}>
                            <Icon size={16} color={color} />
                          </div>
                          <div className="flex-grow-1 text-truncate">
                            <p className="mb-0 text-dark small text-truncate">{material.name}</p>
                            <p className="mb-0 text-muted" style={{ fontSize: '11px' }}>{material.type} • {material.size}</p>
                          </div>
                          <div className="d-flex gap-1 flex-shrink-0">
                            <Button variant="light" size="sm" className="d-flex align-items-center gap-1 border border-secondary-subtle" onClick={() => setPreviewMaterial(material)}>
                              <Eye size={14} /> <span className="d-none d-sm-inline">Lihat</span>
                            </Button>
                            {material.url && (
                              <Button variant="light" size="sm" className="border border-secondary-subtle" href={material.url} download={material.name}>
                                <Download size={14} />
                              </Button>
                            )}
                            <Button variant="link" className="text-secondary p-1" onClick={() => removeMaterial(material.id)}>
                              <X size={16} />
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <label className="d-flex flex-column align-items-center justify-content-center border border-2 border-dashed rounded p-4" style={{ cursor: 'pointer', borderColor: '#dee2e6' }}>
                    <div className="bg-light rounded d-flex align-items-center justify-content-center mx-auto mb-2" style={{ width: '48px', height: '48px' }}>
                      <Upload size={20} className="text-secondary" />
                    </div>
                    <p className="text-muted small mb-1">Belum ada materi diunggah</p>
                    <p className="text-muted" style={{ fontSize: '11px' }}>PDF, PPT, DOCX, atau File Gambar (Maks. 100MB)</p>
                    <input
                      type="file"
                      className="d-none"
                      multiple
                      accept=".pdf,.ppt,.pptx,.doc,.docx,.jpg,.png"
                      onChange={addMaterial}
                    />
                  </label>
                )}
              </div>
            </div>

            {/* Footer Action Bar */}
            <div className="bg-light p-3 border-top rounded-bottom d-flex align-items-center justify-content-between flex-wrap gap-3">
              <p className="text-muted small mb-0 flex-grow-1">
                {session.published
                  ? `Dipublikasikan • tersedia untuk ${session.stats.totalAccess} peserta`
                  : 'Simpan sebagai draft atau publikasikan untuk peserta'}
              </p>
              <div className="d-flex align-items-center gap-2">
                <Button variant="outline-secondary" size="sm" className="bg-white d-flex align-items-center gap-1">
                  <Eye size={14} /> Preview Peserta
                </Button>
                <Button variant="outline-secondary" size="sm" className="bg-white">
                  Simpan Draft
                </Button>
                <Button
                  variant={session.published ? 'secondary' : 'primary'}
                  size="sm"
                  className="d-flex align-items-center gap-1"
                  onClick={() => onUpdate({ published: !session.published })}
                >
                  {session.published ? (
                    <><X size={14} /> Unpublish</>
                  ) : (
                    <><CheckCircle size={14} /> Publikasikan</>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </Collapse>
      </Card>

      {/* Modals */}
      {previewMaterial && (
        <FilePreviewModal material={previewMaterial} onClose={() => setPreviewMaterial(null)} />
      )}
      {showVideoPreview && session.videoUrl && (
        <VideoPreviewModal url={session.videoUrl} onClose={() => setShowVideoPreview(false)} />
      )}
    </>
  );
};

export default SessionCard;
