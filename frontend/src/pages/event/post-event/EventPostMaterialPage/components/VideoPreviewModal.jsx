import React from 'react';
import { Modal, Button } from 'react-bootstrap';
import { Video, ExternalLink, X } from 'lucide-react';

const VideoPreviewModal = ({ url, onClose }) => {
  const isYoutube = url.includes('youtube.com') || url.includes('youtu.be');
  const isDrive = url.includes('drive.google.com');

  let embedUrl = url;
  if (isYoutube) {
    const id = url.match(/(?:v=|youtu\.be\/)([^&?/]+)/)?.[1];
    embedUrl = id ? `https://www.youtube.com/embed/${id}` : url;
  } else if (isDrive) {
    embedUrl = url.replace('/view', '/preview');
  }

  return (
    <Modal show={true} onHide={onClose} size="lg" centered contentClassName="bg-dark text-light border-0">
      <Modal.Header className="border-secondary pb-2 px-3 py-2 bg-dark">
        <div className="d-flex align-items-center justify-content-between w-100">
          <div className="d-flex align-items-center gap-2 small text-light">
            <Video size={16} />
            Video Replay
          </div>
          <div className="d-flex align-items-center gap-2">
            <Button
              variant="outline-secondary"
              size="sm"
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="d-flex align-items-center gap-1 text-light border-secondary"
            >
              <ExternalLink size={14} />
              <small>Buka di Tab Baru</small>
            </Button>
            <Button variant="link" className="text-secondary p-0" onClick={onClose}>
              <X size={20} className="text-light" />
            </Button>
          </div>
        </div>
      </Modal.Header>
      <Modal.Body className="p-0 bg-black d-flex flex-column">
        <div className="w-100 bg-black flex-grow-1 d-flex align-items-center justify-content-center" style={{ aspectRatio: '16/9' }}>
          {isYoutube || isDrive ? (
            <iframe
              src={embedUrl}
              className="w-100 h-100 border-0"
              allowFullScreen
              allow="autoplay; fullscreen"
              title="Video Preview"
            />
          ) : (
            <div className="d-flex flex-column align-items-center justify-content-center text-secondary h-100">
              <Video size={64} className="mb-3 opacity-50" />
              <p className="small mb-2">Preview tidak tersedia untuk URL ini</p>
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary small"
              >
                Buka video di tab baru
              </a>
            </div>
          )}
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default VideoPreviewModal;
