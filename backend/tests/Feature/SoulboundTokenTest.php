<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use App\Models\SoulboundToken;
use App\Services\Blockchain\SoulboundTokenService;
use Illuminate\Foundation\Testing\DatabaseTransactions;

class SoulboundTokenTest extends TestCase
{
    use DatabaseTransactions;

    protected User $student;
    protected SoulboundTokenService $sbtService;

    protected function setUp(): void
    {
        parent::setUp();
        $this->sbtService = app(SoulboundTokenService::class);

        $this->student = User::firstOrCreate(
            ['email' => 'test.student.sbt@example.com'],
            [
                'name'     => 'Test Student SBT',
                'password' => bcrypt('password'),
                'role'     => 'participant',
                'points'   => 1200,
                'tier'     => 'Platinum',
            ]
        );
    }

    public function test_issue_sbt_and_verify_erc5192_locked_status()
    {
        // 1. Buat kredensial status PENDING
        $rawNum = rand(100, 999);
        $ticketCode = 'CERT-TEST-' . $rawNum;

        $sbt = SoulboundToken::create([
            'user_id'          => $this->student->id,
            'credential_code'  => $ticketCode,
            'ticket_code'      => $ticketCode,
            'token_id'         => '#SBT-TEST-' . $rawNum,
            'title'            => 'Mastering Smart Contracts & Web3 Security',
            'issuer'           => 'KampusX Verified Authority',
            'contract_address' => SoulboundTokenService::CONTRACT_ADDRESS,
            'standard'         => 'ERC-5192 (Soulbound / Non-Transferable)',
            'cognitive_score'  => 98,
            'skill_category'   => 'Blockchain',
            'minting_status'   => 'PENDING',
        ]);

        // 2. Jalankan minting
        $mintRes = $this->sbtService->mintCredential($sbt);
        $this->assertTrue($mintRes['success']);
        $this->assertEquals('minted', $mintRes['status']);
        $this->assertNotEmpty($sbt->fresh()->tx_hash);
        $this->assertEquals('MINTED', $sbt->fresh()->minting_status);

        // 3. Verifikasi Zero-Trust on-chain publik
        $verifyRes = $this->sbtService->verifyCredential($ticketCode);
        $this->assertTrue($verifyRes['is_valid']);
        $this->assertEquals('VERIFIED', $verifyRes['verification_status']);
        $this->assertTrue($verifyRes['details']['is_locked']); // ERC-5192 locked must be true!
        $this->assertEquals(SoulboundTokenService::CONTRACT_ADDRESS, $verifyRes['details']['contract_address']);
        $this->assertEquals(80002, $verifyRes['details']['chain_id']);
    }

    public function test_revocation_marks_credential_as_revoked()
    {
        $ticketCode = 'CERT-REVOKE-' . rand(100, 999);
        $sbt = SoulboundToken::create([
            'user_id'          => $this->student->id,
            'credential_code'  => $ticketCode,
            'ticket_code'      => $ticketCode,
            'token_id'         => '#SBT-REVOKE-' . rand(100, 999),
            'title'            => 'Revocation Test Credential',
            'contract_address' => SoulboundTokenService::CONTRACT_ADDRESS,
            'minting_status'   => 'MINTED',
            'tx_hash'          => '0x' . hash('sha256', 'revoke_test'),
        ]);

        // Lakukan pencabutan
        $this->sbtService->revokeCredential($sbt->id, 'Pelanggaran etika penelitian.');

        // Verifikasi publik harus menghasilkan status REVOKED
        $verifyRes = $this->sbtService->verifyCredential($ticketCode);
        $this->assertFalse($verifyRes['is_valid']);
        $this->assertEquals('REVOKED', $verifyRes['verification_status']);
    }

    public function test_public_verify_endpoint()
    {
        $ticketCode = 'CERT-PUB-' . rand(100, 999);
        SoulboundToken::create([
            'user_id'          => $this->student->id,
            'credential_code'  => $ticketCode,
            'ticket_code'      => $ticketCode,
            'token_id'         => '#SBT-PUB-' . rand(100, 999),
            'title'            => 'Public Verifier Endpoint Test',
            'contract_address' => SoulboundTokenService::CONTRACT_ADDRESS,
            'minting_status'   => 'MINTED',
            'tx_hash'          => '0x' . hash('sha256', 'pub_test'),
        ]);

        $response = $this->getJson("/api/public/credentials/{$ticketCode}/verify");

        $response->assertStatus(200);
        $response->assertJson([
            'success'             => true,
            'verification_status' => 'VERIFIED',
        ]);
    }
}
