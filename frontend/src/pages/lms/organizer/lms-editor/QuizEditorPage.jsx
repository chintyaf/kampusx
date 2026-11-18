import React, { useState } from 'react'
import { Form, Button } from 'react-bootstrap'
import { Plus, Trash2, Save } from 'lucide-react'

const newQuestion = () => ({
  id: Date.now(),
  question: '',
  options: ['', '', '', ''],
  answer: 0, // index jawaban benar
})

const QuizEditorPage = () => {
  // Data dummy — nanti ganti dengan fetch kuis milik module
  const [questions, setQuestions] = useState([
    {
      id: 1,
      question: 'Manakah yang termasuk tipe data boolean?',
      options: ['"true"', 'true', '1', 'null'],
      answer: 1,
    },
  ])

  const addQuestion = () => setQuestions([...questions, newQuestion()])
  const removeQuestion = (id) => setQuestions(questions.filter((q) => q.id !== id))

  const updateQuestion = (id, changes) =>
    setQuestions(questions.map((q) => (q.id === id ? { ...q, ...changes } : q)))

  const updateOption = (q, index, value) => {
    const options = q.options.map((opt, i) => (i === index ? value : opt))
    updateQuestion(q.id, { options })
  }

  return (
    <div style={{ maxWidth: 720 }}>
      <h4 style={{ marginBottom: 4 }}>Kuis Module</h4>
      <p style={{ color: '#6b7488', marginBottom: 24 }}>Pilih radio untuk menandai jawaban yang benar.</p>

      {questions.map((q, no) => (
        <div key={q.id} style={{ background: '#fff', padding: 20, borderRadius: 8, marginBottom: 16 }}>
          <div className="d-flex justify-content-between align-items-center mb-2">
            <strong>Soal {no + 1}</strong>
            <Button variant="outline-danger" size="sm" onClick={() => removeQuestion(q.id)}>
              <Trash2 size={14} />
            </Button>
          </div>

          <Form.Control
            className="mb-3"
            placeholder="Tulis pertanyaan"
            value={q.question}
            onChange={(e) => updateQuestion(q.id, { question: e.target.value })}
          />

          {q.options.map((opt, i) => (
            <div key={i} className="d-flex align-items-center gap-2 mb-2">
              <Form.Check
                type="radio"
                name={`answer-${q.id}`}
                checked={q.answer === i}
                onChange={() => updateQuestion(q.id, { answer: i })}
              />
              <Form.Control
                placeholder={`Opsi ${i + 1}`}
                value={opt}
                onChange={(e) => updateOption(q, i, e.target.value)}
              />
            </div>
          ))}
        </div>
      ))}

      <div className="d-flex gap-2">
        <Button variant="outline-primary" onClick={addQuestion}>
          <Plus size={16} style={{ marginRight: 6 }} />
          Tambah soal
        </Button>
        <Button onClick={() => console.log('Simpan kuis', questions)}>
          <Save size={16} style={{ marginRight: 6 }} />
          Simpan kuis
        </Button>
      </div>
    </div>
  )
}

export default QuizEditorPage
