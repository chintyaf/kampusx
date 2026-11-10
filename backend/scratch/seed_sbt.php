<?php

require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\User;
use App\Models\SoulboundToken;
use Illuminate\Support\Facades\Hash;

// 1. Ensure Ahmad Fauzi exists in users table
$user = User::firstOrCreate(
    ['email' => 'ahmad.fauzi@mail.ugm.ac.id'],
    [
        'name' => 'Ahmad Fauzi',
        'password' => Hash::make('password123'),
        'role' => 'participant'
    ]
);

echo "User ID: " . $user->id . " Name: " . $user->name . "\n";

// 2. Insert or update the SoulboundToken for CERT-2026-0041 with exact on-chain data
$sbt = SoulboundToken::updateOrCreate(
    ['ticket_code' => 'CERT-2026-0041'],
    [
        'user_id' => $user->id,
        'token_id' => '#SBT-2026-0041',
        'title' => 'National AI & Deep Learning Specialist Summit 2026',
        'issuer' => 'KampusX Verified Authority & GDSC Indonesia',
        'tx_hash' => '0x4c1413dd81bfd856bdc0fd8cdc174c757e55a3c2d9cd9cfda88c61adae3f272d',
        'contract_address' => '0xc0eA36D5bbd3056682Fd8a9EBB06015Eb00bCaA5',
        'wallet_address' => '0x3a4b98F12c09Ad6E9b7E185c899d214C718b89Fc',
        'block_number' => '51351780',
        'standard' => 'ERC-5192 (Soulbound / Non-Transferable)',
        'cognitive_score' => 98,
        'skill_category' => 'Python & Machine Learning',
        'token_uri' => 'ipfs://bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi/metadata-0041.json',
        'status' => 'active',
        'minted_at' => '2026-10-28 14:30:18',
    ]
);

echo "SBT ID: " . $sbt->id . " Ticket: " . $sbt->ticket_code . " Tx: " . $sbt->tx_hash . " Contract: " . $sbt->contract_address . "\n";

// Also seed Rian Hidayat, Dian Sastro, and Siti Rahma for completeness
$userRian = User::firstOrCreate(
    ['email' => 'rian.hidayat@itb.ac.id'],
    ['name' => 'Rian Hidayat', 'password' => Hash::make('password123'), 'role' => 'participant']
);
SoulboundToken::updateOrCreate(
    ['ticket_code' => 'CERT-2026-0082'],
    [
        'user_id' => $userRian->id,
        'token_id' => '#SBT-2026-0082',
        'title' => 'Fullstack Microservices & Cloud Engineering Workshop',
        'issuer' => 'KampusX Verified Credentials & ITB Informatics',
        'tx_hash' => '0x53e1a902cbb3918a4d701e4a68291b29a674510b65f419c832e0192847aef921',
        'contract_address' => '0xc0eA36D5bbd3056682Fd8a9EBB06015Eb00bCaA5',
        'wallet_address' => '0x7b1298E12c09Ad6E9b7E185c899d214C718b44d9',
        'block_number' => '51350412',
        'standard' => 'ERC-5192 (Soulbound / Non-Transferable)',
        'cognitive_score' => 96,
        'skill_category' => 'React & Node.js',
        'minted_at' => '2026-09-22 16:45:00',
    ]
);

echo "Seeded successfully!\n";
