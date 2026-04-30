import { useState, useRef, useCallback } from 'react';

export const useDraggable = (initialFields) => {
  const [fields, setFields] = useState(initialFields);
  const [dragging, setDragging] = useState(null);
  const [selected, setSelected] = useState(null);
  const canvasRef = useRef(null);

  const onMouseDown = useCallback((e, id) => {
    e.preventDefault();
    setSelected(id);
    setDragging({ id, startX: e.clientX, startY: e.clientY });
  }, []);

  const onMouseMove = useCallback((e) => {
    if (!dragging || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const newX = Math.max(5, Math.min(85, ((e.clientX - rect.left) / rect.width) * 100));
    const newY = Math.max(5, Math.min(85, ((e.clientY - rect.top) / rect.height) * 100));
    setFields(prev =>
      prev.map(f => f.id === dragging.id ? { ...f, x: newX, y: newY } : f)
    );
  }, [dragging]);

  const onMouseUp = useCallback(() => setDragging(null), []);

  const addField = useCallback((field) => {
    setFields(prev => [...prev, { ...field, x: 50, y: 50 }]);
  }, []);

  const removeField = useCallback((id) => {
    setFields(prev => prev.filter(f => f.id !== id));
    setSelected(null);
  }, []);

  return { fields, selected, setSelected, canvasRef, onMouseDown, onMouseMove, onMouseUp, addField, removeField };
};
