import { useState } from 'react';
import { Button } from 'react-bootstrap';

// Tombol dengan efek hover (inline CSS tidak punya :hover)
export const HoverButton = ({ style, hoverStyle, disabled, className = '', children, ...rest }) => {
  const [hover, setHover] = useState(false);
  return (
    <Button
      variant="link"
      disabled={disabled}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className={`d-inline-flex align-items-center text-decoration-none ${className}`}
      style={{
        gap: 8,
        fontFamily: 'inherit',
        transition: 'background-color .15s, border-color .15s, color .15s',
        ...style,
        ...(hover && !disabled ? hoverStyle : {}),
      }}
      {...rest}
    >
      {children}
    </Button>
  );
};

// Tombol putih dengan border (Add Module, Batal, dll.)
export const OutlineButton = ({ style, hoverStyle, ...rest }) => (
  <HoverButton
    style={{
      padding: '8px 14px',
      backgroundColor: 'var(--card, #ffffff)',
      border: '1px solid var(--neutral-border, #e2e8f0)',
      borderRadius: 'var(--radius-md, 10px)',
      color: 'var(--color-text, #1e293b)',
      fontSize: 'var(--font-sm, 14px)',
      fontWeight: 600,
      ...style,
    }}
    hoverStyle={{ backgroundColor: 'var(--neutral-bg, #f1f5f9)', ...hoverStyle }}
    {...rest}
  />
);
