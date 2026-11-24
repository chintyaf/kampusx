<?php

namespace App\Http\Controllers\Api\LMS;

use App\Http\Controllers\Controller;
use App\Models\LearningPath;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use App\Services\ImageUploadService;

class LearningPathController extends Controller
{
    /**
     * Menampilkan seluruh Learning Path.
     */
    public function index(Request $request)
    {
        $query = LearningPath::with(['creator', 'event'])
            ->withCount(['modules', 'enrollments']);

        if ($request->filled('search')) {
            $search = $request->input('search');

            $query->where('title', 'like', "%{$search}%");
        }

        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }

        if ($request->filled('category')) {
            $category = $request->input('category');

            $query->where(function ($q) use ($category) {
                $q->where('category', $category)
                    ->orWhereJsonContains('categories', $category);
            });
        }

        $learningPaths = $query
            ->latest()
            ->paginate($this->perPage($request))
            ->withQueryString();

        return response()->json([
            'success' => true,
            'message' => 'Learning paths retrieved successfully.',
            'data' => $learningPaths,
        ]);
    }

    /**
     * Membuat Learning Path baru.
     */
    public function store(Request $request)
    {
        // created_by diambil dari user yang sedang login.
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthenticated.',
            ], 401);
        }

        // Mendukung categories dalam format JSON string
        // maupun array dari FormData.
        $this->prepareCategories($request);

        $validated = $request->validate([
            'event_id' => [
                'nullable',
                'exists:events,id',
            ],
            'title' => [
                'required',
                'string',
                'max:200',
            ],
            'description' => [
                'nullable',
                'string',
                'max:1000',
            ],
            'category' => [
                'nullable',
                'string',
                'max:100',
            ],
            'categories' => [
                'nullable',
                'array',
            ],
            'categories.*' => [
                'string',
                'max:100',
            ],
            'thumbnail' => $request->hasFile('thumbnail')
                ? 'image|mimes:jpeg,png,jpg,webp|max:2048'
                : 'nullable',
            'status' => [
                'nullable',
                Rule::in(['draft', 'published', 'archived']),
            ],
        ]);

        $validated = $this->normalizeCategories($validated);

        $validated['created_by'] = $user->id;
        $validated['status'] = $validated['status'] ?? 'draft';

        $validated['published_at'] =
            $validated['status'] === 'published'
                ? now()
                : null;

        if ($request->hasFile('thumbnail')) {
            $extension = $request->file('thumbnail')->getClientOriginalExtension();
            $fileName = "thumbnail_" . time() . "_" . uniqid() . ".{$extension}";
            $path = $request->file('thumbnail')->storeAs('lms/learning-path', $fileName, 'public');
            $validated['thumbnail'] = $path;
        } else {
            unset($validated['thumbnail']);
        }

        if (empty($validated['slug']) && !empty($validated['title'])) {
            $baseSlug = \Illuminate\Support\Str::slug($validated['title']);
            $slug = $baseSlug ?: 'lp-' . time();
            if (LearningPath::where('slug', $slug)->exists()) {
                $slug .= '-' . time();
            }
            $validated['slug'] = $slug;
        }

        $learningPath = LearningPath::create($validated);

        $learningPath
            ->load(['creator', 'event'])
            ->loadCount(['modules', 'enrollments']);

        return response()->json([
            'success' => true,
            'message' => 'Learning Path created successfully.',
            'data' => $learningPath,
        ], 201);
    }

    /**
     * Menampilkan detail Learning Path berdasarkan ID atau slug.
     */
    public function show(string $id)
    {
        $query = LearningPath::with([
            'creator',
            'event',
            'modules.lessons',
            'enrollments',
        ])->withCount([
            'modules',
            'enrollments',
        ]);

        if (is_numeric($id)) {
            $query->where(function ($q) use ($id) {
                $q->where('id', $id)
                    ->orWhere('slug', $id);
            });
        } else {
            $query->where('slug', $id);
        }

        $learningPath = $query->first();

        if (!$learningPath) {
            return response()->json([
                'success' => false,
                'message' => 'Learning Path not found.',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Learning Path retrieved successfully.',
            'data' => $learningPath,
        ]);
    }

    /**
     * Memperbarui Learning Path.
     */
    public function update(
        Request $request,
        string $id,
        ImageUploadService $imageService
    ) {
        $learningPath = LearningPath::find($id);

        if (!$learningPath) {
            return response()->json([
                'success' => false,
                'message' => 'Learning Path not found.',
            ], 404);
        }

        $this->prepareCategories($request);

        $validated = $request->validate([
            'event_id' => [
                'sometimes',
                'nullable',
                'exists:events,id',
            ],
            'title' => [
                'sometimes',
                'required',
                'string',
                'max:200',
            ],
            'description' => [
                'sometimes',
                'nullable',
                'string',
                'max:1000',
            ],
            'category' => [
                'sometimes',
                'nullable',
                'string',
                'max:100',
            ],
            'categories' => [
                'sometimes',
                'nullable',
                'array',
            ],
            'categories.*' => [
                'string',
                'max:100',
            ],
            'thumbnail' => $request->hasFile('thumbnail')
                ? 'image|mimes:jpeg,png,jpg,webp|max:2048'
                : 'nullable',
            'remove_thumbnail' => [
                'sometimes',
                'boolean',
            ],
            'status' => [
                'sometimes',
                'nullable',
                Rule::in(['draft', 'published', 'archived']),
            ],
        ]);

        $validated = $this->normalizeCategories($validated);

        $oldThumbnail = $learningPath->thumbnail;

        // Upload thumbnail baru / hapus thumbnail lama mirip EventGeneralInfoController
        if ($request->hasFile('thumbnail')) {
            if ($oldThumbnail && Storage::disk('public')->exists($oldThumbnail)) {
                Storage::disk('public')->delete($oldThumbnail);
            }

            $extension = $request->file('thumbnail')->getClientOriginalExtension();
            $fileName = "thumbnail_{$learningPath->id}_" . time() . "_" . uniqid() . ".{$extension}";
            $path = $request->file('thumbnail')->storeAs('lms/learning-path', $fileName, 'public');

            $validated['thumbnail'] = $path;
        } elseif ($request->boolean('remove_thumbnail')) {
            if ($oldThumbnail && Storage::disk('public')->exists($oldThumbnail)) {
                Storage::disk('public')->delete($oldThumbnail);
            }
            $validated['thumbnail'] = null;
        } else {
            unset($validated['thumbnail']);
        }

        // Atur published_at.
        if (array_key_exists('status', $validated)) {
            if ($validated['status'] === 'published') {
                $validated['published_at'] =
                    $learningPath->published_at ?? now();
            } elseif ($validated['status'] === 'draft') {
                $validated['published_at'] = null;
            }
        }

        unset($validated['remove_thumbnail']);

        $learningPath->update($validated);

        $learningPath
            ->load(['creator', 'event'])
            ->loadCount(['modules', 'enrollments']);

        return response()->json([
            'success' => true,
            'message' => 'Learning Path updated successfully.',
            'data' => $learningPath,
        ]);
    }

    /**
     * Menghapus Learning Path.
     */
    public function destroy(string $id)
    {
        $learningPath = LearningPath::find($id);

        if (!$learningPath) {
            return response()->json([
                'success' => false,
                'message' => 'Learning Path not found.',
            ], 404);
        }

        $this->deleteThumbnail($learningPath->thumbnail);

        $learningPath->delete();

        return response()->json([
            'success' => true,
            'message' => 'Learning Path deleted successfully.',
        ]);
    }

    /**
     * Menampilkan Learning Path milik Organizer yang sedang login.
     */
    public function organizerIndex(Request $request)
    {
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthenticated.',
            ], 401);
        }

        $query = LearningPath::with(['creator', 'event'])
            ->withCount(['modules', 'enrollments'])
            ->where('created_by', $user->id);

        if ($request->filled('search')) {
            $search = $request->input('search');

            $query->where('title', 'like', "%{$search}%");
        }

        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }

        $learningPaths = $query
            ->latest()
            ->paginate($this->perPage($request))
            ->withQueryString();

        return response()->json([
            'success' => true,
            'message' => 'Organizer Learning Paths retrieved successfully.',
            'data' => $learningPaths,
        ]);
    }

    /**
     * Mengubah categories JSON string menjadi array.
     *
     * Mendukung:
     * - categories = ["Programming", "Technology"]
     * - categories[0] = Programming
     * - categories = '["Programming","Technology"]'
     */
    private function prepareCategories(Request $request): void
    {
        $categories = $request->input('categories');

        if (is_string($categories)) {
            if (trim($categories) === '') {
                $request->merge([
                    'categories' => null,
                ]);

                return;
            }

            $decoded = json_decode($categories, true);

            if (json_last_error() === JSON_ERROR_NONE) {
                $request->merge([
                    'categories' => $decoded,
                ]);
            }
        }
    }

    /**
     * Membersihkan dan menyelaraskan kategori.
     */
    private function normalizeCategories(array $validated): array
    {
        if (!array_key_exists('categories', $validated)) {
            return $validated;
        }

        $categories = $validated['categories'] ?? [];

        $categories = array_map(
            fn ($category) => trim($category),
            $categories
        );

        $categories = array_filter(
            $categories,
            fn ($category) => $category !== ''
        );

        $categories = array_values(array_unique($categories));

        $validated['categories'] = $categories ?: null;

        // Kategori pertama digunakan sebagai kategori utama.
        $validated['category'] = $categories[0] ?? null;

        return $validated;
    }

    /**
     * Menghapus file thumbnail dari public storage.
     */
    private function deleteThumbnail(?string $thumbnail): void
    {
        if (!$thumbnail) {
            return;
        }

        // Jangan menghapus URL eksternal.
        if (
            str_starts_with($thumbnail, 'http://')
            || str_starts_with($thumbnail, 'https://')
        ) {
            return;
        }

        Storage::disk('public')->delete($thumbnail);
    }

    /**
     * Membatasi jumlah data per halaman.
     */
    private function perPage(Request $request): int
    {
        return min(
            max((int) $request->input('per_page', 10), 1),
            100
        );
    }
}
