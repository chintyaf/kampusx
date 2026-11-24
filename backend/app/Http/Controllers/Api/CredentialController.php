<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\SoulboundToken;
use App\Models\User;
use App\Services\Blockchain\SoulboundTokenService;
use Illuminate\Support\Str;
use Carbon\Carbon;

class CredentialController extends Controller
{
    protected SoulboundTokenService $sbtService;

    public function __construct(SoulboundTokenService $sbtService)
    {
        $this->sbtService = $sbtService;
    }

    protected function getActiveUser(Request $request): User
    {
        $user = $request->user() ?: auth('sanctum')->user();
        if (!$user) {
            $user = User::where('email', 'part@kampusx.com')->first()
                ?: User::where('role', 'participant')->first();
        }

        if (!$user) {
            $user = User::first();
        }

        return $user;
    }

    /**
     * GET /api/credentials
     * Halaman Credential Management (Admin / Issuer)
     */
    public function index(Request $request)
    {
        $status = $request->query('status');
        $query = SoulboundToken::with('user')->orderBy('created_at', 'desc');

        if ($status) {
            $query->where('minting_status', strtoupper($status));
        }

        $credentials = $query->paginate(15);

        $mapped = collect($credentials->items())->map(function ($sbt) {
            return $this->sbtService->formatCredentialResponse($sbt);
        });

        return response()->json([
            'success' => true,
            'message' => 'Daftar kredensial berhasil dimuat.',
            'data'    => $mapped,
            'meta'    => [
                'current_page' => $credentials->currentPage(),
                'last_page'    => $credentials->lastPage(),
                'total'        => $credentials->total(),
            ]
        ], 200);
    }

    /**
     * POST /api/credentials
     * Admin membuat kredensial baru secara manual
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'user_id'         => 'required|exists:users,id',
            'title'           => 'required|string|max:255',
            'skill_category'  => 'required|string',
            'cognitive_score' => 'required|numeric|min:0|max:100',
            'issuer'          => 'nullable|string',
        ]);

        $user = User::findOrFail($validated['user_id']);
        $rawNum = rand(100, 999);
        $ticketCode = 'CERT-' . date('Y') . '-' . str_pad($rawNum, 4, '0', STR_PAD_LEFT);
        $tokenId = '#SBT-' . date('Y') . '-' . str_pad($rawNum, 4, '0', STR_PAD_LEFT);
        $userWallet = '0x' . substr(hash('sha256', $user->email . 'wallet_seed'), 0, 40);

        $sbt = SoulboundToken::create([
            'user_id'          => $user->id,
            'credential_code'  => $ticketCode,
            'ticket_code'      => $ticketCode,
            'token_id'         => $tokenId,
            'title'            => $validated['title'],
            'issuer'           => $validated['issuer'] ?? 'KampusX Verified Authority & Academic Center',
            'contract_address' => SoulboundTokenService::CONTRACT_ADDRESS,
            'wallet_address'   => $userWallet,
            'standard'         => 'ERC-5192 (Soulbound / Non-Transferable)',
            'cognitive_score'  => (int) $validated['cognitive_score'],
            'skill_category'   => $validated['skill_category'],
            'token_uri'        => 'ipfs://bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi/token-' . $rawNum . '.json',
            'minting_status'   => 'PENDING',
            'status'           => 'active',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Kredensial berhasil dibuat dengan status PENDING. Siap untuk proses minting SBT.',
            'data'    => $this->sbtService->formatCredentialResponse($sbt),
        ], 201);
    }

    /**
     * GET /api/credentials/{id}
     */
    public function show(int $id)
    {
        $credential = SoulboundToken::with('user')->findOrFail($id);

        return response()->json([
            'success' => true,
            'data'    => $this->sbtService->formatCredentialResponse($credential),
        ], 200);
    }

    /**
     * GET /api/credentials/{id}/preview
     * Menampilkan preview data sertifikat sebelum minting
     */
    public function preview(int $id)
    {
        $credential = SoulboundToken::with('user')->findOrFail($id);

        return response()->json([
            'success' => true,
            'message' => 'Preview sertifikat siap ditampilkan.',
            'data'    => $this->sbtService->formatCredentialResponse($credential),
        ], 200);
    }

    /**
     * POST /api/credentials/{id}/mint
     * Eksekusi pencetakan Soulbound Token (ERC-5192) ke jaringan Polygon
     */
    public function mint(Request $request, int $id)
    {
        $credential = SoulboundToken::with('user')->findOrFail($id);

        // Jika transaksi gagal sebelumnya, izinkan retry
        $credential->update(['minting_status' => 'MINTING']);

        $result = $this->sbtService->mintCredential($credential);

        return response()->json($result, 200);
    }

    /**
     * POST /api/credentials/{id}/retry
     * Tombol Retry Minting jika gagal
     */
    public function retry(Request $request, int $id)
    {
        return $this->mint($request, $id);
    }

    /**
     * POST /api/credentials/{id}/revoke
     * Pencabutan kredensial on-chain
     */
    public function revoke(Request $request, int $id)
    {
        $reason = $request->input('reason', 'Pencabutan kredensial oleh otoritas penerbit.');
        $result = $this->sbtService->revokeCredential($id, $reason);

        return response()->json($result, 200);
    }

    /**
     * GET /api/public/credentials/{credential_code}/verify
     * Endpoint Publik Verifikasi Zero-Trust (Bisa dibuka tanpa login)
     */
    public function publicVerify(string $credential_code)
    {
        $result = $this->sbtService->verifyCredential($credential_code);

        $httpStatus = ($result['verification_status'] === 'NOT_FOUND') ? 404 : 200;

        return response()->json([
            'success'             => $result['is_valid'],
            'verification_status' => $result['verification_status'],
            'message'             => $result['message'],
            'data'                => $result['details'],
        ], $httpStatus);
    }

    /**
     * GET /api/my-portfolio
     * Mahasiswa melihat portofolio digital seluruh sertifikat SBT yang dimiliki
     */
    public function myPortfolio(Request $request)
    {
        $user = $this->getActiveUser($request);

        $tokens = SoulboundToken::where('user_id', $user->id)
            ->where('minting_status', 'MINTED')
            ->orderBy('minted_at', 'desc')
            ->get();

        $mapped = $tokens->map(fn($t) => $this->sbtService->formatCredentialResponse($t));

        return response()->json([
            'success' => true,
            'message' => 'Portofolio digital Soulbound Token mahasiswa berhasil dimuat.',
            'data'    => [
                'student'      => [
                    'id'     => $user->id,
                    'name'   => $user->name,
                    'email'  => $user->email,
                    'tier'   => $user->tier ?? $user->calculateTier(),
                    'points' => (int) $user->points,
                ],
                'certificates' => $mapped,
                'total'        => $mapped->count(),
            ]
        ], 200);
    }
}
