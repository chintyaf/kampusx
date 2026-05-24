<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Event;
use App\Models\Survey;
use App\Models\Ticket;
use App\Models\SurveyResponse;
use App\Models\SurveyAnswer;
use App\Models\CertificateTemplate;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class SurveyController extends Controller
{
    /**
     * Get survey and certificate template details for an event
     */
    public function getSurveyDetails(Request $request, $eventId)
    {
        try {
            $user = $request->user();
            $event = Event::with('organizer', 'institution')->findOrFail($eventId);

            // 1. Check if user has a ticket for this event
            $hasTicket = Ticket::where('participant_id', $user->id)
                ->whereHas('orderItem.order', function ($query) use ($eventId) {
                    $query->where('event_id', $eventId);
                })
                ->exists();

            if (!$hasTicket) {
                return response()->json([
                    'success' => false,
                    'status' => 'error',
                    'message' => 'Anda tidak terdaftar sebagai peserta pada event ini.',
                    'has_ticket' => false
                ], 403);
            }

            // 2. Check if user has already submitted the survey
            $response = SurveyResponse::where('user_id', $user->id)
                ->where('event_id', $eventId)
                ->with('answers.question')
                ->first();

            $alreadySubmitted = !is_null($response);

            // 3. Get the active custom survey (if organizer built one)
            $customSurvey = Survey::where('event_id', $eventId)
                ->where('is_active', true)
                ->with(['questions' => fn($q) => $q->orderBy('sort_order')])
                ->first();

            // 4. Get certificate template (if exists)
            $template = CertificateTemplate::where('event_id', $eventId)
                ->with('elements')
                ->first();

            if ($template) {
                $template->background_url = Storage::disk('public')->url($template->background_path);
            }

            // 5. Get ticket code
            $ticket = Ticket::where('participant_id', $user->id)
                ->whereHas('orderItem.order', function ($query) use ($eventId) {
                    $query->where('event_id', $eventId);
                })
                ->first();

            return response()->json([
                'success' => true,
                'status' => 'success',
                'data' => [
                    'event' => $event,
                    'has_ticket' => true,
                    'already_submitted' => $alreadySubmitted,
                    'survey_response' => $response,
                    'custom_survey' => $customSurvey,  // null if organizer hasn't built one
                    'certificate_template' => $template,
                    'participant_name' => $user->name,
                    'ticket_code' => $ticket ? $ticket->ticket_code : 'TKT-PENDING',
                ]
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'status' => 'error',
                'message' => 'Gagal memuat detail survei: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Submit survey response for an event.
     * Supports both legacy fixed-field and new dynamic custom survey answers.
     */
    public function submitSurvey(Request $request, $eventId)
    {
        $user = $request->user();

        // 1. Verify ticket
        $hasTicket = Ticket::where('participant_id', $user->id)
            ->whereHas('orderItem.order', function ($query) use ($eventId) {
                $query->where('event_id', $eventId);
            })
            ->exists();

        if (!$hasTicket) {
            return response()->json([
                'success' => false,
                'status' => 'error',
                'message' => 'Anda tidak terdaftar sebagai peserta pada event ini.'
            ], 403);
        }

        // 2. Check if already submitted
        $existing = SurveyResponse::where('user_id', $user->id)->where('event_id', $eventId)->first();
        if ($existing) {
            return response()->json([
                'success' => false,
                'message' => 'Anda sudah mengisi survei ini sebelumnya.'
            ], 422);
        }

        // 3. Check if there's an active custom survey
        $customSurvey = Survey::where('event_id', $eventId)->where('is_active', true)->first();

        try {
            DB::beginTransaction();

            if ($customSurvey) {
                // === DYNAMIC CUSTOM SURVEY SUBMISSION ===
                $validated = $request->validate([
                    'survey_id' => 'required|integer',
                    'answers' => 'required|array',
                    'answers.*.question_id' => 'required|integer|exists:survey_questions,id',
                    'answers.*.value' => 'nullable|string|max:2000',
                ]);

                $surveyResponse = SurveyResponse::create([
                    'user_id' => $user->id,
                    'event_id' => $eventId,
                    'survey_id' => $customSurvey->id,
                    // Legacy fields get a default so they're not null
                    'rating' => null,
                    'comments' => null,
                ]);

                // Insert all answers
                $answersData = collect($validated['answers'])->map(fn($a) => [
                    'response_id' => $surveyResponse->id,
                    'question_id' => $a['question_id'],
                    'value' => $a['value'] ?? null,
                    'created_at' => now(),
                    'updated_at' => now(),
                ])->toArray();

                SurveyAnswer::insert($answersData);

            } else {
                // === LEGACY FIXED SURVEY SUBMISSION ===
                $validated = $request->validate([
                    'rating' => 'required|integer|min:1|max:5',
                    'speaker_rating' => 'nullable|integer|min:1|max:5',
                    'material_rating' => 'nullable|integer|min:1|max:5',
                    'comments' => 'nullable|string|max:1000',
                ]);

                $surveyResponse = SurveyResponse::create([
                    'user_id' => $user->id,
                    'event_id' => $eventId,
                    'rating' => $validated['rating'],
                    'speaker_rating' => $validated['speaker_rating'] ?? null,
                    'material_rating' => $validated['material_rating'] ?? null,
                    'comments' => $validated['comments'] ?? null,
                ]);
            }

            DB::commit();

            // Return certificate template
            $template = CertificateTemplate::where('event_id', $eventId)->with('elements')->first();
            if ($template) {
                $template->background_url = Storage::disk('public')->url($template->background_path);
            }

            return response()->json([
                'success' => true,
                'status' => 'success',
                'message' => 'Survei berhasil dikirim! Sertifikat Anda telah terbuka.',
                'data' => [
                    'survey_response' => $surveyResponse->load('answers.question'),
                    'certificate_template' => $template,
                    'participant_name' => $user->name,
                ]
            ], 200);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'status' => 'error',
                'message' => 'Gagal menyimpan survei: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Organizer: Get survey analytics/responses for their event
     */
    public function getOrganizerAnalytics(Request $request, $eventId)
    {
        try {
            $user = $request->user();
            $event = Event::findOrFail($eventId);

            // Only organizer or admin of this event can see results
            if ($event->organizer_id !== $user->id && $user->role !== 'admin') {
                return response()->json([
                    'success' => false,
                    'message' => 'Anda tidak memiliki akses ke data survei event ini.'
                ], 403);
            }

            $responses = SurveyResponse::where('event_id', $eventId)
                ->with('user:id,name,email')
                ->orderBy('created_at', 'desc')
                ->get();

            $total = $responses->count();

            // Compute averages
            $avgRating = $total > 0 ? round($responses->avg('rating'), 1) : 0;
            $avgSpeaker = $total > 0 ? round($responses->whereNotNull('speaker_rating')->avg('speaker_rating'), 1) : 0;
            $avgMaterial = $total > 0 ? round($responses->whereNotNull('material_rating')->avg('material_rating'), 1) : 0;

            // Rating distribution (1-5)
            $distribution = [];
            for ($i = 1; $i <= 5; $i++) {
                $count = $responses->where('rating', $i)->count();
                $distribution[] = [
                    'star' => $i,
                    'count' => $count,
                    'percent' => $total > 0 ? round(($count / $total) * 100) : 0,
                ];
            }

            // Satisfaction %: responses rating >= 4
            $satisfiedCount = $responses->filter(fn($r) => $r->rating >= 4)->count();
            $satisfactionRate = $total > 0 ? round(($satisfiedCount / $total) * 100) : 0;

            return response()->json([
                'success' => true,
                'data' => [
                    'total_responses' => $total,
                    'avg_rating' => $avgRating,
                    'avg_speaker_rating' => $avgSpeaker,
                    'avg_material_rating' => $avgMaterial,
                    'satisfaction_rate' => $satisfactionRate,
                    'distribution' => $distribution,
                    'responses' => $responses,
                ]
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil data analitik: ' . $e->getMessage()
            ], 500);
        }
    }
}
