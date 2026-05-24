<?php

namespace App\Http\Controllers\Api\EventDashboard;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Event;
use App\Models\Survey;
use App\Models\SurveyQuestion;
use Illuminate\Support\Facades\DB;

class SurveyFormController extends Controller
{
    /**
     * Get the active/current survey for an event (returns first active, or first survey).
     * Supports 1-to-many but UI shows 1.
     */
    public function show(int $eventId)
    {
        try {
            Event::findOrFail($eventId);

            // Get active survey first, fallback to latest
            $survey = Survey::where('event_id', $eventId)
                ->with(['questions' => fn($q) => $q->orderBy('sort_order')])
                ->orderByDesc('is_active')
                ->orderByDesc('created_at')
                ->first();

            return response()->json([
                'success' => true,
                'data' => $survey,
            ]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    /**
     * Create a new survey for the event.
     */
    public function store(Request $request, int $eventId)
    {
        Event::findOrFail($eventId);

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
            'is_active' => 'boolean',
        ]);

        try {
            // Deactivate all existing surveys if new one is set active
            if (!empty($validated['is_active'])) {
                Survey::where('event_id', $eventId)->update(['is_active' => false]);
            }

            $survey = Survey::create([
                'event_id' => $eventId,
                'title' => $validated['title'],
                'description' => $validated['description'] ?? null,
                'is_active' => $validated['is_active'] ?? false,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Survei berhasil dibuat!',
                'data' => $survey->load('questions'),
            ], 201);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    /**
     * Update survey metadata (title, description, is_active).
     */
    public function update(Request $request, int $eventId, int $surveyId)
    {
        $survey = Survey::where('event_id', $eventId)->findOrFail($surveyId);

        $validated = $request->validate([
            'title' => 'sometimes|string|max:255',
            'description' => 'nullable|string|max:1000',
            'is_active' => 'sometimes|boolean',
        ]);

        try {
            // Deactivate others if this one is being activated
            if (isset($validated['is_active']) && $validated['is_active']) {
                Survey::where('event_id', $eventId)
                    ->where('id', '!=', $surveyId)
                    ->update(['is_active' => false]);
            }

            $survey->update($validated);

            return response()->json([
                'success' => true,
                'message' => 'Survei berhasil diperbarui!',
                'data' => $survey->load('questions'),
            ]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    /**
     * Sync all questions for a survey (replace strategy: delete old, insert new).
     */
    public function syncQuestions(Request $request, int $eventId, int $surveyId)
    {
        $survey = Survey::where('event_id', $eventId)->findOrFail($surveyId);

        $validated = $request->validate([
            'questions' => 'required|array',
            'questions.*.type' => 'required|in:text,textarea,rating,radio,checkbox',
            'questions.*.label' => 'required|string|max:500',
            'questions.*.options' => 'nullable|array',
            'questions.*.options.*' => 'string|max:255',
            'questions.*.is_required' => 'boolean',
        ]);

        try {
            DB::beginTransaction();

            // Delete existing questions (cascade deletes answers — OK since editing before publishing)
            $survey->questions()->delete();

            // Re-insert with new sort order
            $questionsData = collect($validated['questions'])->mapWithKeys(function ($q, $index) use ($survey) {
                return [$index => [
                    'survey_id' => $survey->id,
                    'type' => $q['type'],
                    'label' => $q['label'],
                    'options' => isset($q['options']) ? json_encode($q['options']) : null,
                    'is_required' => $q['is_required'] ?? false,
                    'sort_order' => $index,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]];
            })->values()->toArray();

            SurveyQuestion::insert($questionsData);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Pertanyaan survei berhasil disimpan!',
                'data' => $survey->load('questions'),
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    /**
     * Delete a survey and all its questions.
     */
    public function destroy(int $eventId, int $surveyId)
    {
        $survey = Survey::where('event_id', $eventId)->findOrFail($surveyId);
        $survey->delete();

        return response()->json([
            'success' => true,
            'message' => 'Survei berhasil dihapus.',
        ]);
    }
}
