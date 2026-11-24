export const PREVIEW_STYLE = {
	h1: 'font-size:1.75rem;font-weight:700;margin:1.2rem 0 .6rem;line-height:1.25;',
	h2: 'font-size:1.4rem;font-weight:700;margin:1.1rem 0 .5rem;line-height:1.3;',
	h3: 'font-size:1.2rem;font-weight:600;margin:1rem 0 .5rem;line-height:1.3;',
	h4: 'font-size:1.05rem;font-weight:600;margin:1rem 0 .4rem;',
	h5: 'font-size:1rem;font-weight:600;margin:1rem 0 .4rem;',
	h6: 'font-size:.9rem;font-weight:600;margin:1rem 0 .4rem;color:#6c757d;',
	p: 'margin:0 0 .85rem;line-height:1.7;',
	ul: 'margin:0 0 .85rem;padding-left:1.5rem;line-height:1.7;',
	ol: 'margin:0 0 .85rem;padding-left:1.5rem;line-height:1.7;',
	li: 'margin-bottom:.2rem;',
	task: 'list-style:none;margin-left:-1.25rem;',
	blockquote:
		'margin:0 0 .85rem;padding:.4rem 1rem;border-left:4px solid #0d6efd;background:#f1f5fb;color:#495057;border-radius:0 6px 6px 0;',
	code: 'font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:.88em;background:#eef0f3;padding:.1rem .35rem;border-radius:4px;',
	pre: 'font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:.85rem;background:#1e2430;color:#e6e9ef;padding:.9rem 1rem;border-radius:8px;overflow-x:auto;margin:0 0 .85rem;line-height:1.55;',
	hr: 'border:0;border-top:1px solid #dee2e6;margin:1.25rem 0;',
	a: 'color:#0d6efd;text-decoration:underline;',
	img: 'max-width:100%;height:auto;border-radius:8px;margin:.25rem 0;',
};

export const escapeHtml = (str = '') =>
	String(str)
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#39;');

export const safeUrl = (url) => {
	const value = String(url || '').trim();

	if (/^(https?:|mailto:|\/|#|\.)/i.test(value)) {
		return value;
	}

	return null;
};

const renderInline = (raw = '') => {
	const codes = [];
	let s = escapeHtml(raw);

	// Inline code
	s = s.replace(/`([^`]+)`/g, (_, content) => {
		codes.push(content);
		return `\u0000${codes.length - 1}\u0000`;
	});

	// Images
	s = s.replace(/!\[([^\]]*)\]\(([^)\s]+)\)/g, (match, alt, url) => {
		const safe = safeUrl(url);

		return safe ? `<img src="${safe}" alt="${alt}" style="${PREVIEW_STYLE.img}" />` : match;
	});

	// Links
	s = s.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (match, label, url) => {
		const safe = safeUrl(url);

		return safe
			? `<a href="${safe}" target="_blank" rel="noopener noreferrer" style="${PREVIEW_STYLE.a}">${label}</a>`
			: match;
	});

	// Bold
	s = s.replace(/\*\*([^*\n]+)\*\*|__([^_\n]+)__/g, (_, a, b) => `<strong>${a || b}</strong>`);

	// Strikethrough
	s = s.replace(/~~([^~\n]+)~~/g, '<del>$1</del>');

	// Italic
	s = s.replace(/\*([^*\n]+)\*/g, '<em>$1</em>');
	s = s.replace(/(^|\W)_([^_\n]+)_(?=\W|$)/g, '$1<em>$2</em>');

	// Restore inline code
	s = s.replace(
		/\u0000(\d+)\u0000/g,
		(_, index) => `<code style="${PREVIEW_STYLE.code}">${codes[Number(index)]}</code>`,
	);

	return s;
};

const RE = {
	heading: /^(#{1,6})\s+(.*)$/,
	fence: /^\s*```/,
	hr: /^\s*(-{3,}|\*{3,}|_{3,})\s*$/,
	quote: /^\s*>/,
	ul: /^\s*[-*+]\s+/,
	ol: /^\s*\d+\.\s+/,
};

const isBlockStart = (line) =>
	RE.heading.test(line) ||
	RE.fence.test(line) ||
	RE.hr.test(line) ||
	RE.quote.test(line) ||
	RE.ul.test(line) ||
	RE.ol.test(line);

export const renderMarkdown = (markdown = '') => {
	const lines = String(markdown).replace(/\r\n/g, '\n').split('\n');
	const output = [];

	let i = 0;

	while (i < lines.length) {
		const line = lines[i];

		if (!line.trim()) {
			i++;
			continue;
		}

		// Code block
		if (RE.fence.test(line)) {
			const buffer = [];
			i++;

			while (i < lines.length && !RE.fence.test(lines[i])) {
				buffer.push(lines[i]);
				i++;
			}

			if (i < lines.length) i++;

			output.push(
				`<pre style="${PREVIEW_STYLE.pre}"><code>${escapeHtml(buffer.join('\n'))}</code></pre>`,
			);

			continue;
		}

		// Heading
		const heading = line.match(RE.heading);

		if (heading) {
			const level = heading[1].length;

			output.push(
				`<h${level} style="${PREVIEW_STYLE['h' + level]}">${renderInline(heading[2].trim())}</h${level}>`,
			);

			i++;
			continue;
		}

		// Horizontal rule
		if (RE.hr.test(line)) {
			output.push(`<hr style="${PREVIEW_STYLE.hr}" />`);
			i++;
			continue;
		}

		// Blockquote
		if (RE.quote.test(line)) {
			const buffer = [];

			while (i < lines.length && RE.quote.test(lines[i])) {
				buffer.push(lines[i].replace(/^\s*>\s?/, ''));
				i++;
			}

			output.push(
				`<blockquote style="${PREVIEW_STYLE.blockquote}">${renderMarkdown(buffer.join('\n'))}</blockquote>`,
			);

			continue;
		}

		// Lists
		if (RE.ul.test(line) || RE.ol.test(line)) {
			const ordered = RE.ol.test(line);
			const regex = ordered ? RE.ol : RE.ul;
			const tag = ordered ? 'ol' : 'ul';
			const items = [];

			while (i < lines.length && regex.test(lines[i])) {
				const content = lines[i].replace(regex, '');

				const task = !ordered ? content.match(/^\[( |x|X)\]\s+(.*)$/) : null;

				if (task) {
					const checked = task[1].toLowerCase() === 'x';

					items.push(
						`<li style="${PREVIEW_STYLE.li}${PREVIEW_STYLE.task}">
                            <input type="checkbox" disabled ${checked ? 'checked' : ''} style="margin-right:.5rem;" />
                            ${renderInline(task[2])}
                        </li>`,
					);
				} else {
					items.push(`<li style="${PREVIEW_STYLE.li}">${renderInline(content)}</li>`);
				}

				i++;
			}

			output.push(`<${tag} style="${PREVIEW_STYLE[tag]}">${items.join('')}</${tag}>`);

			continue;
		}

		// Paragraph
		const buffer = [line];
		i++;

		while (i < lines.length && lines[i].trim() && !isBlockStart(lines[i])) {
			buffer.push(lines[i]);
			i++;
		}

		output.push(
			`<p style="${PREVIEW_STYLE.p}">${buffer
				.map((item) => renderInline(item.trim()))
				.join('<br />')}</p>`,
		);
	}

	return output.join('');
};
