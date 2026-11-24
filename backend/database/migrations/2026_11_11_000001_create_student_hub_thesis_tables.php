<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. GAMIFICATION BADGES
        if (!Schema::hasTable('badges')) {
            Schema::create('badges', function (Blueprint $table) {
                $table->id();
                $table->string('code')->unique(); // e.g. FIRST_STEP, ACTIVE_STUDENT
                $table->string('name');
                $table->text('description');
                $table->string('criteria'); // Syarat mendapatkan
                $table->string('icon')->nullable(); // Lucide icon name or image path
                $table->integer('points_requirement')->default(0);
                $table->string('category')->default('event'); // event, microlearning, quiz
                $table->boolean('is_active')->default(true);
                $table->timestamps();
            });
        }

        // Pivot: student_badges
        if (!Schema::hasTable('student_badges')) {
            Schema::create('student_badges', function (Blueprint $table) {
                $table->id();
                $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
                $table->foreignId('badge_id')->constrained('badges')->onDelete('cascade');
                $table->timestamp('unlocked_at')->useCurrent();
                $table->unique(['user_id', 'badge_id']);
                $table->timestamps();
            });
        }

        // 2. REWARD DECISION ENGINE TABLES
        if (!Schema::hasTable('rewards_catalog')) {
            Schema::create('rewards_catalog', function (Blueprint $table) {
                $table->id();
                $table->string('code')->unique(); // e.g. REWARD_DISCOUNT_10
                $table->string('name');
                $table->text('description');
                $table->enum('reward_type', ['ticket_discount', 'bonus_points', 'exclusive_access']);
                $table->decimal('reward_value', 10, 2); // e.g. 10.00 (percent) or 50.00 (points)
                $table->integer('quota')->default(50);
                $table->integer('remaining_quota')->default(50);
                $table->decimal('cost_budget', 12, 2)->default(0); // Cost in IDR for the organizer/system
                $table->boolean('is_active')->default(true);
                $table->timestamps();
            });
        }

        if (!Schema::hasTable('reward_decision_logs')) {
            Schema::create('reward_decision_logs', function (Blueprint $table) {
                $table->id();
                $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
                $table->unsignedBigInteger('event_id')->nullable();
                $table->foreignId('reward_id')->nullable()->constrained('rewards_catalog')->onDelete('set null');
                $table->string('selected_arm'); // e.g. DISCOUNT_10, DISCOUNT_20, BONUS_50, BONUS_100, EXCLUSIVE_ACCESS
                $table->string('algorithm')->default('Contextual Bandit (Thompson Sampling)');
                $table->json('context_used'); // User tier, points, event count, ticket count, previous claims
                $table->json('thompson_samples'); // Sample score per arm
                $table->json('disco_constraints'); // Budget check, quota check, feasibility
                $table->text('decision_reason'); // Dynamic generated explanation
                $table->enum('allocation_status', ['allocated', 'rejected_budget', 'rejected_quota', 'claimed', 'expired'])->default('allocated');
                $table->timestamp('decided_at')->useCurrent();
                $table->timestamps();
            });
        }

        if (!Schema::hasTable('reward_feedbacks')) {
            Schema::create('reward_feedbacks', function (Blueprint $table) {
                $table->id();
                $table->foreignId('decision_log_id')->constrained('reward_decision_logs')->onDelete('cascade');
                $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
                $table->string('action'); // 'claimed', 'used_in_checkout', 'dismissed'
                $table->boolean('is_converted')->default(false); // Success outcome for Beta-Bernoulli update
                $table->timestamp('feedback_at')->useCurrent();
                $table->unique(['decision_log_id', 'action']); // Prevent duplicate feedback updates
                $table->timestamps();
            });
        }

        // 3. INTEGRATION LOGS & EXTERNAL ACHIEVEMENTS (AI SRL Trigger)
        if (!Schema::hasTable('external_achievements')) {
            Schema::create('external_achievements', function (Blueprint $table) {
                $table->id();
                $table->string('external_reference')->unique(); // e.g. SRL-2026-001 (Idempotent)
                $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
                $table->string('achievement_type'); // e.g. MICROLEARNING_COMPLETION, QUIZ_EXCELLENCE
                $table->string('achievement_name');
                $table->text('description')->nullable();
                $table->decimal('score', 5, 2)->default(0);
                $table->integer('points_awarded')->default(0);
                $table->timestamp('completed_at')->nullable();
                $table->timestamps();
            });
        }

        if (!Schema::hasTable('integration_logs')) {
            Schema::create('integration_logs', function (Blueprint $table) {
                $table->id();
                $table->string('external_reference')->index();
                $table->foreignId('user_id')->nullable()->constrained('users')->onDelete('set null');
                $table->string('source_system')->default('AI-SRL-Engine');
                $table->string('endpoint');
                $table->json('request_payload');
                $table->string('status'); // SUCCESS, REJECTED, DUPLICATE, FAILED
                $table->text('processing_result')->nullable();
                $table->integer('points_result')->default(0);
                $table->string('credential_status')->nullable(); // PENDING, MINTED, NONE
                $table->unsignedBigInteger('credential_id')->nullable();
                $table->timestamps();
            });
        }

        // 4. EVENT SEATS (Redis Seat-Locking visual support)
        if (!Schema::hasTable('event_seats')) {
            Schema::create('event_seats', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('event_id')->index();
                $table->string('seat_number'); // e.g. A1, A2, B1, etc.
                $table->enum('status', ['AVAILABLE', 'RESERVED', 'BOOKED'])->default('AVAILABLE');
                $table->foreignId('locked_by_user_id')->nullable()->constrained('users')->onDelete('set null');
                $table->string('lock_token')->nullable();
                $table->timestamp('locked_until')->nullable();
                $table->unique(['event_id', 'seat_number']);
                $table->timestamps();
            });
        }

        // 5. Enhance soulbound_tokens table with revocation & minting status if missing
        Schema::table('soulbound_tokens', function (Blueprint $table) {
            if (!Schema::hasColumn('soulbound_tokens', 'minting_status')) {
                $table->enum('minting_status', ['PENDING', 'MINTING', 'MINTED', 'FAILED'])->default('MINTED')->after('status');
            }
            if (!Schema::hasColumn('soulbound_tokens', 'is_revoked')) {
                $table->boolean('is_revoked')->default(false)->after('minting_status');
            }
            if (!Schema::hasColumn('soulbound_tokens', 'revocation_reason')) {
                $table->string('revocation_reason')->nullable()->after('is_revoked');
            }
            if (!Schema::hasColumn('soulbound_tokens', 'revoked_at')) {
                $table->timestamp('revoked_at')->nullable()->after('revocation_reason');
            }
            if (!Schema::hasColumn('soulbound_tokens', 'credential_code')) {
                $table->string('credential_code')->nullable()->index()->after('ticket_code');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('event_seats');
        Schema::dropIfExists('integration_logs');
        Schema::dropIfExists('external_achievements');
        Schema::dropIfExists('reward_feedbacks');
        Schema::dropIfExists('reward_decision_logs');
        Schema::dropIfExists('rewards_catalog');
        Schema::dropIfExists('student_badges');
        Schema::dropIfExists('badges');

        Schema::table('soulbound_tokens', function (Blueprint $table) {
            if (Schema::hasColumn('soulbound_tokens', 'minting_status')) {
                $table->dropColumn('minting_status');
            }
            if (Schema::hasColumn('soulbound_tokens', 'is_revoked')) {
                $table->dropColumn('is_revoked');
            }
            if (Schema::hasColumn('soulbound_tokens', 'revocation_reason')) {
                $table->dropColumn('revocation_reason');
            }
            if (Schema::hasColumn('soulbound_tokens', 'revoked_at')) {
                $table->dropColumn('revoked_at');
            }
            if (Schema::hasColumn('soulbound_tokens', 'credential_code')) {
                $table->dropColumn('credential_code');
            }
        });
    }
};
