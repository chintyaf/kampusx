<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Institution;
// use Illuminate\Http\Request;

class InstitutionController extends Controller
{
    public function index()
    {
        $institutions = Institution::select('id', 'name')->get();

        return response()->json([
            'success' => true,
            'message' => 'Daftar institusi berhasil diambil',
            'data'    => $institutions
        ], 200);
    }
}
