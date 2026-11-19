import React from 'react';
import { Form, Button, Card, Row, Col } from 'react-bootstrap';
import { Plus, Trash2 } from 'lucide-react';

const BLOOM_LEVELS = ['remember', 'understand', 'apply', 'analyze', 'evaluate', 'create'];

const LessonQuizForm = ({ quiz, setQuiz }) => {
	const handleChange = (e) => {
		setQuiz({
			...quiz,
			[e.target.name]: e.target.value,
		});
	};

	const addQuestion = () => {
		setQuiz({
			...quiz,
			questions: [
				...quiz.questions,
				{
					question_text: '',
					bloom_level: '',
					explanation: '',
					options: ['A', 'B', 'C', 'D'].map((label, index) => ({
						option_label: label,
						option_text: '',
						is_correct: index === 0,
						order_index: index + 1,
					})),
				},
			],
		});
	};

	const removeQuestion = (index) => {
		setQuiz({
			...quiz,
			questions: quiz.questions.filter((_, i) => i !== index),
		});
	};

	const updateQuestion = (index, field, value) => {
		setQuiz({
			...quiz,
			questions: quiz.questions.map((q, i) => (i === index ? { ...q, [field]: value } : q)),
		});
	};

	const updateOption = (qIndex, oIndex, field, value) => {
		setQuiz({
			...quiz,
			questions: quiz.questions.map((q, i) =>
				i === qIndex
					? {
							...q,
							options: q.options.map((option, j) => ({
								...option,
								...(j === oIndex
									? { [field]: value }
									: field === 'is_correct'
										? { is_correct: false }
										: {}),
							})),
						}
					: q,
			),
		});
	};

	return (
		<Card className="border-0 shadow-sm mb-4">
			<Card.Body className="p-4">
				<h5 className="mb-1">Quiz Lesson</h5>
				<p className="text-secondary small mb-4">
					Atur evaluasi pembelajaran untuk lesson ini.
				</p>

				{/* Quiz Information */}
				<Form.Group className="mb-3">
					<Form.Label>Judul Quiz</Form.Label>
					<Form.Control
						name="title"
						value={quiz.title}
						onChange={handleChange}
						maxLength={200}
						required
					/>
				</Form.Group>

				<Form.Group className="mb-3">
					<Form.Label>Deskripsi</Form.Label>
					<Form.Control
						as="textarea"
						rows={2}
						name="description"
						value={quiz.description}
						onChange={handleChange}
					/>
				</Form.Group>

				<Row>
					<Col md={4}>
						<Form.Group className="mb-3">
							<Form.Label>Bloom Level</Form.Label>
							<Form.Select
								name="bloom_level"
								value={quiz.bloom_level}
								onChange={handleChange}
							>
								<option value="">Pilih level</option>
								{BLOOM_LEVELS.map((level) => (
									<option key={level} value={level}>
										{level.charAt(0).toUpperCase() + level.slice(1)}
									</option>
								))}
							</Form.Select>
						</Form.Group>
					</Col>

					<Col md={4}>
						<Form.Group className="mb-3">
							<Form.Label>Waktu (Menit)</Form.Label>
							<Form.Control
								type="number"
								min={1}
								name="time_limit_minutes"
								value={quiz.time_limit_minutes}
								onChange={handleChange}
							/>
						</Form.Group>
					</Col>

					<Col md={4}>
						<Form.Group className="mb-3">
							<Form.Label>Passing Score (%)</Form.Label>
							<Form.Control
								type="number"
								min={0}
								max={100}
								name="passing_score"
								value={quiz.passing_score}
								onChange={handleChange}
							/>
						</Form.Group>
					</Col>
				</Row>

				<hr />

				{/* Questions */}
				<div className="d-flex justify-content-between align-items-center mb-3">
					<h6 className="mb-0">Daftar Pertanyaan</h6>

					<Button type="button" variant="outline-primary" size="sm" onClick={addQuestion}>
						<Plus size={15} className="me-1" />
						Tambah Pertanyaan
					</Button>
				</div>

				{quiz.questions.map((question, qIndex) => (
					<Card key={qIndex} className="mb-3 border">
						<Card.Body>
							<div className="d-flex justify-content-between align-items-center mb-3">
								<strong>Pertanyaan {qIndex + 1}</strong>

								<Button
									type="button"
									size="sm"
									variant="outline-danger"
									disabled={quiz.questions.length === 1}
									onClick={() => removeQuestion(qIndex)}
								>
									<Trash2 size={15} />
								</Button>
							</div>

							<Form.Group className="mb-3">
								<Form.Label>Pertanyaan</Form.Label>
								<Form.Control
									as="textarea"
									rows={2}
									value={question.question_text}
									onChange={(e) =>
										updateQuestion(qIndex, 'question_text', e.target.value)
									}
									required
								/>
							</Form.Group>

							<Form.Group className="mb-3">
								<Form.Label>Bloom Level</Form.Label>
								<Form.Select
									value={question.bloom_level || ''}
									onChange={(e) =>
										updateQuestion(qIndex, 'bloom_level', e.target.value)
									}
								>
									<option value="">Pilih level</option>
									{BLOOM_LEVELS.map((level) => (
										<option key={level} value={level}>
											{level.charAt(0).toUpperCase() + level.slice(1)}
										</option>
									))}
								</Form.Select>
							</Form.Group>

							<Form.Label>Pilihan Jawaban</Form.Label>
							<small className="text-secondary d-block mb-2">
								Pilih jawaban yang benar.
							</small>

							{question.options.map((option, oIndex) => (
								<div
									key={option.option_label}
									className="d-flex align-items-center gap-2 mb-2"
								>
									<Form.Check
										type="radio"
										name={`correct-${qIndex}`}
										checked={option.is_correct}
										onChange={() =>
											updateOption(qIndex, oIndex, 'is_correct', true)
										}
									/>

									<span>{option.option_label}.</span>

									<Form.Control
										value={option.option_text}
										onChange={(e) =>
											updateOption(
												qIndex,
												oIndex,
												'option_text',
												e.target.value,
											)
										}
										placeholder={`Pilihan ${option.option_label}`}
										required
									/>
								</div>
							))}

							<Form.Group className="mt-3">
								<Form.Label>Penjelasan Jawaban</Form.Label>
								<Form.Control
									as="textarea"
									rows={2}
									value={question.explanation}
									onChange={(e) =>
										updateQuestion(qIndex, 'explanation', e.target.value)
									}
								/>
							</Form.Group>
						</Card.Body>
					</Card>
				))}
			</Card.Body>
		</Card>
	);
};

export default LessonQuizForm;
