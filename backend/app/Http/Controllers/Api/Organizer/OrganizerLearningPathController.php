<?php

namespace App\Http\Controllers\Api\Organizer;

use App\Http\Controllers\Controller;
use App\Models\LearningPath;
use App\Models\Module;
use App\Models\Lesson;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class OrganizerLearningPathController extends Controller
{
    /**
     * Tampilkan daftar Learning Path milik Organizer.
     */
    public function index(Request $request)
    {
        $user = $request->user();

        $query = LearningPath::query()
            ->withCount(['modules', 'lessons', 'enrollments'])
            ->with(['event:id,title']);

        // Organizer hanya melihat karyanya sendiri, Admin bisa melihat semua
        if ($user->role !== 'admin') {
            $query->where('created_by', $user->id);
        }

        // Filter status
        if ($request->filled('status') && strtolower($request->status) !== 'all') {
            $query->where('status', strtolower($request->status));
        }

        // Filter kategori
        if ($request->filled('category')) {
            $query->where('category', 'like', '%' . $request->category . '%');
        }

        // Pencarian (search)
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%")
                  ->orWhere('category', 'like', "%{$search}%");
            });
        }

        $query->orderBy('created_at', 'desc');

        // Pagination atau ambil semua jika per_page = 'all' atau 0
        $perPage = $request->query('per_page', 10);
        if ($perPage === 'all' || (int)$perPage === 0) {
            $learningPaths = $query->get();
        } else {
            $learningPaths = $query->paginate((int)$perPage);
        }

        return response()->json([
            'success' => true,
            'message' => 'Daftar Learning Path berhasil diambil.',
            'data' => $learningPaths,
        ], 200);
    }

    /**
     * Buat Learning Path baru.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:200',
            'description' => 'nullable|string',
            'category' => 'nullable|string|max:100',
            'categories' => 'nullable',
            'thumbnail' => 'nullable',
            'status' => 'nullable|in:draft,published,archived',
            'event_id' => 'nullable|exists:events,id',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi gagal.',
                'errors' => $validator->errors(),
            ], 422);
        }

        $data = $validator->validated();
        $data['created_by'] = $request->user()->id;
        $data['status'] = $data['status'] ?? 'draft';

        // Proses kategori (bisa array atau string JSON)
        if ($request->has('categories')) {
            $rawCategories = $request->input('categories');
            if (is_string($rawCategories)) {
                $decoded = json_decode($rawCategories, true);
                $data['categories'] = json_last_error() === JSON_ERROR_NONE ? $decoded : [$rawCategories];
            } elseif (is_array($rawCategories)) {
                $data['categories'] = $rawCategories;
            }
            if (empty($data['category']) && !empty($data['categories'])) {
                $data['category'] = is_array($data['categories']) ? $data['categories'][0] : (string)$data['categories'];
            }
        }

        // Upload file thumbnail jika dikirim via multipart/form-data
        if ($request->hasFile('thumbnail') && $request->file('thumbnail')->isValid()) {
            $path = $request->file('thumbnail')->store('thumbnails/learning-paths', 'public');
            $data['thumbnail'] = $path;
        } elseif ($request->hasFile('cover') && $request->file('cover')->isValid()) {
            $path = $request->file('cover')->store('thumbnails/learning-paths', 'public');
            $data['thumbnail'] = $path;
        }

        $learningPath = LearningPath::create($data);

        return response()->json([
            'success' => true,
            'message' => 'Learning Path berhasil dibuat.',
            'data' => $learningPath->load(['creator:id,name,email', 'event:id,title']),
        ], 201);
    }

    /**
     * Tampilkan detail Learning Path beserta kurikulum (modul & lesson).
     */
    public function show(Request $request, $id)
    {
        $learningPath = LearningPath::with([
            'creator:id,name,email',
            'event:id,title',
            'modules' => function ($query) {
                $query->orderBy('order_index', 'asc')
                      ->with([
                          'lessons' => function ($lq) {
                              $lq->orderBy('order_index', 'asc')->with('skills');
                          },
                          'quizzes.questions.options',
                      ]);
            },
        ])
        ->withCount(['modules', 'lessons', 'enrollments'])
        ->find($id);

        if (!$learningPath) {
            return response()->json([
                'success' => false,
                'message' => 'Learning Path tidak ditemukan.',
            ], 404);
        }

        // Cek hak akses jika bukan admin atau pembuat
        $user = $request->user();
        if ($user && $user->role !== 'admin' && $learningPath->created_by !== $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'Anda tidak memiliki akses ke Learning Path ini.',
            ], 403);
        }

        return response()->json([
            'success' => true,
            'message' => 'Detail Learning Path berhasil dimuat.',
            'data' => $learningPath,
        ], 200);
    }

    /**
     * Perbarui data Learning Path.
     */
    public function update(Request $request, $id)
    {
        $learningPath = LearningPath::find($id);

        if (!$learningPath) {
            return response()->json([
                'success' => false,
                'message' => 'Learning Path tidak ditemukan.',
            ], 404);
        }

        $user = $request->user();
        if ($user->role !== 'admin' && $learningPath->created_by !== $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'Anda tidak memiliki hak untuk mengubah Learning Path ini.',
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'title' => 'sometimes|required|string|max:200',
            'description' => 'nullable|string',
            'category' => 'nullable|string|max:100',
            'categories' => 'nullable',
            'thumbnail' => 'nullable',
            'status' => 'nullable|in:draft,published,archived',
            'event_id' => 'nullable|exists:events,id',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi gagal.',
                'errors' => $validator->errors(),
            ], 422);
        }

        $data = $validator->validated();

        // Kategori
        if ($request->has('categories')) {
            $rawCategories = $request->input('categories');
            if (is_string($rawCategories)) {
                $decoded = json_decode($rawCategories, true);
                $data['categories'] = json_last_error() === JSON_ERROR_NONE ? $decoded : [$rawCategories];
            } elseif (is_array($rawCategories)) {
                $data['categories'] = $rawCategories;
            }
            if (empty($data['category']) && !empty($data['categories'])) {
                $data['category'] = is_array($data['categories']) ? $data['categories'][0] : (string)$data['categories'];
            }
        }

        // Upload thumbnail baru jika ada
        if ($request->hasFile('thumbnail') && $request->file('thumbnail')->isValid()) {
            if ($learningPath->thumbnail && Storage::disk('public')->exists($learningPath->thumbnail)) {
                Storage::disk('public')->delete($learningPath->thumbnail);
            }
            $data['thumbnail'] = $request->file('thumbnail')->store('thumbnails/learning-paths', 'public');
        } elseif ($request->hasFile('cover') && $request->file('cover')->isValid()) {
            if ($learningPath->thumbnail && Storage::disk('public')->exists($learningPath->thumbnail)) {
                Storage::disk('public')->delete($learningPath->thumbnail);
            }
            $data['thumbnail'] = $request->file('cover')->store('thumbnails/learning-paths', 'public');
        }

        $learningPath->update($data);

        return response()->json([
            'success' => true,
            'message' => 'Learning Path berhasil diperbarui.',
            'data' => $learningPath->fresh(['creator:id,name,email', 'event:id,title']),
        ], 200);
    }

    /**
     * Hapus Learning Path.
     */
    public function destroy(Request $request, $id)
    {
        $learningPath = LearningPath::find($id);

        if (!$learningPath) {
            return response()->json([
                'success' => false,
                'message' => 'Learning Path tidak ditemukan.',
            ], 404);
        }

        $user = $request->user();
        if ($user->role !== 'admin' && $learningPath->created_by !== $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'Anda tidak memiliki hak untuk menghapus Learning Path ini.',
            ], 403);
        }

        if ($learningPath->thumbnail && Storage::disk('public')->exists($learningPath->thumbnail)) {
            Storage::disk('public')->delete($learningPath->thumbnail);
        }

        $learningPath->delete();

        return response()->json([
            'success' => true,
            'message' => 'Learning Path berhasil dihapus.',
        ], 200);
    }

    /**
     * Simpan struktur Kurikulum secara massal (Modules & Lessons) dari UI CurriculumTab.
     */
    public function saveCurriculum(Request $request, $id)
    {
        $learningPath = LearningPath::find($id);

        if (!$learningPath) {
            return response()->json([
                'success' => false,
                'message' => 'Learning Path tidak ditemukan.',
            ], 404);
        }

        $user = $request->user();
        if ($user->role !== 'admin' && $learningPath->created_by !== $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'Anda tidak memiliki hak untuk mengubah kurikulum ini.',
            ], 403);
        }

        $request->validate([
            'modules' => 'required|array',
        ]);

        DB::beginTransaction();
        try {
            foreach ($request->modules as $modIndex => $modData) {
                // Update atau buat module
                $moduleId = $modData['id'] ?? null;
                $module = null;

                if ($moduleId && is_numeric($moduleId)) {
                    $module = Module::where('learning_path_id', $learningPath->id)->find($moduleId);
                }

                if (!$module) {
                    $module = new Module();
                    $module->learning_path_id = $learningPath->id;
                }

                $module->title = $modData['name'] ?? $modData['title'] ?? ('Modul ' . ($modIndex + 1));
                $module->order_index = $modIndex + 1;
                if (isset($modData['description'])) {
                    $module->description = $modData['description'];
                }
                if (isset($modData['difficulty_level'])) {
                    $module->difficulty_level = $modData['difficulty_level'];
                }
                $module->save();

                // Simpan item (lessons/quizzes) dalam modul jika ada
                if (!empty($modData['items']) && is_array($modData['items'])) {
                    foreach ($modData['items'] as $itemIndex => $itemData) {
                        $itemId = $itemData['id'] ?? null;
                        $itemType = $itemData['type'] ?? 'lesson';

                        if ($itemType === 'lesson') {
                            $lesson = null;
                            if ($itemId && is_numeric($itemId)) {
                                $lesson = Lesson::where('module_id', $module->id)->find($itemId);
                            }
                            if (!$lesson) {
                                $lesson = new Lesson();
                                $lesson->module_id = $module->id;
                            }

                            $lesson->title = $itemData['title'] ?? ('Lesson ' . ($itemIndex + 1));
                            $lesson->order_index = $itemIndex + 1;
                            $lesson->duration_minutes = $itemData['minutes'] ?? $itemData['duration_minutes'] ?? $lesson->duration_minutes ?? 5;
                            $lesson->type = $itemData['format'] ?? $itemData['type'] ?? 'article';
                            $lesson->save();
                        }
                    }
                }
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Kurikulum berhasil disimpan.',
                'data' => $learningPath->fresh(['modules.lessons']),
            ], 200);
        } catch (\Throwable $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Gagal menyimpan kurikulum: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Endpoint publik/learner: List Learning Path yang berstatus published
     */
    public function publicIndex(Request $request)
    {
        $query = LearningPath::query()
            ->where('status', 'published')
            ->withCount(['modules', 'lessons', 'enrollments'])
            ->with(['creator:id,name', 'event:id,title']);

        if ($request->filled('category')) {
            $query->where('category', $request->category);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        return response()->json([
            'success' => true,
            'data' => $query->latest()->paginate(12),
        ], 200);
    }

    /**
     * Endpoint publik/learner: Detail Learning Path
     */
    public function publicShow($id)
    {
        $learningPath = LearningPath::with([
            'creator:id,name',
            'event:id,title',
            'modules' => function ($query) {
                $query->where('status', 'published')
                      ->orderBy('order_index', 'asc')
                      ->with([
                          'lessons' => function ($lq) {
                              $lq->where('status', 'published')
                                 ->orderBy('order_index', 'asc')
                                 ->with('skills');
                          },
                          'quizzes',
                      ]);
            },
        ])
        ->withCount(['modules', 'lessons', 'enrollments'])
        ->where('status', 'published')
        ->find($id);

        if (!$learningPath) {
            return response()->json([
                'success' => false,
                'message' => 'Learning Path tidak ditemukan atau belum dipublikasikan.',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $learningPath,
        ], 200);
    }
}

