<?php

namespace App\Http\Controllers\Api\Organizer;

use App\Http\Controllers\Controller;
use App\Models\LearningPath;
use App\Models\Module;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class OrganizerModuleController extends Controller
{
    /**
     * Daftar Modul dalam satu Learning Path.
     */
    public function index(Request $request, $learningPathId)
    {
        $learningPath = LearningPath::find($learningPathId);
        if (!$learningPath) {
            return response()->json([
                'success' => false,
                'message' => 'Learning Path tidak ditemukan.',
            ], 404);
        }

        $modules = Module::where('learning_path_id', $learningPathId)
            ->withCount('lessons')
            ->with(['lessons' => function ($q) {
                $q->orderBy('order_index', 'asc');
            }, 'quizzes'])
            ->orderBy('order_index', 'asc')
            ->get();

        return response()->json([
            'success' => true,
            'message' => 'Daftar modul berhasil dimuat.',
            'data' => $modules,
        ], 200);
    }

    /**
     * Buat Modul baru dalam Learning Path.
     */
    public function store(Request $request, $learningPathId)
    {
        $learningPath = LearningPath::find($learningPathId);
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
                'message' => 'Anda tidak memiliki hak untuk menambah modul pada Learning Path ini.',
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:200',
            'description' => 'nullable|string',
            'learning_outcomes' => 'nullable',
            'difficulty_level' => 'nullable|in:beginner,intermediate,advanced',
            'order_index' => 'nullable|integer',
            'status' => 'nullable|in:draft,published',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi gagal.',
                'errors' => $validator->errors(),
            ], 422);
        }

        $data = $validator->validated();
        $data['learning_path_id'] = $learningPath->id;

        // Auto hitung order_index jika belum disediakan
        if (!isset($data['order_index'])) {
            $maxOrder = Module::where('learning_path_id', $learningPathId)->max('order_index') ?? 0;
            $data['order_index'] = $maxOrder + 1;
        }

        // Handle learning outcomes jika berupa string JSON
        if (isset($data['learning_outcomes']) && is_string($data['learning_outcomes'])) {
            $decoded = json_decode($data['learning_outcomes'], true);
            $data['learning_outcomes'] = json_last_error() === JSON_ERROR_NONE ? $decoded : [$data['learning_outcomes']];
        }

        $module = Module::create($data);

        return response()->json([
            'success' => true,
            'message' => 'Modul berhasil dibuat.',
            'data' => $module->load('lessons'),
        ], 201);
    }

    /**
     * Tampilkan detail Modul beserta Lessons & Quizzes.
     */
    public function show(Request $request, $id)
    {
        $module = Module::with([
            'learningPath:id,title,created_by',
            'lessons' => function ($q) {
                $q->orderBy('order_index', 'asc')->with('skills');
            },
            'quizzes.questions.options',
        ])
        ->withCount('lessons')
        ->find($id);

        if (!$module) {
            return response()->json([
                'success' => false,
                'message' => 'Modul tidak ditemukan.',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Detail modul berhasil dimuat.',
            'data' => $module,
        ], 200);
    }

    /**
     * Perbarui data Modul.
     */
    public function update(Request $request, $id)
    {
        $module = Module::with('learningPath')->find($id);
        if (!$module) {
            return response()->json([
                'success' => false,
                'message' => 'Modul tidak ditemukan.',
            ], 404);
        }

        $user = $request->user();
        if ($user->role !== 'admin' && $module->learningPath && $module->learningPath->created_by !== $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'Anda tidak memiliki hak untuk mengubah modul ini.',
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'title' => 'sometimes|required|string|max:200',
            'description' => 'nullable|string',
            'learning_outcomes' => 'nullable',
            'difficulty_level' => 'nullable|in:beginner,intermediate,advanced',
            'order_index' => 'nullable|integer',
            'status' => 'nullable|in:draft,published',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi gagal.',
                'errors' => $validator->errors(),
            ], 422);
        }

        $data = $validator->validated();

        if (isset($data['learning_outcomes']) && is_string($data['learning_outcomes'])) {
            $decoded = json_decode($data['learning_outcomes'], true);
            $data['learning_outcomes'] = json_last_error() === JSON_ERROR_NONE ? $decoded : [$data['learning_outcomes']];
        }

        $module->update($data);

        return response()->json([
            'success' => true,
            'message' => 'Modul berhasil diperbarui.',
            'data' => $module->fresh(['lessons', 'quizzes']),
        ], 200);
    }

    /**
     * Hapus Modul.
     */
    public function destroy(Request $request, $id)
    {
        $module = Module::with('learningPath')->find($id);
        if (!$module) {
            return response()->json([
                'success' => false,
                'message' => 'Modul tidak ditemukan.',
            ], 404);
        }

        $user = $request->user();
        if ($user->role !== 'admin' && $module->learningPath && $module->learningPath->created_by !== $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'Anda tidak memiliki hak untuk menghapus modul ini.',
            ], 403);
        }

        $module->delete();

        return response()->json([
            'success' => true,
            'message' => 'Modul berhasil dihapus.',
        ], 200);
    }

    /**
     * Urutkan ulang Modul dalam suatu Learning Path.
     */
    public function reorder(Request $request, $learningPathId)
    {
        $request->validate([
            'modules' => 'required|array',
            'modules.*.id' => 'required|exists:modules,id',
            'modules.*.order_index' => 'required|integer',
        ]);

        DB::beginTransaction();
        try {
            foreach ($request->modules as $item) {
                Module::where('id', $item['id'])
                    ->where('learning_path_id', $learningPathId)
                    ->update(['order_index' => $item['order_index']]);
            }
            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Urutan modul berhasil diperbarui.',
            ], 200);
        } catch (\Throwable $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengubah urutan modul: ' . $e->getMessage(),
            ], 500);
        }
    }
}

