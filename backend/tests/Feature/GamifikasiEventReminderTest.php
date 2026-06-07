<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Models\User;
use App\Models\PointTransaction;
use App\Models\RedemptionHistory;
use App\Models\Reward;
use App\Models\Event;
use App\Notifications\EventGamificationReminder;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Log;

class GamifikasiEventReminderTest extends TestCase
{
    use RefreshDatabase;

    protected $reward;
    protected $event;

    protected function setUp(): void
    {
        parent::setUp();

        // Setup dummy event and reward for redemption references
        $userOrganizer = User::factory()->create(['role' => 'organizer']);
        $this->event = Event::factory()->create(['organizer_id' => $userOrganizer->id]);
        $this->reward = Reward::create([
            'event_id' => null, // Global reward
            'title' => 'T-Shirt Global',
            'description' => 'Cool global t-shirt.',
            'points_cost' => 50,
            'stock' => 10,
            'limit_per_user' => 3,
            'reward_type' => 'physical',
            'type' => 'global',
            'is_active' => true
        ]);
    }

    /**
     * Award global points to a user.
     */
    protected function awardGlobalPoints(User $user, int $amount)
    {
        PointTransaction::create([
            'user_id' => $user->id,
            'event_id' => null,
            'activity_id' => null,
            'amount' => $amount,
            'type' => 'global',
            'description' => 'Award global points'
        ]);
    }

    /**
     * Create redemption history for a user.
     */
    protected function createRedemption(User $user, string $redeemedAt)
    {
        RedemptionHistory::create([
            'user_id' => $user->id,
            'reward_id' => $this->reward->id,
            'points_spent' => 50,
            'status' => 'pending',
            'notes' => 'Some size',
            'redeemed_at' => $redeemedAt
        ]);
    }

    /**
     * Test reminder is sent to eligible users.
     */
    public function test_reminder_sent_to_eligible_users()
    {
        Notification::fake();

        $user = User::factory()->create(['role' => 'participant']);
        $this->awardGlobalPoints($user, 100);

        // Run the command
        $this->artisan('points:remind-members')
            ->expectsOutput('Mencari user yang memenuhi kriteria pengingat poin global...')
            ->assertExitCode(0);

        Notification::assertSentTo(
            $user,
            EventGamificationReminder::class,
            function ($notification, $channels) use ($user) {
                $this->assertContains('database', $channels);
                $this->assertContains('mail', $channels);
                return true;
            }
        );
    }

    /**
     * Test reminder is not sent to users who redeemed recently.
     */
    public function test_reminder_not_sent_to_recent_redeemers()
    {
        Notification::fake();

        $user = User::factory()->create(['role' => 'participant']);
        $this->awardGlobalPoints($user, 100);
        $this->createRedemption($user, now()->subDays(15)->toDateTimeString()); // 15 days ago

        // Run the command
        $this->artisan('points:remind-members')
            ->assertExitCode(0);

        Notification::assertNotSentTo($user, EventGamificationReminder::class);
    }

    /**
     * Test reminder is not sent to users with zero/negative points.
     */
    public function test_reminder_not_sent_to_users_with_zero_points()
    {
        Notification::fake();

        $user = User::factory()->create(['role' => 'participant']);
        $this->awardGlobalPoints($user, 0);

        // Run the command
        $this->artisan('points:remind-members')
            ->assertExitCode(0);

        Notification::assertNotSentTo($user, EventGamificationReminder::class);
    }

    /**
     * Test reminder is sent to users whose last redemption is older than 30 days.
     */
    public function test_reminder_sent_to_old_redeemers()
    {
        Notification::fake();

        $user = User::factory()->create(['role' => 'participant']);
        $this->awardGlobalPoints($user, 150);
        $this->createRedemption($user, now()->subDays(31)->toDateTimeString()); // 31 days ago

        // Run the command
        $this->artisan('points:remind-members')
            ->assertExitCode(0);

        Notification::assertSentTo($user, EventGamificationReminder::class);
    }

    /**
     * Test that database notification is correctly saved.
     */
    public function test_database_notification_format()
    {
        // Don't fake notification to let it write to the database
        $user = User::factory()->create(['role' => 'participant']);
        $this->awardGlobalPoints($user, 200);

        $this->artisan('points:remind-members')
            ->assertExitCode(0);

        $this->assertDatabaseHas('notifications', [
            'notifiable_type' => User::class,
            'notifiable_id' => $user->id,
        ]);

        $notification = $user->notifications()->first();
        $this->assertNotNull($notification);
        $data = $notification->data;

        $this->assertEquals(200, $data['points']);
        $this->assertEquals('Pengingat Poin Global', $data['title']);
        $this->assertStringContainsString('Anda memiliki 200 Global Point yang belum ditukar', $data['message']);
    }
}
