import { useRef, useState } from 'react';

// Mengembalikan:
//   dragProps(data, onDrop, key) -> props untuk elemen yang bisa di-drag / di-drop
//   overStyle(key)               -> style highlight saat elemen sedang di-drag over
const useDragAndDrop = ({ disabled }) => {
  const dragRef = useRef(null);
  const [dragOver, setDragOver] = useState(null);

  const dragProps = (data, onDrop, key) => ({
    draggable: !disabled,
    onDragStart: (e) => {
      e.stopPropagation();
      dragRef.current = data;
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', '');
    },
    onDragOver: (e) => {
      if (!dragRef.current) return;
      e.preventDefault();
      e.stopPropagation();
      setDragOver(key);
    },
    onDrop: (e) => {
      e.preventDefault();
      e.stopPropagation();
      const d = dragRef.current;
      dragRef.current = null;
      setDragOver(null);
      if (d) onDrop(d);
    },
    onDragEnd: () => {
      dragRef.current = null;
      setDragOver(null);
    },
  });

  const overStyle = (key) =>
    dragOver === key ? { boxShadow: '0 0 0 2px var(--color-primary, #006699)' } : {};

  return { dragProps, overStyle };
};

export default useDragAndDrop;
