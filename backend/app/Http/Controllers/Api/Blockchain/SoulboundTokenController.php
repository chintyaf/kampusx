<?php

namespace App\Http\Controllers\Api\Blockchain;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Services\Blockchain\SoulboundTokenService;

/**
 * Controller API untuk Smart Contract Soulbound Token (SBT) & Verifikasi On-Chain
 * Menjawab Rumusan Masalah 2 & Integrasi Modul AI SRL Chintya.
 */
class SoulboundTokenController extends Controller
{
    protected SoulboundTokenService $sbtService;

    public function __construct(SoulboundTokenService $sbtService)
    {
        $this->sbtService = $sbtService;
    }

    /**
     * Menerima payload RESTful API trigger dari modul AI SRL (Chintya)
     * saat mahasiswa lulus modul pembelajaran microlearning.
     * Sesuai Alur Gambar 2.3 dan Tabel 2.1 di Skripsi.
     */
    public function triggerMint(Request $request)
    {
        $validated = $request->validate([
            'user_id' => 'required',
            'modul_id' => 'required',
            'score' => 'required|numeric',
            'status_lulus' => 'required|boolean',
            'student_name' => 'nullable|string',
            'wallet_address' => 'nullable|string',
            'title' => 'nullable|string',
            'skill_category' => 'nullable|string'
        ]);

        if (!$validated['status_lulus'] || $validated['score'] < 80) {
            return response()->json([
                'success' => false,
                'status' => 'rejected',
                'message' => 'Mahasiswa belum mencapai passing grade kelulusan modul SRL (minimal 80/100). Minting SBT dibatalkan.'
            ], 422);
        }

        // 1. Eksekusi penerbitan Soulbound Token ke jaringan Polygon
        $receipt = $this->sbtService->mintSoulboundToken($validated);

        // 2. Berikan respon sukses sesuai spesifikasi payload skripsi
        return response()->json([
            'success' => true,
            'status' => 'confirmed',
            'message' => 'Kredensial Soulbound Token (ERC-5192) berhasil diterbitkan ke jaringan Polygon Ledger!',
            'data' => [
                'tokenId' => $receipt['tokenId'],
                'ticketCode' => $receipt['ticketCode'],
                'txHash' => $receipt['txHash'],
                'blockNumber' => $receipt['blockNumber'],
                'confirmations' => $receipt['confirmations'],
                'contractAddress' => $receipt['contractAddress'],
                'network' => SoulboundTokenService::NETWORK_NAME,
                'isLocked' => true,
                'standard' => $receipt['standard'],
                'gasUsed' => $receipt['gasUsed'],
                'explorerUrl' => url('/blockchain/explorer/tx/' . $receipt['txHash']),
                'polygonscanExternal' => 'https://amoy.polygonscan.com/tx/' . $receipt['txHash'],
                'studentName' => $receipt['studentName'],
                'studentWallet' => $receipt['studentWallet'],
                'title' => $receipt['title'],
                'skillCategory' => $receipt['skillCategory'],
                'cognitiveScore' => $receipt['cognitiveScore'],
                'mintedDate' => $receipt['mintedDate']
            ]
        ], 201);
    }

    /**
     * Endpoint Publik Verifikasi Zero-Trust Kredensial On-Chain
     * Dapat dipanggil oleh siapa saja tanpa autentikasi / login.
     */
    public function verify(Request $request, string $identifier)
    {
        $token = $this->sbtService->verifyCredential($identifier);

        if (!$token) {
            return response()->json([
                'success' => false,
                'status' => 'not_found',
                'message' => 'Kredensial Soulbound Token dengan identifier tersebut tidak ditemukan di Polygon Ledger.'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'status' => 'verified_onchain',
            'message' => 'Kredensial terverifikasi sah secara kriptografis di jaringan Polygon POS!',
            'data' => array_merge($token, [
                'network' => SoulboundTokenService::NETWORK_NAME,
                'explorerUrl' => url('/blockchain/explorer/tx/' . $token['txHash']),
                'polygonscanExternal' => 'https://amoy.polygonscan.com/tx/' . $token['txHash']
            ])
        ], 200);
    }

    /**
     * Mengambil detail transaksi spesifik untuk halaman Polygonscan Explorer
     */
    public function getPolygonscanData(Request $request, string $txHash)
    {
        $token = $this->sbtService->verifyCredential($txHash);

        if (!$token) {
            return response()->json([
                'success' => false,
                'message' => 'Transaction Hash not found on Polygon Amoy Ledger.'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => [
                'txHash' => $token['txHash'],
                'status' => 'Success',
                'blockNumber' => $token['blockNumber'],
                'confirmations' => $token['confirmations'] ?? 142,
                'timestamp' => $token['mintedDate'],
                'from' => $token['minterAddress'] ?? SoulboundTokenService::MINTER_ADDRESS,
                'to' => $token['contractAddress'] ?? SoulboundTokenService::CONTRACT_ADDRESS,
                'interactedWith' => 'KampusXSoulboundToken (ERC-5192)',
                'tokensMinted' => [
                    'standard' => 'ERC-5192',
                    'tokenId' => $token['tokenId'],
                    'ticketCode' => $token['ticketCode'],
                    'recipient' => $token['studentWallet'],
                    'recipientName' => $token['studentName'],
                    'title' => $token['title'],
                    'skillCategory' => $token['skillCategory'] ?? 'Technology',
                    'cognitiveScore' => $token['cognitiveScore'] ?? 95,
                    'isLocked' => true
                ],
                'value' => '0 POL (0 MATIC)',
                'transactionFee' => '0.0024 POL',
                'gasPrice' => ($token['gasPriceGwei'] ?? 28.5) . ' Gwei',
                'gasUsed' => $token['gasUsed'] ?? 84219,
                'gasLimit' => 120000,
                'nonce' => 41,
                'rawTokenURI' => $token['tokenURI'] ?? 'ipfs://bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi/token.json'
            ]
        ], 200);
    }
}
