<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Event;
use App\Models\Survey;
use App\Models\Ticket;
use App\Models\SurveyResponse;
use App\Models\SurveyAnswer;
use App\Models\SurveyQuestion;
use App\Models\CertificateTemplate;
use App\Models\Activity;
use App\Models\LocalMemberPoint;
use App\Models\PointTransaction;
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
            $event = Event::with('organizer', 'institution')
                ->where('id', $eventId)
                ->orWhere('slug', $eventId)
                ->firstOrFail();
            $eventId = $event->id;

            // Check if user is the organizer of the event or an admin
            $isOrganizerOrAdmin = ((int) $event->organizer_id === (int) $user->id || $user->role === 'admin');

            if ($event->status === 'draft' && !$isOrganizerOrAdmin) {
                return response()->json([
                    'success' => false,
                    'status' => 'error',
                    'message' => 'Event tidak ditemukan atau masih berupa draft.',
                ], 404);
            }

            // 1. Check if user has a ticket for this event
            $hasTicket = Ticket::where('participant_id', $user->id)
                ->whereHas('orderItem.order', function ($query) use ($eventId) {
                    $query->where('event_id', $eventId);
                })
                ->exists();

            if (!$hasTicket && !$isOrganizerOrAdmin) {
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

            // Get the custom survey by event_id only (no is_active check)
            $customSurvey = Survey::where('event_id', $eventId)
                ->with(['questions' => fn($q) => $q->orderBy('sort_order')])
                ->first();

            // Set custom survey to null if it is empty/null or questions are empty
            if (!$customSurvey || $customSurvey->questions->isEmpty()) {
                $customSurvey = null;
            }

            // 4. Get certificate template (if exists)
            $template = CertificateTemplate::where('event_id', $eventId)
                ->with('elements')
                ->first();

            if ($template) {
                $template->background_url = Storage::disk('public')->url($template->background_path);
            }

            // 5. Get ticket code
            $ticket = null;
            if ($hasTicket) {
                $ticket = Ticket::where('participant_id', $user->id)
                    ->whereHas('orderItem.order', function ($query) use ($eventId) {
                        $query->where('event_id', $eventId);
                    })
                    ->first();
            }

            $canClaimCertificate = true;
            $claimDisabledReason = null;

            if (!$isOrganizerOrAdmin) {
                if (!in_array($event->status, ['completed', 'post_event'])) {
                    $canClaimCertificate = false;
                    $claimDisabledReason = 'Sertifikat dan evaluasi belum tersedia karena acara belum selesai.';
                } elseif (!$ticket || $ticket->status !== 'used') {
                    $canClaimCertificate = false;
                    $claimDisabledReason = 'Sertifikat dan ulasan belum tersedia karena Anda belum tercatat hadir di acara ini.';
                } elseif (!$template || !$customSurvey) {
                    $canClaimCertificate = false;
                    $claimDisabledReason = 'Evaluasi dan Sertifikat belum disiapkan oleh Penyelenggara.';
                }
            }

            return response()->json([
                'success' => true,
                'status' => 'success',
                'data' => [
                    'event' => $event,
                    'has_ticket' => $hasTicket,
                    'is_preview_only' => $isOrganizerOrAdmin,
                    'already_submitted' => $isOrganizerOrAdmin ? false : $alreadySubmitted,
                    'survey_response' => $isOrganizerOrAdmin ? null : $response,
                    'custom_survey' => $customSurvey,  // null if organizer hasn't built one
                    'certificate_template' => $template,
                    'participant_name' => $user->name,
                    'ticket_code' => $ticket ? $ticket->ticket_code : 'TKT-PREVIEW',
                    'ticket_status' => $ticket ? $ticket->status : null,
                    'can_claim_certificate' => $canClaimCertificate,
                    'claim_disabled_reason' => $claimDisabledReason,
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
        $event = Event::where('id', $eventId)
            ->orWhere('slug', $eventId)
            ->firstOrFail();
        $eventId = $event->id;

        // Penyelenggara/Admin tidak boleh submit survei
        if ((int) $event->organizer_id === (int) $user->id || $user->role === 'admin') {
            return response()->json([
                'success' => false,
                'status' => 'error',
                'message' => 'Penyelenggara acara tidak dapat mengirimkan jawaban survei.'
            ], 403);
        }

        // 1. Verify ticket
        $ticket = Ticket::where('participant_id', $user->id)
            ->whereHas('orderItem.order', function ($query) use ($eventId) {
                $query->where('event_id', $eventId);
            })
            ->first();

        if (!$ticket) {
            return response()->json([
                'success' => false,
                'status' => 'error',
                'message' => 'Anda tidak terdaftar sebagai peserta pada event ini.'
            ], 403);
        }

        // 2. Check conditions (event finished, participant checked-in, template exists)
        if (!in_array($event->status, ['completed', 'post_event'])) {
            return response()->json([
                'success' => false,
                'status' => 'error',
                'message' => 'Sertifikat dan evaluasi belum tersedia karena acara belum selesai.'
            ], 403);
        }

        if ($ticket->status !== 'used') {
            return response()->json([
                'success' => false,
                'status' => 'error',
                'message' => 'Sertifikat dan ulasan belum tersedia karena Anda belum tercatat hadir di acara ini.'
            ], 403);
        }

        // Get the custom survey by event_id only (no is_active check)
        $customSurvey = Survey::where('event_id', $eventId)->first();

        if (!$customSurvey) {
            return response()->json([
                'success' => false,
                'status' => 'error',
                'message' => 'Survei belum tersedia untuk event ini.'
            ], 403);
        }

        $template = CertificateTemplate::where('event_id', $eventId)->exists();
        if (!$template) {
            return response()->json([
                'success' => false,
                'status' => 'error',
                'message' => 'Evaluasi dan Sertifikat belum disiapkan oleh Penyelenggara.'
            ], 403);
        }

        // 3. Check if already submitted
        $existing = SurveyResponse::where('user_id', $user->id)->where('event_id', $eventId)->first();
        if ($existing) {
            return response()->json([
                'success' => false,
                'message' => 'Anda sudah mengisi survei ini sebelumnya.'
            ], 422);
        }

        try {
            DB::beginTransaction();

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

            DB::commit();

            // Award points to the participant for survey submission
            $this->awardSurveyPoints($user->id, $eventId);

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
            $event = Event::where('id', $eventId)
                ->orWhere('slug', $eventId)
                ->firstOrFail();
            $eventId = $event->id;

            // Only organizer or admin of this event can see results
            if ((int) $event->organizer_id !== (int) $user->id && $user->role !== 'admin') {
                return response()->json([
                    'success' => false,
                    'message' => 'Anda tidak memiliki akses ke data survei event ini.'
                ], 403);
            }

            $responses = SurveyResponse::where('event_id', $eventId)
                ->with(['user:id,name,email', 'answers.question'])
                ->orderBy('created_at', 'desc')
                ->get();

            $total = $responses->count();

            // Get the custom survey by event_id only (no is_active check)
            $customSurvey = Survey::where('event_id', $eventId)->first();

            $avgRating = 0;
            $avgSpeaker = 0;
            $avgMaterial = 0;
            $satisfactionRate = 0;
            $distribution = [];
            for ($i = 1; $i <= 5; $i++) {
                $distribution[] = [
                    'star' => $i,
                    'count' => 0,
                    'percent' => 0,
                ];
            }

            if ($customSurvey) {
                // Fetch all rating questions for this custom survey
                $ratingQuestions = SurveyQuestion::where('survey_id', $customSurvey->id)
                    ->where('type', 'rating')
                    ->get();

                // Find specific questions based on keyword matching
                $eventRatingQ = $ratingQuestions->filter(function($q) {
                    $lbl = strtolower($q->label);
                    return str_contains($lbl, 'acara') || str_contains($lbl, 'event') || str_contains($lbl, 'keseluruhan') || str_contains($lbl, 'overall') || str_contains($lbl, 'puas') || str_contains($lbl, 'kepuasan');
                })->first();

                // If not found, fall back to the first rating question
                if (!$eventRatingQ) {
                    $eventRatingQ = $ratingQuestions->first();
                }

                $speakerRatingQ = $ratingQuestions->filter(function($q) {
                    $lbl = strtolower($q->label);
                    return str_contains($lbl, 'pembicara') || str_contains($lbl, 'speaker') || str_contains($lbl, 'pemateri');
                })->first();

                $materialRatingQ = $ratingQuestions->filter(function($q) {
                    $lbl = strtolower($q->label);
                    return str_contains($lbl, 'materi') || str_contains($lbl, 'slide') || str_contains($lbl, 'presentasi') || str_contains($lbl, 'material');
                })->first();

                if ($eventRatingQ) {
                    $avgRating = round(SurveyAnswer::where('question_id', $eventRatingQ->id)->whereNotNull('value')->avg(DB::raw('CAST(value AS UNSIGNED)')), 1);
                }
                if ($speakerRatingQ) {
                    $avgSpeaker = round(SurveyAnswer::where('question_id', $speakerRatingQ->id)->whereNotNull('value')->avg(DB::raw('CAST(value AS UNSIGNED)')), 1);
                }
                if ($materialRatingQ) {
                    $avgMaterial = round(SurveyAnswer::where('question_id', $materialRatingQ->id)->whereNotNull('value')->avg(DB::raw('CAST(value AS UNSIGNED)')), 1);
                }

                // Satisfaction rate: percentage of event rating answers >= 4
                $totalEventRatingAnswers = 0;
                $satisfiedEventRatingAnswers = 0;
                if ($eventRatingQ) {
                    $eventAnswers = SurveyAnswer::where('question_id', $eventRatingQ->id)->whereNotNull('value')->pluck('value');
                    $totalEventRatingAnswers = $eventAnswers->count();
                    $satisfiedEventRatingAnswers = $eventAnswers->filter(fn($val) => (int)$val >= 4)->count();
                }
                $satisfactionRate = $totalEventRatingAnswers > 0 ? round(($satisfiedEventRatingAnswers / $totalEventRatingAnswers) * 100) : 0;

                // Distribution based on the event rating question
                $distribution = [];
                for ($i = 1; $i <= 5; $i++) {
                    $count = 0;
                    if ($eventRatingQ) {
                        $count = SurveyAnswer::where('question_id', $eventRatingQ->id)->where('value', (string)$i)->count();
                    }
                    $distribution[] = [
                        'star' => $i,
                        'count' => $count,
                        'percent' => $totalEventRatingAnswers > 0 ? round(($count / $totalEventRatingAnswers) * 100) : 0,
                    ];
                }
            }


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

    /**
     * Get all certificates (used tickets) for the logged-in participant
     */
    public function getMyCertificates(Request $request)
    {
        try {
            $user = $request->user();

            // 1. Get all tickets for the user that are 'used', OR 'active' with event status in ongoing, post_event, completed (for development and easier claiming)
            $tickets = Ticket::with('orderItem.order.event.institution', 'orderItem.order.event.organizer', 'orderItem.order.event.locationDetail')
                ->where('participant_id', $user->id)
                ->where(function($query) {
                    $query->where('status', 'used')
                          ->orWhere(function($q) {
                              $q->where('status', 'active')
                                ->whereHas('orderItem.order.event', function($evQuery) {
                                    $evQuery->whereIn('status', ['published', 'ongoing', 'post_event', 'completed']);
                                });
                          });
                })
                ->get();

            $certificates = [];

            foreach ($tickets as $ticket) {
                $event = $ticket->orderItem->order->event;
                if (!$event) continue;

                // 2. Check if a survey response exists for this user and event
                $surveyResponse = SurveyResponse::where('user_id', $user->id)
                    ->where('event_id', $event->id)
                    ->first();

                $isUnlocked = !is_null($surveyResponse);

                // 3. Get certificate template (if exists)
                $template = CertificateTemplate::where('event_id', $event->id)
                    ->with('elements')
                    ->first();

                if ($template && $template->background_path) {
                    $template->background_url = url("/api/certificate/background/{$event->id}");
                }

                $locationText = 'TBA';
                if ($event->locationDetail) {
                    if ($event->locationDetail->type === 'online') {
                        $locationText = "Online (" . ($event->locationDetail->platform ?? 'Platform tidak diketahui') . ")";
                    } else {
                        $locationText = $event->locationDetail->location_name ?? 'Lokasi Offline';
                    }
                }

                $eventDate = $event->start_date ? $event->start_date->translatedFormat('d M Y') : '';

                $certificates[] = [
                    'ticket_code' => $ticket->ticket_code,
                    'attendee_name' => $ticket->attendee_name,
                    'event' => [
                        'id' => $event->id,
                        'slug' => $event->slug,
                        'title' => $event->title,
                        'date' => $eventDate,
                        'location' => $locationText,
                        'organizer_name' => $event->institution->name ?? ($event->organizer->name ?? 'KampusX Organizer'),
                    ],
                    'is_unlocked' => $isUnlocked,
                    'survey_response' => $surveyResponse,
                    'certificate_template' => $template,
                ];
            }

            return response()->json([
                'success' => true,
                'status' => 'success',
                'data' => $certificates
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'status' => 'error',
                'message' => 'Gagal mengambil data sertifikat: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Automatically award points for the survey_submission activity.
     */
    private function awardSurveyPoints($userId, $eventId)
    {
        if (!$userId) {
            return;
        }

        $activity = Activity::firstOrCreate(
            ['slug' => 'survey_submission'],
            [
                'name' => 'Pengisian Survei (Survey Submission)',
                'points_rewarded' => 30, // Default fallback
                'type' => 'local',
                'description' => 'Poin lokal untuk mengisi survei evaluasi event.',
                'is_active' => true
            ]
        );

        if (!$activity->is_active) {
            return;
        }

        // Check if already has points for survey_submission for this event to avoid duplicate points
        $exists = PointTransaction::where('user_id', $userId)
            ->where('event_id', $eventId)
            ->where('activity_id', $activity->id)
            ->exists();

        if ($exists) {
            return;
        }

        $points = $activity->points_rewarded;

        DB::transaction(function () use ($userId, $eventId, $activity, $points) {
            $localPoint = LocalMemberPoint::firstOrCreate(
                ['user_id' => $userId, 'event_id' => $eventId],
                ['points_balance' => 0]
            );

            $lockedPoint = LocalMemberPoint::where('id', $localPoint->id)
                ->lockForUpdate()
                ->first();

            $lockedPoint->points_balance += $points;
            $lockedPoint->save();

            PointTransaction::create([
                'type' => 'local',
                'user_id' => $userId,
                'event_id' => $eventId,
                'activity_id' => $activity->id,
                'amount' => $points,
                'description' => 'Poin Pengisian Survei',
            ]);
        });

        // NOTIFICATION: Kirim notifikasi ke peserta
        $participantUser = \App\Models\User::find($userId);
        if ($participantUser) {
            $participantUser->notify(new \App\Notifications\OperationalNotification(
                "Poin Aktivitas Ditambahkan!",
                "Selamat! Kamu mendapatkan +{$points} poin dari aktivitas \"{$activity->name}\".",
                "points_earned",
                [
                    'event_id' => $eventId,
                    'points' => $points,
                    'activity_name' => $activity->name,
                    'description' => 'Poin Pengisian Survei'
                ]
            ));
        }
    }
}
