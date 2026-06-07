<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Http\Request;

class ConversionRuleController extends Controller
{
    /**
     * Retrieve the conversion ratio.
     */
    public function index()
    {
        $setting = Setting::where('key', 'local_to_global_ratio')->first();

        // Default ratio is 10 if not set yet
        $ratio = $setting ? (int) $setting->value : 10;

        return response()->json([
            'success' => true,
            'data' => [
                'key' => 'local_to_global_ratio',
                'value' => $ratio,
                'description' => 'Rasio konversi dari poin Lokal ke poin Global (e.g. 10 Local = 1 Global)'
            ]
        ], 200);
    }

    /**
     * Update/Set the conversion ratio.
     */
    public function update(Request $request)
    {
        $request->validate([
            'ratio' => 'required|integer|min:1',
        ]);

        try {
            $setting = Setting::updateOrCreate(
                ['key' => 'local_to_global_ratio'],
                ['value' => (string) $request->input('ratio')]
            );

            return response()->json([
                'success' => true,
                'message' => 'Rasio konversi berhasil diperbarui.',
                'data' => [
                    'key' => 'local_to_global_ratio',
                    'value' => (int) $setting->value,
                ]
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal memperbarui rasio konversi: ' . $e->getMessage()
            ], 500);
        }
    }
}
