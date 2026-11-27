<?php

namespace Tests\Feature;

use App\Models\LearningPath;
use App\Models\Module;
use App\Models\Quiz;
use App\Models\User;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class OrganizerQuizTest extends TestCase
{
    use DatabaseTransactions;

    public function test_organizer_can_list_create_show_update_and_delete_quiz(): void
    {
        $organizer = User::factory()->create(['role' => 'organizer']);

        $path = LearningPath::create([
            'created_by' => $organizer->id,
            'title'      => 'Path Organizer Quiz',
            'slug'       => 'path-organizer-quiz-' . uniqid(),
            'status'     => 'draft',
        ]);

        $module = Module::create([
            'learning_path_id' => $path->id,
            'title'            => 'Modul Quiz',
            'order_index'      => 1,
            'status'           => 'draft',
        ]);

        Sanctum::actingAs($organizer);

        // Create quiz
        $createRes = $this->postJson('/api/organizer/lms/quiz', [
            'module_id'     => $module->id,
            'title'         => 'Kuis Baru',
            'passing_score' => 70,
            'questions'     => [
                [
                    'question_text' => 'Pertanyaan pertama',
                    'order_index'   => 1,
                    'options'       => [
                        ['option_label' => 'A', 'option_text' => 'Opsi A', 'is_correct' => true, 'order_index' => 1],
                        ['option_label' => 'B', 'option_text' => 'Opsi B', 'is_correct' => false, 'order_index' => 2],
                    ],
                ],
            ],
        ])->assertCreated();

        $quizId = $createRes->json('data.id');

        // Index (used by QuizEditorPage)
        $this->getJson("/api/organizer/lms/quiz?module_id={$module->id}&per_page=50")
            ->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.data.0.id', $quizId);

        // Show (used by QuizEditorPage)
        $this->getJson("/api/organizer/lms/quiz/{$quizId}")
            ->assertOk()
            ->assertJsonPath('data.id', $quizId)
            ->assertJsonCount(1, 'data.questions');

        // Update
        $this->putJson("/api/organizer/lms/quiz/{$quizId}", [
            'module_id'     => $module->id,
            'title'         => 'Kuis Diperbarui',
            'passing_score' => 80,
            'is_published'  => true,
            'questions'     => [
                [
                    'question_text' => 'Pertanyaan baru',
                    'order_index'   => 1,
                    'options'       => [
                        ['option_label' => 'A', 'option_text' => 'Opsi A', 'is_correct' => false, 'order_index' => 1],
                        ['option_label' => 'B', 'option_text' => 'Opsi B', 'is_correct' => true, 'order_index' => 2],
                    ],
                ],
            ],
        ])->assertOk()
            ->assertJsonPath('data.title', 'Kuis Diperbarui')
            ->assertJsonPath('data.is_published', true);

        // Delete
        $this->deleteJson("/api/organizer/lms/quiz/{$quizId}")
            ->assertOk();

        $this->assertDatabaseMissing('quizzes', ['id' => $quizId]);
    }
}
