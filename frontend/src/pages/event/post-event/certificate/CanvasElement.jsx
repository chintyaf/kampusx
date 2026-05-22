import React, { useRef } from "react";
import { QR_PATTERN } from "./constants";

const CanvasElement = ({ el, selected, onSelect, onMove, canvasWidth = 1920 }) => {
  const dragging = useRef(false);
  const startMouse = useRef({ x: 0, y: 0 });
  const startPos = useRef({ x: 0, y: 0 });

  const onMouseDown = (e) => {
    e.stopPropagation();
    onSelect();
    dragging.current = true;
    startMouse.current = { x: e.clientX, y: e.clientY };
    startPos.current = { x: el.x, y: el.y };
    const canvas = e.currentTarget.closest("[data-canvas]");

    const onMouseMove = (ev) => {
      if (!dragging.current || !canvas) return;
      const r = canvas.getBoundingClientRect();
      const dx = ((ev.clientX - startMouse.current.x) / r.width) * 100;
      const dy = ((ev.clientY - startMouse.current.y) / r.height) * 100;
      onMove(
        Math.max(2, Math.min(98, startPos.current.x + dx)),
        Math.max(2, Math.min(98, startPos.current.y + dy))
      );
    };

    const onMouseUp = () => {
      dragging.current = false;
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
  };

  return (
    <div
      onMouseDown={onMouseDown}
      onClick={(e) => e.stopPropagation()}
      className={`position-absolute p-1 rounded-1 ${
        selected ? "border border-2 border-primary" : "border border-2 border-transparent"
      }`}
      style={{
        left: `${el.x}%`,
        top: `${el.y}%`,
        transform: "translate(-50%,-50%)",
        cursor: "grab",
        userSelect: "none",
        transition: "border-color 0.1s",
      }}
    >
      {el.fieldId === "f3" ? (
        <div
          style={{
            width: `${(50 / 1920) * canvasWidth}px`, 
            height: `${(50 / 1920) * canvasWidth}px`, 
            borderRadius: `${(4 / 1920) * canvasWidth}px`,
            backgroundColor: el.color === "#ffffff" ? "#000" : el.color,
            display: "grid", 
            gridTemplateColumns: "repeat(5,1fr)", 
            gap: `${(2 / 1920) * canvasWidth}px`, 
            padding: `${(4 / 1920) * canvasWidth}px`,
          }}
        >
          {QR_PATTERN.map((on, i) => (
            <div key={i} style={{ backgroundColor: on ? "#fff" : "transparent", borderRadius: `${(1 / 1920) * canvasWidth}px` }} />
          ))}
        </div>
      ) : (
        <p
          className="m-0 text-nowrap lh-1 text-center"
          style={{
            fontSize: `${(el.fontSize / 1920) * canvasWidth}px`,
            fontWeight: el.bold ? 700 : 400,
            color: el.color,
          }}
        >
          {el.label}
        </p>
      )}
    </div>
  );
};

export default CanvasElement;