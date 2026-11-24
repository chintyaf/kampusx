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
        // 1. Talent Profiles (1-to-1 dengan users atau profil mahasiswa talenta)
        Schema::create('talent_profiles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade')->unique();
            $table->string('headline')->nullable();
            $table->string('campus')->nullable();
            $table->string('major')->nullable();
            $table->enum('tier', ['Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond'])->default('Bronze');
            $table->string('avatar_bg')->nullable()->default('#fef3c7');
            $table->string('avatar_color')->nullable()->default('#92400e');
            $table->text('bio')->nullable();
            $table->string('wallet_address')->nullable();
            $table->string('specialization')->nullable(); // DATA, ENGINEERING, DESIGN, BUSINESS, etc.
            $table->unsignedInteger('modules_completed')->default(0);
            $table->unsignedInteger('events_attended')->default(0);
            $table->unsignedInteger('sbt_count')->default(0);
            $table->boolean('is_public')->default(true);
            $table->boolean('is_open_to_work')->default(true);
            $table->timestamps();

            $table->index(['campus', 'specialization', 'tier']);
        });

        // 2. Talent Skills (Matrix keahlian talenta dengan persentase kemahiran)
        Schema::create('talent_skills', function (Blueprint $table) {
            $table->id();
            $table->foreignId('talent_profile_id')->constrained('talent_profiles')->onDelete('cascade');
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('skill_id')->nullable()->constrained('skills')->onDelete('set null');
            $table->string('name');
            $table->unsignedTinyInteger('level')->default(80); // 1 - 100%
            $table->string('category')->nullable(); // Data, Engineering, Design, dll.
            $table->timestamps();

            $table->index(['talent_profile_id', 'name']);
            $table->index(['user_id', 'name']);
        });

        // 3. Soulbound Tokens (SBT) / On-Chain Verifiable Credentials (ERC-5192)
        Schema::create('sbt_credentials', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('talent_profile_id')->nullable()->constrained('talent_profiles')->onDelete('set null');
            $table->foreignId('certificate_id')->nullable()->constrained('lms_user_certificates')->onDelete('set null');
            $table->string('token_id')->unique(); // e.g. #SBT-2026-0041
            $table->string('title');
            $table->string('issuer')->default('KampusX Verified Credentials');
            $table->string('contract_address')->default('0x71C849Aa68364d9E4105B853e5e4E9Fa65749A32');
            $table->string('tx_hash');
            $table->string('block_number');
            $table->string('network')->default('Polygon PoS');
            $table->string('token_standard')->default('ERC-5192 (Soulbound Token)');
            $table->timestamp('minted_at')->nullable();
            $table->text('metadata_uri')->nullable();
            $table->boolean('is_verified')->default(true);
            $table->timestamps();

            $table->index(['user_id', 'token_id']);
        });

        // 4. Talent Social Feed Posts (Feed Prestasi & Pembelajaran Mahasiswa)
        Schema::create('talent_posts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('sbt_credential_id')->nullable()->constrained('sbt_credentials')->onDelete('set null');
            $table->text('content');
            $table->json('badge_highlight')->nullable(); // { title, tokenId, issuer }
            $table->unsignedInteger('likes_count')->default(0);
            $table->unsignedInteger('comments_count')->default(0);
            $table->unsignedInteger('shares_count')->default(0);
            $table->timestamps();

            $table->index(['user_id', 'created_at']);
        });

        // 5. Talent Post Likes
        Schema::create('talent_post_likes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('talent_post_id')->constrained('talent_posts')->onDelete('cascade');
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->timestamps();

            $table->unique(['talent_post_id', 'user_id']);
        });

        // 6. Talent Post Comments
        Schema::create('talent_post_comments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('talent_post_id')->constrained('talent_posts')->onDelete('cascade');
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->text('comment');
            $table->timestamps();

            $table->index(['talent_post_id', 'created_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('talent_post_comments');
        Schema::dropIfExists('talent_post_likes');
        Schema::dropIfExists('talent_posts');
        Schema::dropIfExists('sbt_credentials');
        Schema::dropIfExists('talent_skills');
        Schema::dropIfExists('talent_profiles');
    }
};
