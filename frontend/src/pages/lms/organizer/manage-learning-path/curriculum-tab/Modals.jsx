import { useState } from 'react';
import { Button, Form, Modal } from 'react-bootstrap';
import { FileUp, HelpCircle, PenLine, Trash2 } from 'lucide-react';
import { HoverButton, OutlineButton } from './Buttons';

const titleStyle = { fontSize: 'var(--font-md, 16px)', fontWeight: 700 };

export const AddModuleModal = ({ onClose, onSubmit }) => {
  const [name, setName] = useState('');

  return (
    <Modal show onHide={onClose} centered>
      <Form
        onSubmit={(e) => {
          e.preventDefault();
          if (name.trim()) onSubmit(name.trim());
        }}
      >
        <Modal.Header closeButton>
          <Modal.Title style={titleStyle}>Tambah Module</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group controlId="module-name">
            <Form.Label style={{ fontSize: 'var(--font-sm, 14px)', fontWeight: 600 }}>Nama Module</Form.Label>
            <Form.Control
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: Neural Networks"
              maxLength={120}
              style={{
                padding: '10px 14px',
                fontSize: 'var(--font-sm, 14px)',
                borderColor: 'var(--neutral-border, #e2e8f0)',
                borderRadius: 'var(--radius-md, 10px)',
                backgroundColor: '#f8fafc',
                color: 'var(--color-text, #1e293b)',
              }}
            />
            <Form.Text style={{ fontSize: 'var(--font-xs, 12px)', color: 'var(--neutral-text, #64748b)' }}>
              Deskripsi dan learning outcomes bisa diisi lewat tombol Edit setelah disimpan.
            </Form.Text>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer className="border-0 pt-0">
          <OutlineButton onClick={onClose}>Batal</OutlineButton>
          <Button
            type="submit"
            disabled={!name.trim()}
            style={{
              padding: '8px 16px',
              backgroundColor: 'var(--color-primary, #006699)',
              borderColor: 'var(--color-primary, #006699)',
              color: 'var(--color-white, #ffffff)',
              borderRadius: 'var(--radius-md, 10px)',
              fontSize: 'var(--font-sm, 14px)',
              fontWeight: 600,
            }}
          >
            Tambah Module
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};


export const ConfirmDeleteModal = ({ target, onClose, onConfirm }) => (
  <Modal show onHide={onClose} centered>
    <Modal.Header closeButton>
      <Modal.Title style={titleStyle}>Hapus item ini?</Modal.Title>
    </Modal.Header>
    <Modal.Body style={{ fontSize: 'var(--font-sm, 14px)', lineHeight: 1.5 }}>
      <strong>{target.name}</strong>
      {target.kind === 'module'
        ? ' beserta seluruh lesson dan quiz di dalamnya akan dihapus.'
        : ' akan dihapus dari Module.'}{' '}
      Perubahan baru berlaku setelah Anda menekan Save Changes.
    </Modal.Body>
    <Modal.Footer className="border-0 pt-0">
      <OutlineButton onClick={onClose}>Batal</OutlineButton>
      <Button
        variant="danger"
        onClick={onConfirm}
        className="d-inline-flex align-items-center gap-2"
        style={{ padding: '8px 16px', borderRadius: 'var(--radius-md, 10px)', fontSize: 'var(--font-sm, 14px)', fontWeight: 600 }}
      >
        <Trash2 size={16} /> Hapus
      </Button>
    </Modal.Footer>
  </Modal>
);
