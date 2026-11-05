import React, { useState, forwardRef, useEffect } from 'react';
import { T, outlineBtn, inputBase, inputFocus } from '../utils/lessonConstants';

export const Btn = ({ style, hoverStyle, disabled, children, ...rest }) => {
	const [hover, setHover] = useState(false);
	return (
		<button
			type="button"
			disabled={disabled}
			onMouseEnter={() => setHover(true)}
			onMouseLeave={() => setHover(false)}
			style={{
				display: 'inline-flex',
				alignItems: 'center',
				gap: 8,
				fontFamily: 'inherit',
				cursor: disabled ? 'not-allowed' : 'pointer',
				opacity: disabled ? 0.55 : 1,
				transition: 'background-color .15s, border-color .15s, color .15s, filter .15s',
				...style,
				...(hover && !disabled ? hoverStyle : {}),
			}}
			{...rest}
		>
			{children}
		</button>
	);
};

export const Input = forwardRef(({ style, onFocus, onBlur, ...p }, ref) => {
	const [f, setF] = useState(false);
	return (
		<input
			ref={ref}
			{...p}
			onFocus={(e) => {
				setF(true);
				onFocus?.(e);
			}}
			onBlur={(e) => {
				setF(false);
				onBlur?.(e);
			}}
			style={{ ...inputBase, ...(f ? inputFocus : {}), ...style }}
		/>
	);
});
Input.displayName = 'Input';

export const TextArea = forwardRef(({ style, onFocus, onBlur, ...p }, ref) => {
	const [f, setF] = useState(false);
	return (
		<textarea
			ref={ref}
			{...p}
			onFocus={(e) => {
				setF(true);
				onFocus?.(e);
			}}
			onBlur={(e) => {
				setF(false);
				onBlur?.(e);
			}}
			style={{
				...inputBase,
				lineHeight: 1.6,
				resize: 'vertical',
				...(f ? inputFocus : {}),
				...style,
			}}
		/>
	);
});
TextArea.displayName = 'TextArea';

export const Label = ({ children, htmlFor, hint }) => (
	<label
		htmlFor={htmlFor}
		style={{
			display: 'flex',
			alignItems: 'baseline',
			justifyContent: 'space-between',
			gap: 8,
			marginBottom: 6,
			fontSize: 12,
			fontWeight: 700,
			letterSpacing: '0.04em',
			textTransform: 'uppercase',
			color: T.muted,
		}}
	>
		<span>{children}</span>
		{hint && (
			<span style={{ fontWeight: 500, textTransform: 'none', letterSpacing: 0 }}>{hint}</span>
		)}
	</label>
);

export const Switch = ({ checked, onChange, label, id }) => (
	<button
		type="button"
		role="switch"
		id={id}
		aria-checked={checked}
		onClick={() => onChange(!checked)}
		style={{
			display: 'inline-flex',
			alignItems: 'center',
			gap: 10,
			background: 'none',
			border: 'none',
			padding: 0,
			cursor: 'pointer',
			fontFamily: 'inherit',
			fontSize: T.fsm,
			fontWeight: 600,
			color: T.text,
		}}
	>
		<span
			style={{
				width: 38,
				height: 22,
				borderRadius: 999,
				background: checked ? T.primary : '#cbd5e1',
				position: 'relative',
				transition: 'background .15s',
				flexShrink: 0,
			}}
		>
			<span
				style={{
					position: 'absolute',
					top: 3,
					left: checked ? 19 : 3,
					width: 16,
					height: 16,
					borderRadius: '50%',
					background: '#fff',
					transition: 'left .15s',
					boxShadow: '0 1px 2px rgba(0,0,0,0.25)',
				}}
			/>
		</span>
		{label}
	</button>
);

export const Chip = ({ children, bg, color, style }) => (
	<span
		style={{
			display: 'inline-flex',
			alignItems: 'center',
			gap: 4,
			padding: '2px 8px',
			borderRadius: T.rFull,
			fontSize: 11,
			fontWeight: 600,
			background: bg,
			color,
			whiteSpace: 'nowrap',
			...style,
		}}
	>
		{children}
	</span>
);

export const Modal = ({ title, onClose, children, width = 440 }) => {
	useEffect(() => {
		const onKey = (e) => e.key === 'Escape' && onClose();
		window.addEventListener('keydown', onKey);
		return () => window.removeEventListener('keydown', onKey);
	}, [onClose]);
	return (
		<div
			onMouseDown={(e) => e.target === e.currentTarget && onClose()}
			style={{
				position: 'fixed',
				inset: 0,
				zIndex: 1050,
				background: 'rgba(15,23,42,0.45)',
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
				padding: 16,
			}}
		>
			<div
				role="dialog"
				aria-modal="true"
				aria-label={title}
				style={{
					width: '100%',
					maxWidth: width,
					background: T.card,
					borderRadius: T.rLg,
					padding: 24,
					boxShadow: '0 20px 40px rgba(15,23,42,0.2)',
				}}
			>
				<h2 style={{ margin: '0 0 12px', fontSize: T.fmd, fontWeight: 700 }}>{title}</h2>
				{children}
			</div>
		</div>
	);
};

export const NavLink = ({ href, onNavigate, style, children, ...rest }) => (
	<a
		href={href}
		onClick={(e) => {
			if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
			e.preventDefault();
			onNavigate(href);
		}}
		style={{ color: 'inherit', textDecoration: 'none', ...style }}
		{...rest}
	>
		{children}
	</a>
);

export const SectionCard = ({ icon: Icon, title, desc, right, children }) => (
	<section
		style={{
			background: T.card,
			border: `1px solid ${T.border}`,
			borderRadius: T.rLg,
			padding: 24,
			marginBottom: 20,
		}}
	>
		<div
			style={{
				display: 'flex',
				alignItems: 'flex-start',
				justifyContent: 'space-between',
				gap: 12,
				flexWrap: 'wrap',
				marginBottom: 18,
			}}
		>
			<div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
				{Icon && (
					<span
						style={{
							width: 32,
							height: 32,
							borderRadius: T.rMd,
							background: T.primaryTint,
							color: T.primary,
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
							flexShrink: 0,
						}}
					>
						<Icon size={17} />
					</span>
				)}
				<div>
					<h2 style={{ margin: 0, fontSize: T.fmd, fontWeight: 700 }}>{title}</h2>
					{desc && (
						<p style={{ margin: '2px 0 0', fontSize: T.fxs, color: T.muted }}>{desc}</p>
					)}
				</div>
			</div>
			{right}
		</div>
		{children}
	</section>
);

export default SectionCard;
