<?php

namespace Tests\Feature;

use App\Models\LearningActivity;
use App\Models\LearningHistory;
use App\Models\LearningPath;
use App\Models\Lesson;
use App\Models\Module;
use App\Models\QuestionOption;
use App\Models\Quiz;
use App\Models\QuizQuestion;
use App\Models\SrlLearningSession;
use App\Models\User;
use App\Services\Lms\LearningDataService;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class LearningDataServiceTest extends TestCase
{
    use DatabaseTransactions;

    private User $learner;
    private LearningPath $path;
    private Module $module;
    private Lesson $lesson;

    protected function setUp(): void
    {
        parent::setUp();

        $this->learner = User::factory()->create();

        $this->path = LearningPath::create([
            'created_by'   => $this->learner->id,
            'title'        => 'Path Learning Data Test',
            'slug'         => 'path-learning-data-test-' . uniqid(),
            'status'       => 'published',
            'published_at' => now(),
        ]);

        $this->module = Module::create([
            'learning_path_id' => $this->path->id,
            'title'            => 'Modul 1',
            'order_index'      => 1,
            'status'           => 'published',
        ]);

        $this->lesson = Lesson::create([
            'module_id'        => $this->module->id,
            'title'            => 'Lesson 1',
            'type'             => 'article',
            'content'          => 'Konten lesson.',
            'order_index'      => 1,
            'duration_minutes' => 5,
            'xp'               => 25,
            'status'           => 'published',
        ]);
    }

    public function test_service_records_lesson_viewed_and_completed_without_downgrading(): void
    {
        $service = app(LearningDataService::class);

        $history = $service->recordLessonViewed($this->learner->id, $this->lesson);

        $this->assertSame(LearningHistory::STATUS_IN_PROGRESS, $history->status);
        $this->assertNotNull($history->started_at);
        $this->assertDatabaseHas('learning_activities', [
            'user_id'       => $this->learner->id,
            'activity_type' => 'lesson_viewed',
            'target_type'   => $this->lesson->getMorphClass(),
            'target_id'     => $this->lesson->id,
        ]);

        $completed = $service->recordLessonCompleted($this->learner->id, $this->lesson, 180);

        $this->assertSame(LearningHistory::STATUS_COMPLETED, $completed->status);
        $this->assertEquals(100.00, (float) $completed->progress);
        $this->assertSame(180, $completed->duration_seconds);
        $this->assertNotNull($completed->completed_at);

        // Melihat ulang lesson yang sudah selesai tidak boleh menurunkan status menjadi in_progress
        $afterRevisit = $service->recordLessonViewed($this->learner->id, $this->lesson);
        $this->assertSame(LearningHistory::STATUS_COMPLETED, $afterRevisit->status);
        $this->assertEquals(100.00, (float) $afterRevisit->progress);
    }

    public function test_lesson_view_and_complete_endpoints_record_learning_data(): void
    {
        Sanctum::actingAs($this->learner);

        $this->getJson("/api/lms/member/modules/{$this->module->id}/lessons/{$this->lesson->id}")
            ->assertOk();

        $this->assertDatabaseHas('learning_histories', [
            'user_id'   => $this->learner->id,
            'lesson_id' => $this->lesson->id,
            'status'    => 'in_progress',
        ]);
        $this->assertDatabaseHas('learning_activities', [
            'user_id'       => $this->learner->id,
            'activity_type' => 'lesson_viewed',
            'target_type'   => $this->lesson->getMorphClass(),
            'target_id'     => $this->lesson->id,
        ]);

        $this->postJson("/api/lms/member/modules/{$this->module->id}/lessons/{$this->lesson->id}/complete", [
            'duration_seconds' => 195,
        ])->assertOk();

        // Panggil ulang complete (idempotent): durasi tidak boleh bertambah dua kali
        $this->postJson("/api/lms/member/modules/{$this->module->id}/lessons/{$this->lesson->id}/complete", [
            'duration_seconds' => 195,
        ])->assertOk();

        $history = LearningHistory::where('user_id', $this->learner->id)
            ->where('lesson_id', $this->lesson->id)
            ->firstOrFail();

        $this->assertSame('completed', $history->status);
        $this->assertSame(195, $history->duration_seconds);
        $this->assertDatabaseHas('learning_activities', [
            'user_id'          => $this->learner->id,
            'activity_type'    => 'lesson_completed',
            'target_type'      => $this->lesson->getMorphClass(),
            'target_id'        => $this->lesson->id,
            'duration_seconds' => 195,
        ]);
    }

    public function test_quiz_start_and_submit_record_learning_activities(): void
    {
        $quiz = Quiz::create([
            'module_id'     => $this->module->id,
            'title'         => 'Kuis Modul 1',
            'passing_score' => 70,
            'is_published'  => true,
        ]);

        $question = QuizQuestion::create([
            'quiz_id'       => $quiz->id,
            'question_text' => 'Apa hasil 1 + 1?',
            'order_index'   => 1,
        ]);

        $correctOption = QuestionOption::create([
            'question_id'  => $question->id,
            'option_label' => 'A',
            'option_text'  => '2',
            'is_correct'   => true,
            'order_index'  => 1,
        ]);

        Sanctum::actingAs($this->learner);

        $startResponse = $this->postJson("/api/lms/member/modules/{$this->module->id}/quiz/start")
            ->assertOk();

        $attemptId = $startResponse->json('data.attempt.id');

        $this->assertDatabaseHas('learning_activities', [
            'user_id'       => $this->learner->id,
            'activity_type' => 'quiz_started',
            'target_type'   => $quiz->getMorphClass(),
            'target_id'     => $quiz->id,
        ]);

        $this->postJson("/api/lms/member/modules/{$this->module->id}/quiz/attempts/{$attemptId}/submit", [
            'answers' => [
                ['question_id' => $question->id, 'option_id' => $correctOption->id],
            ],
        ])->assertOk();

        $this->assertDatabaseHas('learning_activities', [
            'user_id'       => $this->learner->id,
            'activity_type' => 'quiz_submitted',
            'target_type'   => $quiz->getMorphClass(),
            'target_id'     => $quiz->id,
        ]);
    }

    public function test_srl_session_and_learning_activity_endpoints_record_learning_data(): void
    {
        Sanctum::actingAs($this->learner);

        $storeResponse = $this->postJson('/api/lms/member/srl-sessions', [
            'goal'              => 'Mempelajari lesson 1',
            'start_immediately' => true,
        ])->assertCreated();

        $sessionId = $storeResponse->json('session.id');

        $this->assertDatabaseHas('learning_activities', [
            'user_id'       => $this->learner->id,
            'activity_type' => 'srl_session_started',
            'target_type'   => SrlLearningSession::class,
            'target_id'     => $sessionId,
        ]);

        $this->postJson("/api/lms/member/srl-sessions/{$sessionId}/materials", [
            'target_type'      => 'lesson',
            'target_id'        => $this->lesson->id,
            'activity_type'    => 'studied',
            'duration_seconds' => 120,
            'is_completed'     => false,
        ])->assertOk();

        $this->assertDatabaseHas('learning_histories', [
            'user_id'          => $this->learner->id,
            'lesson_id'        => $this->lesson->id,
            'status'           => 'in_progress',
            'duration_seconds' => 120,
        ]);

        $this->patchJson("/api/lms/member/srl-sessions/{$sessionId}/reflect", [
            'goal_achievement'    => 'tercapai',
            'accumulated_seconds' => 120,
        ])->assertOk();

        $this->assertDatabaseHas('learning_activities', [
            'user_id'          => $this->learner->id,
            'activity_type'    => 'srl_session_completed',
            'target_type'      => SrlLearningSession::class,
            'target_id'        => $sessionId,
            'duration_seconds' => 120,
        ]);

        $this->postJson('/api/lms/member/learning-activities', [
            'activity_type'    => 'manual_note',
            'duration_seconds' => 60,
            'metadata'         => ['note' => 'Ringkasan materi'],
        ])->assertCreated();

        $this->getJson('/api/lms/member/learning-activities')
            ->assertOk()
            ->assertJsonPath('success', true);
    }

    public function test_active_srl_session_automatically_tracks_lesson_and_quiz_materials(): void
    {
        $quiz = Quiz::create([
            'module_id'     => $this->module->id,
            'title'         => 'Kuis SRL',
            'passing_score' => 70,
            'is_published'  => true,
        ]);

        $question = QuizQuestion::create([
            'quiz_id'       => $quiz->id,
            'question_text' => 'Pertanyaan 1',
            'order_index'   => 1,
        ]);

        $option = QuestionOption::create([
            'question_id'  => $question->id,
            'option_label' => 'A',
            'option_text'  => 'Benar',
            'is_correct'   => true,
            'order_index'  => 1,
        ]);

        Sanctum::actingAs($this->learner);

        $sessionRes = $this->postJson('/api/lms/member/srl-sessions', [
            'goal'              => 'Belajar modul 1 dan kuis',
            'start_immediately' => true,
        ])->assertCreated();

        $sessionId = $sessionRes->json('session.id');

        // 1. Buka & selesaikan lesson saat sesi SRL aktif -> otomatis tercatat di srl_session_materials
        $this->getJson("/api/lms/member/modules/{$this->module->id}/lessons/{$this->lesson->id}")
            ->assertOk();

        $this->assertDatabaseHas('srl_session_materials', [
            'srl_learning_session_id' => $sessionId,
            'target_type'             => $this->lesson->getMorphClass(),
            'target_id'               => $this->lesson->id,
            'activity_type'           => 'viewed',
            'is_completed'            => false,
        ]);

        $this->postJson("/api/lms/member/modules/{$this->module->id}/lessons/{$this->lesson->id}/complete", [
            'duration_seconds' => 90,
        ])->assertOk();

        $this->assertDatabaseHas('srl_session_materials', [
            'srl_learning_session_id' => $sessionId,
            'target_type'             => $this->lesson->getMorphClass(),
            'target_id'               => $this->lesson->id,
            'activity_type'           => 'completed',
            'duration_seconds'        => 90,
            'is_completed'            => true,
        ]);

        // 2. Mulai & submit kuis saat sesi SRL aktif -> otomatis tercatat di srl_session_materials
        $startRes = $this->postJson("/api/lms/member/modules/{$this->module->id}/quiz/start")
            ->assertOk();
        $attemptId = $startRes->json('data.attempt.id');

        $this->postJson("/api/lms/member/modules/{$this->module->id}/quiz/attempts/{$attemptId}/submit", [
            'answers' => [
                ['question_id' => $question->id, 'option_id' => $option->id],
            ],
        ])->assertOk();

        $this->assertDatabaseHas('srl_session_materials', [
            'srl_learning_session_id' => $sessionId,
            'target_type'             => $quiz->getMorphClass(),
            'target_id'               => $quiz->id,
            'activity_type'           => 'quiz_attempted',
            'is_completed'            => true,
        ]);
    }
}
