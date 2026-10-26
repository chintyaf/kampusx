import React from 'react';
import { useParams } from 'react-router-dom';
import { Table } from 'react-bootstrap';
import { Clock, Lightbulb } from 'lucide-react';

const LessonMaterial = ({ data = [] }) => {
	const { lessonId } = useParams();

	// Match lesson aktif atau gunakan default
	const activeLessonIndex = data.findIndex((l) => l.id === lessonId);
	const currentLessonIndex = activeLessonIndex !== -1 ? activeLessonIndex : 0;
	const currentLesson = data[currentLessonIndex] || {};

	return (
		<div
			className="py-4 px-3 px-md-4 mx-auto"
			style={{
				backgroundColor: 'var(--card)',
				borderRadius: 'var(--radius-lg)',
			}}
		>
			{/* 1. Header Metadata / Badge */}
			<div
				className="d-flex align-items-center flex-wrap gap-2 mb-3"
				style={{ fontSize: 'var(--font-xs)' }}
			>
				<span
					className="fw-semibold px-2 py-1 text-uppercase"
					style={{
						backgroundColor: 'var(--purple-bg)',
						color: 'var(--purple-text)',
						border: 'var(--border-w-xs) solid var(--purple-border-color)',
						borderRadius: 'var(--radius-xs)',
						fontSize: 'var(--font-xs)',
						letterSpacing: '0.5px',
					}}
				>
					Article
				</span>
				<span
					className="d-flex align-items-center gap-1"
					style={{ color: 'var(--text-muted)' }}
				>
					<Clock size={14} /> 5 min read
				</span>
				<span style={{ color: 'var(--text-muted)' }}>•</span>
				<span style={{ color: 'var(--text-muted)' }}>
					{currentLesson.moduleName || 'Module 3 — Advanced RAG System Architecture'}
				</span>
			</div>

			{/* 2. Title & Description */}
			<h1
				className="fw-bold mb-3"
				style={{ fontSize: 'var(--font-xl)', color: 'var(--text)', lineHeight: '1.3' }}
			>
				{currentLesson.title || 'Understanding Vector Database Embeddings in RAG'}
			</h1>
			<p
				className="mb-4"
				style={{
					fontSize: 'var(--font-sm)',
					color: 'var(--text-muted)',
					lineHeight: '1.65',
				}}
			>
				{currentLesson.summary ||
					"The retrieval component of any RAG system depends entirely on one idea: that similar meanings produce similar numbers. In this lesson, you'll understand exactly how that works — and why choosing the right embedding strategy can make or break your pipeline."}
			</p>

			{/* 3. Hero Image with Overlay Caption */}
			<div
				className="position-relative mb-4 overflow-hidden"
				style={{
					borderRadius: 'var(--radius-md)',
					border: 'var(--border-w-xs) solid var(--border)',
				}}
			>
				<img
					src={
						currentLesson.imageUrl ||
						'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80'
					}
					alt="Vector space embedding concept"
					className="w-100 object-fit-cover"
					style={{ maxHeight: '380px', display: 'block' }}
				/>
				<div
					className="p-2 px-3 position-absolute bottom-0 start-0 end-0"
					style={{
						backgroundColor: 'rgba(15, 23, 42, 0.85)',
						color: 'var(--color-white)',
						fontSize: 'var(--font-xs)',
						backdropFilter: 'blur(4px)',
					}}
				>
					<em>
						Fig 1. High-dimensional embedding space — semantically similar texts cluster
						together regardless of exact wording.
					</em>
				</div>
			</div>

			{/* 4. Section: What is an Embedding? */}
			<section className="mb-4">
				<h2
					className="fw-bold mb-3"
					style={{ fontSize: 'var(--font-lg)', color: 'var(--text)' }}
				>
					What is an Embedding?
				</h2>
				<p
					className="mb-3"
					style={{
						fontSize: 'var(--font-sm)',
						color: 'var(--text-muted)',
						lineHeight: '1.7',
					}}
				>
					An{' '}
					<strong className="fw-semibold" style={{ color: 'var(--primary)' }}>
						embedding
					</strong>{' '}
					is a dense numerical vector — a list of floating-point numbers — that represents
					the semantic content of a piece of text. When you pass a sentence like{' '}
					<em>"How does photosynthesis work?"</em>, you get something like:
				</p>

				{/* Inline Code Box */}
				<div
					className="p-3 d-flex flex-wrap align-items-center gap-2 mb-3"
					style={{
						backgroundColor: 'var(--neutral-bg)',
						border: 'var(--border-w-xs) solid var(--neutral-border)',
						borderRadius: 'var(--radius-md)',
					}}
				>
					<code
						style={{
							backgroundColor: 'var(--purple-bg)',
							color: 'var(--purple-text)',
							padding: '3px 8px',
							borderRadius: 'var(--radius-xs)',
							fontSize: 'var(--font-xs)',
							fontFamily: 'monospace',
						}}
					>
						[0.021, -0.438, 0.197, ...]
					</code>
					<span style={{ color: 'var(--text-muted)', fontSize: 'var(--font-xs)' }}>
						with typically 768 to 1536 dimensions depending on the model.
					</span>
				</div>

				<p
					className="mb-3"
					style={{
						fontSize: 'var(--font-sm)',
						color: 'var(--text-muted)',
						lineHeight: '1.7',
					}}
				>
					The key insight:{' '}
					<strong style={{ color: 'var(--text)' }}>
						texts with similar meaning produce vectors that are close together
					</strong>{' '}
					in this high-dimensional space, even if they use completely different words.
					"How does photosynthesis work?" and "Explain the process plants use to convert
					sunlight" will land near each other — a sentence about stock markets will not.
				</p>

				{/* Callout Box: Intuition */}
				<div
					className="p-3 mb-4"
					style={{
						backgroundColor: 'var(--success-bg)',
						border: 'var(--border-w-xs) solid var(--success-border-color)',
						borderRadius: 'var(--radius-md)',
					}}
				>
					<div
						className="d-flex align-items-center gap-2 fw-semibold mb-2"
						style={{ color: 'var(--success-text)', fontSize: 'var(--font-sm)' }}
					>
						<Lightbulb size={18} />
						<span>Intuition</span>
					</div>
					<p
						className="mb-0"
						style={{
							color: 'var(--success-text)',
							fontSize: 'var(--font-xs)',
							lineHeight: '1.6',
						}}
					>
						Think of embedding space like a city map. Related concepts live in the same
						neighbourhood. "cat", "kitten", "feline" are all within walking distance.
						"stock market" is across town. Vector search finds your nearest neighbours —
						the most contextually relevant chunks.
					</p>
				</div>
			</section>

			{/* 5. Section: How RAG Uses Embeddings */}
			<section className="mb-4">
				<h2
					className="fw-bold mb-3"
					style={{ fontSize: 'var(--font-lg)', color: 'var(--text)' }}
				>
					How RAG Uses Embeddings
				</h2>
				<p
					className="mb-3"
					style={{
						fontSize: 'var(--font-sm)',
						color: 'var(--text-muted)',
						lineHeight: '1.7',
					}}
				>
					In a Retrieval-Augmented Generation pipeline, embeddings are used in two phases:
				</p>
				<ul
					className="list-unstyled ps-3 mb-3"
					style={{
						fontSize: 'var(--font-sm)',
						color: 'var(--text-muted)',
						lineHeight: '1.7',
					}}
				>
					<li className="mb-2">
						<strong style={{ color: 'var(--text)' }}>Indexing phase</strong> — your
						source documents are split into chunks, each chunk is embedded, and the
						vectors are stored in a vector database (Pinecone, Weaviate, Chroma, etc.).
					</li>
					<li className="mb-2">
						<strong style={{ color: 'var(--text)' }}>Query phase</strong> — the user's
						question is embedded using the same model, and the database performs an
						Approximate Nearest Neighbour (ANN) search to find the top-k most similar
						chunks in milliseconds.
					</li>
				</ul>
				<p
					className="mb-3"
					style={{
						fontSize: 'var(--font-sm)',
						color: 'var(--text-muted)',
						lineHeight: '1.7',
					}}
				>
					Those retrieved chunks are then injected into the LLM prompt as context,
					allowing the model to answer questions grounded in your specific data rather
					than relying solely on training knowledge.
				</p>
			</section>

			{/* 6. Section: Table Comparison */}
			<section className="mb-4">
				<h2
					className="fw-bold mb-3"
					style={{ fontSize: 'var(--font-lg)', color: 'var(--text)' }}
				>
					Choosing the Right Embedding Model
				</h2>
				<p
					className="mb-3"
					style={{
						fontSize: 'var(--font-sm)',
						color: 'var(--text-muted)',
						lineHeight: '1.7',
					}}
				>
					Not all embedding models are equal. The table below summarizes common choices
					for production RAG:
				</p>

				<div
					className="table-responsive mb-2 overflow-hidden"
					style={{
						border: 'var(--border-w-xs) solid var(--neutral-border)',
						borderRadius: 'var(--radius-md)',
					}}
				>
					<Table
						hover
						align="middle"
						className="mb-0 border-0"
						style={{ fontSize: 'var(--font-xs)' }}
					>
						<thead style={{ backgroundColor: 'var(--neutral-bg)' }}>
							<tr>
								<th
									className="fw-semibold py-2 border-0"
									style={{ color: 'var(--text-muted)' }}
								>
									Model
								</th>
								<th
									className="fw-semibold py-2 border-0"
									style={{ color: 'var(--text-muted)' }}
								>
									Dimensions
								</th>
								<th
									className="fw-semibold py-2 border-0"
									style={{ color: 'var(--text-muted)' }}
								>
									Latency
								</th>
								<th
									className="fw-semibold py-2 border-0"
									style={{ color: 'var(--text-muted)' }}
								>
									Best For
								</th>
							</tr>
						</thead>
						<tbody>
							<tr
								style={{
									borderTop: 'var(--border-w-xs) solid var(--neutral-border)',
								}}
							>
								<td>
									<code
										style={{
											backgroundColor: 'var(--purple-bg)',
											color: 'var(--purple-text)',
											padding: '2px 6px',
											borderRadius: 'var(--radius-xs)',
											fontFamily: 'monospace',
										}}
									>
										text-embedding-3-small
									</code>
								</td>
								<td style={{ color: 'var(--text)' }}>1536</td>
								<td style={{ color: 'var(--text)' }}>Low</td>
								<td style={{ color: 'var(--text)' }}>Cost-effective production</td>
							</tr>
							<tr
								style={{
									borderTop: 'var(--border-w-xs) solid var(--neutral-border)',
								}}
							>
								<td>
									<code
										style={{
											backgroundColor: 'var(--purple-bg)',
											color: 'var(--purple-text)',
											padding: '2px 6px',
											borderRadius: 'var(--radius-xs)',
											fontFamily: 'monospace',
										}}
									>
										text-embedding-3-large
									</code>
								</td>
								<td style={{ color: 'var(--text)' }}>3072</td>
								<td style={{ color: 'var(--text)' }}>Medium</td>
								<td style={{ color: 'var(--text)' }}>High-accuracy retrieval</td>
							</tr>
							<tr
								style={{
									borderTop: 'var(--border-w-xs) solid var(--neutral-border)',
								}}
							>
								<td>
									<code
										style={{
											backgroundColor: 'var(--purple-bg)',
											color: 'var(--purple-text)',
											padding: '2px 6px',
											borderRadius: 'var(--radius-xs)',
											fontFamily: 'monospace',
										}}
									>
										Cohere embed-v3
									</code>
								</td>
								<td style={{ color: 'var(--text)' }}>1024</td>
								<td style={{ color: 'var(--text)' }}>Low</td>
								<td style={{ color: 'var(--text)' }}>Multilingual RAG</td>
							</tr>
							<tr
								style={{
									borderTop: 'var(--border-w-xs) solid var(--neutral-border)',
								}}
							>
								<td>
									<code
										style={{
											backgroundColor: 'var(--purple-bg)',
											color: 'var(--purple-text)',
											padding: '2px 6px',
											borderRadius: 'var(--radius-xs)',
											fontFamily: 'monospace',
										}}
									>
										BGE-M3 (open source)
									</code>
								</td>
								<td style={{ color: 'var(--text)' }}>1024</td>
								<td style={{ color: 'var(--text)' }}>Low*</td>
								<td style={{ color: 'var(--text)' }}>Self-hosted pipelines</td>
							</tr>
						</tbody>
					</Table>
				</div>
				<p
					className="fst-italic mb-0"
					style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)' }}
				>
					* BGE-M3 latency depends on hardware. GPU inference reduces to ~10ms per query.
				</p>
			</section>
		</div>
	);
};

export default LessonMaterial;
