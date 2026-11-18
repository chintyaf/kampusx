<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use App\Models\LearningPath;
use App\Models\Module;
use App\Models\Lesson;
use App\Models\Quiz;
use App\Models\QuizQuestion;
use App\Models\QuestionOption;
use Illuminate\Foundation\Testing\RefreshDatabase;

class AiContentTest extends TestCase
{
    use RefreshDatabase;

    private User $user;
    private LearningPath $learningPath;

    protected function setUp(): void
    {
        parent::setUp();

        if (!\Illuminate\Support\Facades\Schema::hasTable('users')) {
            \Illuminate\Support\Facades\Schema::create('users', function ($table) {
                $table->id();
                $table->string('name');
                $table->string('email')->unique();
                $table->string('password');
                $table->string('role')->default('organizer');
                $table->string('status')->default('active');
                $table->string('status_reason')->nullable();
                $table->unsignedBigInteger('university_id')->nullable();
                $table->dateTime('affiliation_valid_until')->nullable();
                $table->boolean('is_verified')->default(true);
                $table->string('avatar_path')->nullable();
                $table->rememberToken();
                $table->timestamps();
            });
        }

        if (!\Illuminate\Support\Facades\Schema::hasTable('events')) {
            \Illuminate\Support\Facades\Schema::create('events', function ($table) {
                $table->id();
                $table->string('title');
                $table->timestamps();
            });
        }

        $this->user = User::factory()->create([
            'role' => 'organizer',
        ]);

        $this->learningPath = LearningPath::create([
            'created_by' => $this->user->id,
            'title' => 'Python Masterclass',
            'category' => 'Programming',
            'status' => 'published',
        ]);
    }

    public function test_can_generate_and_store_module_with_lessons_and_quiz(): void
    {
        $payload = [
            'learning_path_id' => $this->learningPath->id,
            'title' => 'Dasar Pemrograman Python',
            'description' => 'Mempelajari sintaks dasar dan alur logika Python.',
            'difficulty_level' => 'beginner',
            'learning_outcomes' => ['Memahami variabel', 'Menulis percabangan'],
            'order_index' => 1,
            'lessons' => [
                [
                    'title' => 'Pengenalan Variabel & Tipe Data',
                    'type' => 'article',
                    'content' => '# Variabel di Python\nVariabel digunakan untuk menyimpan data.',
                    'summary' => 'Ringkasan variabel integer, float, string.',
                    'duration_minutes' => 10,
                    'xp' => 30,
                    'quiz' => [
                        'title' => 'Kuis Variabel',
                        'passing_score' => 80,
                        'questions' => [
                            [
                                'question_text' => 'Manakah yang merupakan tipe data teks?',
                                'bloom_level' => 'remember',
                                'explanation' => 'str adalah representasi string.',
                                'correct_answer' => 'str',
                                'options' => ['int', 'float', 'str', 'bool'],
                            ],
                        ],
                    ],
                ],
            ],
        ];

        $response = $this->actingAs($this->user)
            ->postJson('/api/ai/generate-module', $payload);

        $response->assertStatus(201)
            ->assertJson([
                'success' => true,
                'message' => 'Generated Module, Lessons, dan Quiz berhasil disimpan.',
            ]);

        $this->assertDatabaseHas('modules', [
            'learning_path_id' => $this->learningPath->id,
            'title' => 'Dasar Pemrograman Python',
        ]);

        $this->assertDatabaseHas('lessons', [
            'title' => 'Pengenalan Variabel & Tipe Data',
        ]);

        $this->assertDatabaseHas('quizzes', [
            'title' => 'Kuis Variabel',
        ]);

        $this->assertDatabaseHas('quiz_questions', [
            'question_text' => 'Manakah yang merupakan tipe data teks?',
        ]);

        $this->assertDatabaseHas('question_options', [
            'option_text' => 'str',
            'is_correct' => true,
        ]);

        $this->assertDatabaseHas('question_options', [
            'option_text' => 'int',
            'is_correct' => false,
        ]);
    }

    public function test_can_generate_and_store_lesson_inside_existing_module(): void
    {
        $module = Module::create([
            'learning_path_id' => $this->learningPath->id,
            'title' => 'Modul 1: Pengenalan Logika',
            'status' => 'published',
        ]);

        $payload = [
            'title' => 'Percabangan If Else',
            'type' => 'article',
            'content' => '# Logika If Else...',
            'summary' => 'Memahami if, elif, dan else.',
            'duration_minutes' => 15,
            'xp' => 40,
            'quiz' => [
                'title' => 'Kuis Logika Percabangan',
                'passing_score' => 75,
                'questions' => [
                    [
                        'question_text' => 'Keyword apa untuk kondisi alternatif di Python?',
                        'correct_answer' => 'B',
                        'options' => [
                            ['label' => 'A', 'text' => 'else if'],
                            ['label' => 'B', 'text' => 'elif'],
                            ['label' => 'C', 'text' => 'elseif'],
                        ],
                    ],
                ],
            ],
        ];

        $response = $this->actingAs($this->user)
            ->postJson("/api/modules/{$module->id}/ai/generate-lesson", $payload);

        $response->assertStatus(201)
            ->assertJson([
                'success' => true,
                'message' => 'Generated Lesson dan Quiz berhasil disimpan ke dalam Module.',
            ]);

        $this->assertDatabaseHas('lessons', [
            'module_id' => $module->id,
            'title' => 'Percabangan If Else',
        ]);

        $this->assertDatabaseHas('question_options', [
            'option_label' => 'B',
            'option_text' => 'elif',
            'is_correct' => true,
        ]);
    }

    public function test_fails_when_correct_answer_does_not_match_any_option(): void
    {
        $payload = [
            'learning_path_id' => $this->learningPath->id,
            'title' => 'Modul Gagal',
            'lessons' => [
                [
                    'title' => 'Lesson 1',
                    'quiz' => [
                        'questions' => [
                            [
                                'question_text' => 'Pertanyaan tanpa jawaban valid?',
                                'correct_answer' => 'Z', // Tidak ada di options
                                'options' => ['A', 'B', 'C'],
                            ],
                        ],
                    ],
                ],
            ],
        ];

        $response = $this->actingAs($this->user)
            ->postJson('/api/ai/generate-module', $payload);

        $response->assertStatus(422);
    }

    public function test_can_generate_with_ai_result_wrapper_and_assoc_options(): void
    {
        $payload = [
            'learning_path_id' => $this->learningPath->id,
            'ai_result' => [
                'title' => 'Modul dengan Wrapper AI',
                'description' => 'Materi dari generative ai',
                'lessons' => [
                    [
                        'title' => 'Pelajaran 1',
                        'content' => 'Konten pelajaran...',
                        'summary' => 'Ringkasan...',
                        'learning_objectives' => ['Tujuan 1', 'Tujuan 2'],
                        'reflection_question' => 'Apa yang sudah dipelajari?',
                        'quiz' => [
                            [
                                'question' => 'Manakah yang benar?',
                                'options' => [
                                    'A' => 'Jawaban A',
                                    'B' => 'Jawaban B',
                                    'C' => 'Jawaban C',
                                    'D' => 'Jawaban D',
                                ],
                                'correct_answer' => 'B',
                                'explanation' => 'B adalah jawaban benar.',
                            ],
                        ],
                    ],
                ],
            ],
        ];

        $response = $this->actingAs($this->user)
            ->postJson('/api/ai/generate-module', $payload);

        $response->assertStatus(201)
            ->assertJson([
                'success' => true,
            ]);

        $this->assertDatabaseHas('modules', [
            'title' => 'Modul dengan Wrapper AI',
        ]);

        $this->assertDatabaseHas('question_options', [
            'option_label' => 'B',
            'option_text' => 'Jawaban B',
            'is_correct' => true,
        ]);

        $this->assertDatabaseHas('question_options', [
            'option_label' => 'A',
            'option_text' => 'Jawaban A',
            'is_correct' => false,
        ]);
    }
}
