<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // =====================================================
        // 1. PROFIL JOB MATCHING MEMBER (opt-in visibilitas ke recruiter)
        //    Member yang mengontrol apakah datanya boleh ditemukan.
        // =====================================================
        Schema::create('member_job_profiles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete()->unique();

            $table->boolean('is_discoverable')->default(false);   // opt-in: boleh dicari recruiter
            $table->string('headline', 200)->nullable();
            $table->text('bio')->nullable();
            $table->enum('availability', ['open', 'internship_only', 'not_available'])->default('open');
            $table->timestamps();

            $table->index(['is_discoverable', 'availability']);
        });

        // =====================================================
        // 1b. SKILL YANG DILATIH OLEH EVENT
        //     Dipakai untuk menambah skor skill member dari riwayat kehadiran
        //     (attendance_logs). Setara dengan lesson_skills, tapi untuk event.
        // =====================================================
        Schema::create('event_skills', function (Blueprint $table) {
            $table->id();
            $table->foreignId('event_id')->constrained()->cascadeOnDelete();
            $table->foreignId('skill_id')->constrained()->cascadeOnDelete();
            $table->decimal('relevance_weight', 5, 2)->default(1);
            $table->timestamps();

            $table->unique(['event_id', 'skill_id'], 'event_skills_event_skill_unique');
            $table->index('skill_id');
        });

        // =====================================================
        // 2. VEKTOR SKILL MEMBER (baris matriks member x skill)
        //    Format sparse: satu baris per (user, skill).
        //    Kolom matriks = skills.id, nilai sel = proficiency_score.
        //    Hasil agregasi lesson_skills x learning_completions x quiz_attempts.
        // =====================================================
        Schema::create('user_skill_scores', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('skill_id')->constrained()->cascadeOnDelete();

            $table->decimal('proficiency_score', 6, 5)->default(0);       // ternormalisasi 0-1
            $table->unsignedTinyInteger('proficiency_level')->default(0); // level 0-5 (turunan skor)

            // Jejak bukti perhitungan
            $table->unsignedSmallInteger('lessons_completed')->default(0);
            $table->unsignedSmallInteger('quizzes_taken')->default(0);
            $table->unsignedSmallInteger('events_attended')->default(0);
            $table->decimal('avg_quiz_score', 5, 2)->nullable();
            $table->json('evidence')->nullable(); // contoh: {"lesson_ids":[1,2],"quiz_attempt_ids":[5]}

            $table->string('model_version', 100)->default('v1');
            $table->timestamp('calculated_at');
            $table->timestamps();

            $table->unique(['user_id', 'skill_id'], 'user_skill_scores_user_skill_unique');
            $table->index(['user_id', 'proficiency_score']);
            $table->index('skill_id');
        });

        // =====================================================
        // 3. PENCARIAN KANDIDAT OLEH RECRUITER (header)
        //    Recruiter = guest (tanpa akun). Akses ke pencarian dikontrol
        //    lewat token rahasia yang hanya diberikan sekali saat pencarian dibuat.
        // =====================================================
        Schema::create('job_searches', function (Blueprint $table) {
            $table->id();
            // Identitas recruiter (guest)
            $table->string('recruiter_name', 150);
            $table->string('recruiter_email', 150);
            $table->string('company_name', 200)->nullable();
            $table->char('access_token_hash', 64)->unique(); // sha256 dari token yang diberikan ke recruiter

            $table->foreignId('event_id')->nullable()->constrained('events')->nullOnDelete();

            $table->string('title', 200);               // contoh: "Backend Developer Intern"
            $table->text('description')->nullable();
            $table->unsignedSmallInteger('needed_count')->default(1);
            $table->decimal('min_similarity', 5, 4)->default(0.5); // ambang batas kandidat ditampilkan
            $table->enum('status', ['draft', 'active', 'closed'])->default('active');
            $table->timestamp('last_matched_at')->nullable();
            $table->timestamps();

            $table->index('recruiter_email');
            $table->index('status');
        });

        // =====================================================
        // 4. VEKTOR KEBUTUHAN RECRUITER (baris matriks pencarian x skill)
        // =====================================================
        Schema::create('job_search_skills', function (Blueprint $table) {
            $table->id();
            $table->foreignId('job_search_id')->constrained('job_searches')->cascadeOnDelete();
            $table->foreignId('skill_id')->constrained()->cascadeOnDelete();

            $table->decimal('importance_weight', 5, 4)->default(1);    // bobot kepentingan 0-1
            $table->unsignedTinyInteger('required_level')->default(1); // level minimal 1-5
            $table->boolean('is_mandatory')->default(false);
            $table->timestamps();

            $table->unique(['job_search_id', 'skill_id'], 'job_search_skills_unique');
            $table->index('skill_id');
        });

        // =====================================================
        // 5. SHORTLIST RECRUITER
        //    Hasil matching TIDAK disimpan: dihitung on-the-fly (cosine similarity)
        //    dan dikembalikan sebagai JSON oleh API. Hanya kandidat yang
        //    di-shortlist/dihubungi yang disimpan, beserta snapshot alasannya.
        // =====================================================
        Schema::create('job_shortlists', function (Blueprint $table) {
            $table->id();
            $table->foreignId('job_search_id')->constrained('job_searches')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();

            $table->enum('status', ['shortlisted', 'contacted', 'rejected'])->default('shortlisted');
            $table->timestamp('contacted_at')->nullable();
            $table->text('note')->nullable();

            // Snapshot saat recruiter menyimpan kandidat (skor member bisa berubah kemudian)
            $table->decimal('cosine_similarity', 6, 5);
            $table->decimal('skill_coverage', 5, 2)->nullable();
            $table->json('matched_skills')->nullable(); // [{skill_id, user_score, required_weight}]
            $table->json('missing_skills')->nullable();
            $table->string('model_version', 100)->default('v1');
            $table->timestamp('snapshot_at');
            $table->timestamps();

            $table->unique(['job_search_id', 'user_id'], 'job_shortlists_search_user_unique');
            $table->index(['job_search_id', 'status']);
            $table->index(['user_id', 'status']);
        });
    }

    public function down(): void
    {
        // Drop dari child ke parent
        Schema::dropIfExists('job_shortlists');
        Schema::dropIfExists('job_search_skills');
        Schema::dropIfExists('job_searches');
        Schema::dropIfExists('user_skill_scores');
        Schema::dropIfExists('event_skills');
        Schema::dropIfExists('member_job_profiles');
    }
};
