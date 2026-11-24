import React from 'react';
import { T } from '../utils/lessonConstants';

export const renderInline = (text, prefix) => {
	const re = /(\*\*[^*]+\*\*|`[^`]+`|\*[^*]+\*|\[[^\]]+\]\([^)]+\))/g;
	const parts = [];
	let last = 0;
	let m;
	let i = 0;
	while ((m = re.exec(text))) {
		if (m.index > last) parts.push(text.slice(last, m.index));
		const tok = m[0];
		const key = `${prefix}-${i++}`;
		if (tok.startsWith('**')) parts.push(<strong key={key}>{tok.slice(2, -2)}</strong>);
		else if (tok.startsWith('`'))
			parts.push(
				<code
					key={key}
					style={{
						fontFamily: 'ui-monospace, Menlo, Consolas, monospace',
						fontSize: '0.88em',
						padding: '2px 6px',
						borderRadius: 4,
						background: T.primarySoft,
						color: T.primary,
						border: `1px solid ${T.border}`,
					}}
				>
					{tok.slice(1, -1)}
				</code>,
			);
		else if (tok.startsWith('[')) {
			const mm = /\[([^\]]+)\]\(([^)]+)\)/.exec(tok);
			if (mm && /^https?:\/\//i.test(mm[2]))
				parts.push(
					<a
						key={key}
						href={mm[2]}
						target="_blank"
						rel="noopener noreferrer"
						style={{ color: T.primary }}
					>
						{mm[1]}
					</a>,
				);
			else parts.push(mm ? mm[1] : tok);
		} else parts.push(<em key={key}>{tok.slice(1, -1)}</em>);
		last = m.index + tok.length;
	}
	if (last < text.length) parts.push(text.slice(last));
	return parts;
};

export const MarkdownPreview = ({ source = '' }) => {
	const lines = source.split('\n');
	const out = [];
	const isSpecial = (l) =>
		/^(#{1,3})\s+/.test(l) ||
		/^>\s?/.test(l) ||
		/^\s*[-*]\s+/.test(l) ||
		/^\s*\d+\.\s+/.test(l) ||
		l.trim().startsWith('```');
	let i = 0;
	let k = 0;
	while (i < lines.length) {
		const line = lines[i];
		if (line.trim().startsWith('```')) {
			const buf = [];
			i++;
			while (i < lines.length && !lines[i].trim().startsWith('```')) buf.push(lines[i++]);
			i++;
			out.push(
				<pre
					key={k++}
					style={{
						margin: '12px 0',
						padding: 14,
						borderRadius: T.rMd,
						background: '#0f172a',
						color: '#e2e8f0',
						fontSize: 13,
						overflowX: 'auto',
						fontFamily: 'ui-monospace, Menlo, Consolas, monospace',
					}}
				>
					<code>{buf.join('\n')}</code>
				</pre>,
			);
			continue;
		}
		const h = /^(#{1,3})\s+(.*)$/.exec(line);
		if (h) {
			const level = h[1].length;
			const base = { margin: '24px 0 10px', color: T.text, fontWeight: 700, lineHeight: 1.3 };
			if (level === 1)
				out.push(
					<h2 key={k++} style={{ ...base, fontSize: 24 }}>
						{renderInline(h[2], `h${k}`)}
					</h2>,
				);
			else if (level === 2)
				out.push(
					<h3
						key={k++}
						style={{
							...base,
							fontSize: 20,
							paddingBottom: 8,
							borderBottom: `2px solid ${T.border}`,
						}}
					>
						{renderInline(h[2], `h${k}`)}
					</h3>,
				);
			else
				out.push(
					<h4
						key={k++}
						style={{
							...base,
							fontSize: 17,
							paddingLeft: 10,
							borderLeft: `3px solid ${T.primary}`,
						}}
					>
						{renderInline(h[2], `h${k}`)}
					</h4>,
				);
			i++;
			continue;
		}
		if (/^>\s?/.test(line)) {
			const buf = [];
			while (i < lines.length && /^>\s?/.test(lines[i]))
				buf.push(lines[i++].replace(/^>\s?/, ''));
			out.push(
				<blockquote
					key={k++}
					style={{
						margin: '12px 0',
						padding: '10px 16px',
						borderLeft: `3px solid ${T.primary}`,
						background: T.field,
						color: T.muted,
						borderRadius: `0 ${T.rMd} ${T.rMd} 0`,
					}}
				>
					{renderInline(buf.join(' '), `q${k}`)}
				</blockquote>,
			);
			continue;
		}
		if (/^\s*[-*]\s+/.test(line)) {
			const buf = [];
			while (i < lines.length && /^\s*[-*]\s+/.test(lines[i]))
				buf.push(lines[i++].replace(/^\s*[-*]\s+/, ''));
			out.push(
				<ul key={k++} style={{ margin: '10px 0', paddingLeft: 22, lineHeight: 1.7 }}>
					{buf.map((b, bi) => (
						<li key={bi}>{renderInline(b, `u${k}-${bi}`)}</li>
					))}
				</ul>,
			);
			continue;
		}
		if (/^\s*\d+\.\s+/.test(line)) {
			const buf = [];
			while (i < lines.length && /^\s*\d+\.\s+/.test(lines[i]))
				buf.push(lines[i++].replace(/^\s*\d+\.\s+/, ''));
			out.push(
				<ol key={k++} style={{ margin: '10px 0', paddingLeft: 22, lineHeight: 1.7 }}>
					{buf.map((b, bi) => (
						<li key={bi}>{renderInline(b, `o${k}-${bi}`)}</li>
					))}
				</ol>,
			);
			continue;
		}
		if (!line.trim()) {
			i++;
			continue;
		}
		const buf = [];
		while (i < lines.length && lines[i].trim() && !isSpecial(lines[i])) buf.push(lines[i++]);
		out.push(
			<p key={k++} style={{ margin: '10px 0', lineHeight: 1.75 }}>
				{renderInline(buf.join(' '), `p${k}`)}
			</p>,
		);
	}
	return <div style={{ fontSize: 15, color: T.text }}>{out}</div>;
};

export default MarkdownPreview;
