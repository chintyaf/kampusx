<?php

namespace App\Exports;

use App\Models\Ticket;
use App\Models\AttendanceLog;
use App\Models\Event;
use Illuminate\Support\Facades\DB;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

class EventParticipantExport implements FromCollection, WithHeadings, WithMapping
{
    protected $tickets;
    protected $attendanceLogs;
    protected $surveyResponses;
    protected $questions;
    protected $headerNames;

    public function __construct($tickets, $attendanceLogs, $surveyResponses, $questions, $headerNames)
    {
        $this->tickets = $tickets;
        $this->attendanceLogs = $attendanceLogs;
        $this->surveyResponses = $surveyResponses;
        $this->questions = $questions;
        $this->headerNames = $headerNames;
    }

    public function collection()
    {
        return collect($this->tickets);
    }

    public function headings(): array
    {
        return $this->headerNames;
    }

    public function map($ticket): array
    {
        $user = $ticket->participant;
        $log = $this->attendanceLogs->get($ticket->id);
        $surveyData = $user ? ($this->surveyResponses[$user->id] ?? null) : null;
        $orderItem = $ticket->orderItem;

        $row = [
            $ticket->ticket_code,
            $user->name ?? '-',
            $user->email ?? '-',
            $user->university->name ?? 'Independen / Umum',
            $orderItem->name ?? 'Tiket Reguler',
            $log ? $log->scan_time : 'Belum Hadir',
            $log && $log->checkout_time ? $log->checkout_time : '-',
            $log ? $log->method : '-',
            $surveyData ? $surveyData->rating : '-',
            $surveyData && $surveyData->speaker_rating ? $surveyData->speaker_rating : '-',
            $surveyData && $surveyData->material_rating ? $surveyData->material_rating : '-',
            $surveyData && $surveyData->comments ? $surveyData->comments : '-'
        ];

        if ($surveyData) {
            foreach ($this->questions as $q) {
                $ans = $surveyData->answers->firstWhere('survey_question_id', $q->id);
                $row[] = $ans ? $ans->value : '-';
            }
        } else {
            foreach ($this->questions as $q) {
                $row[] = '-';
            }
        }

        return $row;
    }
}
