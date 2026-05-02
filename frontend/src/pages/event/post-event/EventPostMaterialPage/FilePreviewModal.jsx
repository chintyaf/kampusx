import React from 'react';
import { Modal, Button } from 'react-bootstrap';
import { Download, X } from 'lucide-react';
import { getFileIcon } from './utils';

const FilePreviewModal = ({ material, onClose }) => {
  const { Icon, bg, color } = getFileIcon(material.type);
  const isVideo = ['MP4', 'MOV', 'AVI', 'VIDEO'].includes(material.type.toUpperCase());
  const isPDF = material.type.toUpperCase() === 'PDF';
  const isImage = ['JPG', 'JPEG', 'PNG', 'GIF', 'SVG'].includes(material.type.toUpperCase());

  return (
    <Modal show={true} onHide={onClose} size="lg" centered>
      <Modal.Header className="border-bottom-0 pb-0">
        <div className="d-flex align-items-center gap-3 w-100">
          <div 
            className="rounded d-flex align-items-center justify-content-center flex-shrink-0" 
            style={{ width: '40px', height: '40px', backgroundColor: bg }}
          >
            <Icon size={20} color={color} />
          </div>
          <div className="flex-grow-1 text-truncate">
            <h5 className="mb-0 text-truncate">{material.name}</h5>
            <small className="text-muted">{material.type} • {material.size}</small>
          </div>
          <div className="d-flex gap-2">
            {material.url && (
              <Button 
                variant="outline-secondary" 
                size="sm" 
                href={material.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="d-flex align-items-center gap-1"
              >
                <Download size={16} /> Unduh
              </Button>
            )}
            <Button variant="link" className="text-secondary p-0" onClick={onClose}>
              <X size={24} />
            </Button>
          </div>
        </div>
      </Modal.Header>
      <Modal.Body className="bg-light p-0 mt-3" style={{ minHeight: '400px', display: 'flex', flexDirection: 'column' }}>
        <div className="flex-grow-1 overflow-auto d-flex flex-column">
          {isPDF && material.url ? (
            <iframe
              src={material.url}
              className="w-100 flex-grow-1 border-0"
              style={{ minHeight: '500px' }}
              title={material.name}
            />
          ) : isVideo && material.url ? (
            <div className="d-flex align-items-center justify-content-center p-4 flex-grow-1">
              <video controls className="w-100 rounded shadow-sm" style={{ maxHeight: '500px' }}>
                <source src={material.url} />
                Browser Anda tidak mendukung pemutaran video.
              </video>
            </div>
          ) : isImage && material.url ? (
            <div className="d-flex align-items-center justify-content-center p-4 flex-grow-1">
              <img src={material.url} alt={material.name} className="img-fluid rounded shadow-sm" style={{ maxHeight: '500px', objectFit: 'contain' }} />
            </div>
          ) : (
            <div className="d-flex flex-column align-items-center justify-content-center py-5 text-center flex-grow-1">
              <div 
                className="rounded-3 d-flex align-items-center justify-content-center mb-3" 
                style={{ width: '80px', height: '80px', backgroundColor: bg }}
              >
                <Icon size={40} color={color} />
              </div>
              <p className="mb-1 fw-medium">{material.name}</p>
              <p className="text-muted small mb-4">
                {material.type} • {material.size}
              </p>
              <div className="alert alert-warning" style={{ maxWidth: '300px' }}>
                <small>Preview tidak tersedia untuk tipe file ini. Unduh file untuk melihat isinya.</small>
              </div>
            </div>
          )}
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default FilePreviewModal;
