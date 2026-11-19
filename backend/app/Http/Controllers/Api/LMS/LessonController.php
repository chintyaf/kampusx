<?php

namespace App\Http\Controllers\Api\LMS;

use App\Http\Controllers\Controller;
use App\Models\Lesson;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;

class LessonController extends Controller
{
    public function index(Request $request)
    {
        $query = Lesson::with(['module'])
            ->withCount(['skills']);

        if ($request->filled('module_id')) {
            $query->where('module_id', $request->module_id);
        }

        if ($request->filled('search')) {
            $query->where('title', 'like', '%' . $request->search . '%');
        }

        if ($request->filled('type')) {
            $query->where('type', $request->type);
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $lessons = $query
            ->orderBy('order_index')
            ->paginate($request->input('per_page', 10));

        return response()->json([
            'success' => true,
            'message' => 'Lessons retrieved successfully.',
            'data' => $lessons,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'module_id' => ['required', 'exists:modules,id'],
            'title' => ['required', 'string', 'max:200'],
            'type' => ['required', 'string', 'max:50'],
            'content' => ['nullable', 'string'],
            'summary' => ['nullable', 'string'],
            'order_index' => ['nullable', 'integer', 'min:1'],
            'duration_minutes' => ['nullable', 'integer', 'min:0', 'max:65535'],
            'xp' => ['nullable', 'integer', 'min:0'],
            'video_url' => ['nullable', 'url', 'max:500'],
            'attachments' => ['nullable', 'array'],
            'attachments.*' => ['file', 'max:10240'],
            'status' => ['nullable', Rule::in(['draft', 'published'])],

            'skills' => ['nullable', 'array'],
            'skills.*.skill_id' => ['required', 'exists:skills,id'],
            'skills.*.relevance_weight' => ['nullable', 'numeric', 'min:0', 'max:1'],
        ]);

        $attachmentData = [];

        if ($request->hasFile('attachments')) {
            foreach ($request->file('attachments') as $file) {
                $path = $file->store('lessons/attachments', 'public');

                $attachmentData[] = [
                    'name' => $file->getClientOriginalName(),
                    'path' => $path,
                    'mime_type' => $file->getMimeType(),
                    'size' => $file->getSize(),
                ];
            }
        }

        $lesson = Lesson::create([
            'module_id' => $validated['module_id'],
            'title' => $validated['title'],
            'type' => $validated['type'],
            'content' => $validated['content'] ?? null,
            'summary' => $validated['summary'] ?? null,
            'order_index' => $validated['order_index'] ?? 1,
            'duration_minutes' => $validated['duration_minutes'] ?? 0,
            'xp' => $validated['xp'] ?? 0,
            'video_url' => $validated['video_url'] ?? null,
            'attachments' => $attachmentData,
            'status' => $validated['status'] ?? 'published',
        ]);

        if (!empty($validated['skills'])) {
            $this->syncSkills($lesson, $validated['skills']);
        }

        return response()->json([
            'success' => true,
            'message' => 'Lesson created successfully.',
            'data' => $lesson->load(['module', 'skills']),
        ], 201);
    }

    public function show(string $id)
    {
        $lesson = Lesson::with([
            'module.learningPath',
            'skills',
            'quiz.questions.options',
        ])->withCount(['skills'])->findOrFail($id);

        return response()->json([
            'success' => true,
            'message' => 'Lesson retrieved successfully.',
            'data' => $lesson,
        ]);
    }

    public function update(Request $request, string $id)
    {
        $lesson = Lesson::findOrFail($id);

        $validated = $request->validate([
            'module_id' => ['sometimes', 'required', 'exists:modules,id'],
            'title' => ['sometimes', 'required', 'string', 'max:200'],
            'type' => ['sometimes', 'required', 'string', 'max:50'],
            'content' => ['nullable', 'string'],
            'summary' => ['nullable', 'string'],
            'order_index' => ['sometimes', 'integer', 'min:1'],
            'duration_minutes' => ['sometimes', 'integer', 'min:0', 'max:65535'],
            'xp' => ['sometimes', 'integer', 'min:0'],
            'video_url' => ['nullable', 'url', 'max:500'],
            'status' => ['sometimes', Rule::in(['draft', 'published'])],

            'remove_attachments' => ['nullable', 'array'],
            'remove_attachments.*' => ['integer', 'min:0'],

            'attachments' => ['nullable', 'array'],
            'attachments.*' => ['file', 'max:10240'],

            'skills' => ['sometimes', 'array'],
            'skills.*.skill_id' => ['required', 'exists:skills,id'],
            'skills.*.relevance_weight' => ['nullable', 'numeric', 'min:0', 'max:1'],
        ]);

        $lesson->fill(collect($validated)->except([
            'attachments',
            'remove_attachments',
            'skills',
        ])->toArray());

        $attachmentData = $lesson->attachments ?? [];

        // Remove selected attachments by their array indexes.
        if (!empty($validated['remove_attachments'])) {
            foreach ($validated['remove_attachments'] as $index) {
                if (isset($attachmentData[$index]['path'])) {
                    Storage::disk('public')->delete(
                        $attachmentData[$index]['path']
                    );
                }

                unset($attachmentData[$index]);
            }

            $attachmentData = array_values($attachmentData);
        }

        // Append newly uploaded attachments.
        if ($request->hasFile('attachments')) {
            foreach ($request->file('attachments') as $file) {
                $path = $file->store('lessons/attachments', 'public');

                $attachmentData[] = [
                    'name' => $file->getClientOriginalName(),
                    'path' => $path,
                    'mime_type' => $file->getMimeType(),
                    'size' => $file->getSize(),
                ];
            }
        }

        $lesson->attachments = $attachmentData;
        $lesson->save();

        // If skills is provided, replace the existing skill relations.
        if (array_key_exists('skills', $validated)) {
            $this->syncSkills($lesson, $validated['skills'] ?? []);
        }

        return response()->json([
            'success' => true,
            'message' => 'Lesson updated successfully.',
            'data' => $lesson->fresh()->load(['module', 'skills']),
        ]);
    }

    public function destroy(string $id)
    {
        $lesson = Lesson::findOrFail($id);

        // Delete attachment files from public storage.
        foreach ($lesson->attachments ?? [] as $attachment) {
            if (!empty($attachment['path'])) {
                Storage::disk('public')->delete($attachment['path']);
            }
        }

        $lesson->delete();

        return response()->json([
            'success' => true,
            'message' => 'Lesson deleted successfully.',
        ]);
    }

    /**
     * Synchronize skills and their relevance weights.
     */
    private function syncSkills(Lesson $lesson, array $skills): void
    {
        $syncData = [];

        foreach ($skills as $skill) {
            $syncData[$skill['skill_id']] = [
                'relevance_weight' => $skill['relevance_weight'] ?? 1.00,
            ];
        }

        $lesson->skills()->sync($syncData);
    }
}
