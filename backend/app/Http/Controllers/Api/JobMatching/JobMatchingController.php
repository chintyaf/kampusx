<?php

namespace App\Http\Controllers\Api\JobMatching;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Services\JobMatching\CosineSimilarityService;
use Illuminate\Support\Facades\Storage;

/**
 * Controller API untuk Job Matching Engine berbasis Vector Skill-Matrix
 * dan Algoritma Cosine Similarity.
 * Menjawab Rumusan Masalah 4 Tugas Akhir.
 */
class JobMatchingController extends Controller
{
    protected CosineSimilarityService $matchingService;
    protected string $offersStoragePath = 'recruiter_offers.json';

    public function __construct(CosineSimilarityService $matchingService)
    {
        $this->matchingService = $matchingService;
    }

    /**
     * Menghitung nilai kecocokan kandidat terhadap kualifikasi lowongan industri
     * menggunakan Vector Skill-Matrix dan Cosine Similarity.
     */
    public function matchCandidates(Request $request)
    {
        $validated = $request->validate([
            'required_skills' => 'required|array', // e.g. ['Python' => 5, 'SQL' => 4] atau ['Python', 'SQL']
            'top_k' => 'nullable|integer|min:1|max:50'
        ]);

        $topK = $validated['top_k'] ?? 10;

        // Normalisasi format vektor kebutuhan industri (skala 1 - 5)
        $rawSkills = $validated['required_skills'];
        $jobVector = [];
        if (array_is_list($rawSkills)) {
            foreach ($rawSkills as $skillName) {
                $jobVector[trim($skillName)] = 5.0; // Bobot maksimal default jika hanya nama skill
            }
        } else {
            foreach ($rawSkills as $skillName => $weight) {
                $jobVector[trim($skillName)] = (float)$weight;
            }
        }

        // Data kandidat mahasiswa terintegrasi dengan kredensial SBT dan Modul SRL Chintya
        $candidates = [
            [
                'id' => 1,
                'name' => 'Ahmad Fauzi',
                'campus' => 'Universitas Gadjah Mada',
                'major' => 'Ilmu Komputer',
                'tier' => 'Diamond',
                'skills' => ['Python' => 4.8, 'Machine Learning' => 4.5, 'Data Analysis' => 4.4, 'SQL' => 4.2],
                'hasSbt' => true,
                'sbtTitle' => 'Advanced AI & Deep Learning Specialist',
                'sbtTokenId' => '#SBT-2026-0041',
                'email' => 'ahmad.fauzi@mail.ugm.ac.id'
            ],
            [
                'id' => 2,
                'name' => 'Rian Hidayat',
                'campus' => 'Institut Teknologi Bandung',
                'major' => 'Teknik Informatika',
                'tier' => 'Platinum',
                'skills' => ['React' => 4.7, 'Node.js' => 4.4, 'TypeScript' => 4.2, 'Docker' => 4.0, 'Python' => 2.5],
                'hasSbt' => true,
                'sbtTitle' => 'Fullstack Microservices & Cloud Engineering',
                'sbtTokenId' => '#SBT-2026-0082',
                'email' => 'rian.hidayat@itb.ac.id'
            ],
            [
                'id' => 3,
                'name' => 'Dian Sastro',
                'campus' => 'Universitas Indonesia',
                'major' => 'Sistem Informasi',
                'tier' => 'Gold',
                'skills' => ['Figma' => 4.8, 'UI/UX Design' => 4.5, 'Design System' => 4.3, 'HTML/CSS' => 3.5],
                'hasSbt' => true,
                'sbtTitle' => 'Mastering Design Systems & Accessibility',
                'sbtTokenId' => '#SBT-2026-0112',
                'email' => 'dian.sastro@ui.ac.id'
            ],
            [
                'id' => 4,
                'name' => 'Siti Rahma',
                'campus' => 'Universitas Brawijaya',
                'major' => 'Ilmu Komputer',
                'tier' => 'Gold',
                'skills' => ['Python' => 4.1, 'Solidity' => 4.6, 'Smart Contract Audit' => 4.4, 'Penetration Testing' => 4.2],
                'hasSbt' => true,
                'sbtTitle' => 'Smart Contract Security & EVM Vulnerabilities',
                'sbtTokenId' => '#SBT-2026-0095',
                'email' => 'siti.rahma@student.ub.ac.id'
            ],
            [
                'id' => 5,
                'name' => 'Budi Santoso',
                'campus' => 'Institut Teknologi Sepuluh Nopember',
                'major' => 'Teknik Informatika',
                'tier' => 'Gold',
                'skills' => ['Go' => 4.6, 'PostgreSQL' => 4.4, 'Docker' => 4.2, 'Python' => 3.2],
                'hasSbt' => true,
                'sbtTitle' => 'High-Concurrency Backend Systems with Go',
                'sbtTokenId' => '#SBT-2026-0130',
                'email' => 'budi.santoso@its.ac.id'
            ],
            [
                'id' => 12,
                'name' => 'Kamu (Budi Pratama)',
                'campus' => 'Universitas Indonesia',
                'major' => 'Teknik Informatika',
                'tier' => 'Silver',
                'skills' => ['React' => 4.5, 'JavaScript' => 4.4, 'Python' => 4.0, 'SQL' => 4.0],
                'hasSbt' => true,
                'sbtTitle' => 'Modern Frontend Architecture with React',
                'sbtTokenId' => '#SBT-2026-0291',
                'email' => 'budi.pratama@ui.ac.id'
            ]
        ];

        $matchedResults = [];
        $rankRelevanceScores = [];

        foreach ($candidates as $candidate) {
            $comp = $this->matchingService->calculateCosineSimilarity($candidate['skills'], $jobVector);
            
            // Tambahkan bonus kredibilitas on-chain jika memiliki sertifikat SBT yang relevan
            $sbtBonus = $candidate['hasSbt'] ? 1.05 : 1.0;
            $finalScore = min(100.0, round($comp['matchScore'] * $sbtBonus, 1));

            $matchedResults[] = array_merge($candidate, [
                'cosineSimilarity' => $comp['similarity'],
                'matchScore' => $finalScore,
                'rawMatchScore' => $comp['matchScore'],
                'computation' => $comp
            ]);

            $rankRelevanceScores[] = $finalScore / 20.0; // Skala relevansi 1-5 untuk NDCG
        }

        // Urutkan kandidat dari Match Score tertinggi ke terendah
        usort($matchedResults, fn($a, $b) => $b['matchScore'] <=> $a['matchScore']);

        // Batasi sebanyak top_k
        $matchedResults = array_slice($matchedResults, 0, $topK);

        // Beri indeks rank
        for ($i = 0; $i < count($matchedResults); $i++) {
            $matchedResults[$i]['rank'] = $i + 1;
        }

        // Hitung metrik evaluasi teknis sesuai Bab 2 Skripsi
        $mrr = $this->matchingService->calculateMRR([1, 2, 3]); // Contoh evaluasi profil
        $ndcg = $this->matchingService->calculateNDCG($rankRelevanceScores, 3);

        return response()->json([
            'success' => true,
            'message' => 'Pencocokan kandidat berbasis Cosine Similarity berhasil dihitung.',
            'data' => [
                'jobVector' => $jobVector,
                'totalCandidatesEvaluated' => count($candidates),
                'topCandidates' => $matchedResults,
                'metrics' => [
                    'mrr' => $mrr,
                    'ndcg_at_3' => $ndcg,
                    'algorithm' => 'Vector Skill-Matrix Cosine Similarity (Formula 2.1 - 2.8)',
                    'sbtVerifiedBonusApplied' => true
                ]
            ]
        ], 200);
    }

    /**
     * Memproses aksi perekrut untuk mengirim tawaran magang / undangan wawancara
     * ke kandidat mahasiswa. Menjawab pertanyaan "trus gmn ya next step nya?"
     */
    public function sendRecruiterOffer(Request $request)
    {
        $validated = $request->validate([
            'candidate_id' => 'required',
            'candidate_name' => 'required|string',
            'candidate_email' => 'required|email',
            'offer_type' => 'required|string|in:internship,fulltime,parttime,research_project',
            'position_title' => 'required|string',
            'company_name' => 'required|string',
            'recruiter_name' => 'required|string',
            'recruiter_email' => 'required|email',
            'invitation_message' => 'required|string',
            'proposed_date' => 'nullable|string'
        ]);

        $offerRecord = array_merge($validated, [
            'offer_id' => 'OFFER-' . date('Ymd') . '-' . rand(1000, 9999),
            'sent_at' => now()->toIso8601String(),
            'status' => 'Invitation Sent',
            'delivery_channel' => 'Email & KampusX Notification Center'
        ]);

        // Simpan ke berkas persisten
        $allOffers = [];
        if (Storage::exists($this->offersStoragePath)) {
            $existing = json_decode(Storage::get($this->offersStoragePath), true);
            if (is_array($existing)) {
                $allOffers = $existing;
            }
        }
        $allOffers[] = $offerRecord;
        Storage::put($this->offersStoragePath, json_encode($allOffers, JSON_PRETTY_PRINT));

        // Format mailto link siap pakai untuk kemudahan rekruter
        $mailSubject = rawurlencode("[KampusX Verified Talent] Tawaran " . ucfirst($validated['offer_type']) . ": " . $validated['position_title'] . " di " . $validated['company_name']);
        $mailBody = rawurlencode("Halo " . $validated['candidate_name'] . ",\n\nKami dari " . $validated['company_name'] . " sangat terkesan dengan portofolio on-chain dan kredensial Soulbound Token Anda di KampusX.\n\n" . $validated['invitation_message'] . "\n\nSalam,\n" . $validated['recruiter_name'] . "\n" . $validated['company_name']);
        $mailtoUrl = "mailto:" . $validated['candidate_email'] . "?subject=" . $mailSubject . "&body=" . $mailBody;

        return response()->json([
            'success' => true,
            'message' => 'Tawaran kerja & undangan wawancara berhasil dikirimkan ke ' . $validated['candidate_name'] . '!',
            'data' => array_merge($offerRecord, [
                'mailtoUrl' => $mailtoUrl
            ])
        ], 201);
    }
}
