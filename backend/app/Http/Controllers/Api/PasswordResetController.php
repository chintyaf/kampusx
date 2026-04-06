<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use App\Models\User;
use App\Mail\ResetPasswordOtpMail;
use Carbon\Carbon;

class PasswordResetController extends Controller
{
    // Tahap 1: Mengirim OTP ke Email
    public function sendOtp(Request $request)
    {
        $request->validate([
            'email' => 'required|email|exists:users,email',
        ], [
            'email.exists' => 'Email tidak terdaftar di sistem kami.'
        ]);

        // Buat 6 digit angka acak
        $otp = rand(100000, 999999);

        // Simpan/Update ke database
        DB::table('password_reset_otps')->updateOrInsert(
            ['email' => $request->email],
            [
                'otp' => $otp,
                'created_at' => Carbon::now()
            ]
        );

        // Kirim email
        Mail::to($request->email)->send(new ResetPasswordOtpMail($otp));

        return response()->json([
            'status' => true,
            'message' => 'Kode OTP berhasil dikirim ke email Anda.'
        ], 200);
    }

    public function verifyOtp(Request $request)
    {
        $request->validate([
            'email' => 'required|email|exists:users,email',
            'otp' => 'required|digits:6',
        ]);

        $resetRequest = DB::table('password_reset_otps')->where([
            ['email', '=', $request->email],
            ['otp', '=', $request->otp],
        ])->first();

        if (!$resetRequest) {
            return response()->json([
                'status' => false,
                'message' => 'Kode OTP salah atau tidak valid.'
            ], 400);
        }

        $createdAt = Carbon::parse($resetRequest->created_at);
        if (Carbon::now()->diffInMinutes($createdAt) > 15) {
            return response()->json([
                'status' => false,
                'message' => 'Kode OTP sudah kedaluwarsa. Silakan minta ulang.'
            ], 400);
        }

        return response()->json([
            'status' => true,
            'message' => 'OTP Valid!'
        ], 200);
    }
    
    // Tahap 2: Verifikasi OTP & Update Password
    public function resetPassword(Request $request)
    {
        $request->validate([
            'email' => 'required|email|exists:users,email',
            'otp' => 'required|digits:6',
            'password' => 'required|min:6', // Kamu bisa tambahkan rule 'confirmed' kalau ada konfirmasi password
        ]);

        $resetRequest = DB::table('password_reset_otps')->where([
            ['email', '=', $request->email],
            ['otp', '=', $request->otp],
        ])->first();

        // Cek apakah OTP ada
        if (!$resetRequest) {
            return response()->json([
                'status' => false,
                'message' => 'Kode OTP salah atau tidak valid.'
            ], 400);
        }

        // Cek kedaluwarsa (misal: 15 menit)
        $createdAt = Carbon::parse($resetRequest->created_at);
        if (Carbon::now()->diffInMinutes($createdAt) > 15) {
            // Hapus OTP yang kedaluwarsa
            DB::table('password_reset_otps')->where('email', $request->email)->delete();
            
            return response()->json([
                'status' => false,
                'message' => 'Kode OTP sudah kedaluwarsa. Silakan minta ulang.'
            ], 400);
        }

        // Update password user
        $user = User::where('email', $request->email)->first();
        $user->password = Hash::make($request->password);
        $user->save();

        // Hapus OTP dari database karena sudah selesai dipakai
        DB::table('password_reset_otps')->where('email', $request->email)->delete();

        return response()->json([
            'status' => true,
            'message' => 'Password berhasil diubah!'
        ], 200);
    }
}