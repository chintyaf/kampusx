<?php

namespace Tests\Feature;

use App\Models\SecureMedia;
use App\Models\User;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class SecureMediaTest extends TestCase
{
    use DatabaseTransactions;

    private $user;

    protected function setUp(): void
    {
        parent::setUp();
        // Setup a fake disk for local private storage testing
        Storage::fake('local');

        // Create a test user
        $this->user = User::factory()->create(['role' => 'organizer']);
    }

    /**
     * 1. Test uploading a file as BLOB storage type.
     */
    public function test_upload_secure_media_as_blob()
    {
        $file = UploadedFile::fake()->image('test_avatar.png', 200, 200);

        $response = $this->actingAs($this->user)
            ->postJson(route('secure-media.upload'), [
                'file' => $file,
                'storage_type' => 'blob',
            ]);

        $response->assertStatus(201)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.storage_type', 'blob');

        $mediaId = $response->json('data.id');

        // Assert database record exists and holds the content
        $this->assertDatabaseHas('secure_media', [
            'id' => $mediaId,
            'storage_type' => 'blob',
            'filename' => 'test_avatar.png',
        ]);

        $dbMedia = SecureMedia::find($mediaId);
        $this->assertNotNull($dbMedia->content);
        $this->assertEquals('image/png', $dbMedia->mime_type);

        // Fetch / Serve the file and verify content
        $serveResponse = $this->get(route('secure-media.serve', ['id' => $mediaId]));
        $serveResponse->assertStatus(200)
            ->assertHeader('Content-Type', 'image/png')
            ->assertHeader('Content-Disposition', 'inline; filename="test_avatar.png"');

        $this->assertEquals(file_get_contents($file->getRealPath()), $serveResponse->getContent());
    }

    /**
     * 2. Test uploading a file as secure private local storage with optimized path.
     */
    public function test_upload_secure_media_as_private_local_with_hashed_subfolders()
    {
        $file = UploadedFile::fake()->create('sensitive_doc.pdf', 500, 'application/pdf');

        $response = $this->actingAs($this->user)
            ->postJson(route('secure-media.upload'), [
                'file' => $file,
                'storage_type' => 'local',
            ]);

        $response->assertStatus(201)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.storage_type', 'local');

        $mediaId = $response->json('data.id');

        $dbMedia = SecureMedia::find($mediaId);
        $this->assertNull($dbMedia->content); // Content must be null in DB
        $this->assertNotNull($dbMedia->file_path);

        // Verify the file name is hashed and stored in secure nested subfolders
        // Matches: secure_media/xx/xx/hash.pdf
        $this->assertMatchesRegularExpression('/^secure_media\/[a-f0-9]{2}\/[a-f0-9]{2}\/[a-f0-9]{40,}\.pdf$/', $dbMedia->file_path);

        // Assert file exists on the fake 'local' private storage disk
        Storage::disk('local')->assertExists($dbMedia->file_path);

        // Fetch / Serve the file and verify content
        $serveResponse = $this->get(route('secure-media.serve', ['id' => $mediaId]));
        $serveResponse->assertStatus(200)
            ->assertHeader('Content-Type', 'application/pdf');

        $this->assertEquals(
            Storage::disk('local')->path($dbMedia->file_path),
            $serveResponse->getFile()->getPathname()
        );
    }

    /**
     * 3. Test serving secure thumbnail (TNB) for images.
     */
    public function test_serve_secure_thumbnail_image()
    {
        // Upload an image first
        $file = UploadedFile::fake()->image('photo.jpg', 600, 400);

        $uploadResponse = $this->actingAs($this->user)
            ->postJson(route('secure-media.upload'), [
                'file' => $file,
                'storage_type' => 'local',
            ]);

        $mediaId = $uploadResponse->json('data.id');

        // Request the thumbnail
        $tnbResponse = $this->get(route('secure-media.thumbnail', ['id' => $mediaId]));
        $tnbResponse->assertStatus(200)
            ->assertHeader('Content-Type', 'image/jpeg');

        // Verify it returns an image back (even if GD fallback occurs, it works beautifully)
        $this->assertNotEmpty($tnbResponse->getContent());
    }

    /**
     * 4. Test fallback to original file if thumbnail is requested for non-images.
     */
    public function test_serve_thumbnail_fallback_for_non_images()
    {
        $file = UploadedFile::fake()->create('report.pdf', 100, 'application/pdf');

        $uploadResponse = $this->actingAs($this->user)
            ->postJson(route('secure-media.upload'), [
                'file' => $file,
                'storage_type' => 'local',
            ]);

        $mediaId = $uploadResponse->json('data.id');

        // Request thumbnail for PDF
        $tnbResponse = $this->get(route('secure-media.thumbnail', ['id' => $mediaId]));
        
        // Should fallback to serving the original PDF file safely
        $tnbResponse->assertStatus(200)
            ->assertHeader('Content-Type', 'application/pdf')
            ->assertHeader('Content-Disposition', 'inline; filename="report.pdf"');
    }

    /**
     * 5. Test deleting secure media.
     */
    public function test_delete_secure_media_removes_db_and_physical_file()
    {
        $file = UploadedFile::fake()->image('logo.png', 100, 100);

        $uploadResponse = $this->actingAs($this->user)
            ->postJson(route('secure-media.upload'), [
                'file' => $file,
                'storage_type' => 'local',
            ]);

        $mediaId = $uploadResponse->json('data.id');
        $dbMedia = SecureMedia::find($mediaId);

        Storage::disk('local')->assertExists($dbMedia->file_path);

        // Delete secure media
        $deleteResponse = $this->actingAs($this->user)
            ->deleteJson(route('secure-media.destroy', ['id' => $mediaId]));

        $deleteResponse->assertStatus(200)
            ->assertJsonPath('success', true);

        // Assert database record deleted
        $this->assertDatabaseMissing('secure_media', ['id' => $mediaId]);

        // Assert physical file deleted from local private storage
        Storage::disk('local')->assertMissing($dbMedia->file_path);
    }

    /**
     * 6. Test that creating an event with a banner stores it securely.
     */
    public function test_event_creation_stores_banner_securely()
    {
        $file = UploadedFile::fake()->image('event_banner.png', 800, 600);

        $response = $this->actingAs($this->user)
            ->postJson('/api/events', [
                'title' => 'Secure Banner Event',
                'description' => 'This event has a secure banner',
                'banner' => $file,
            ]);

        $response->assertStatus(201)
            ->assertJsonPath('status', 'success');

        $eventId = $response->json('data.id');

        // Assert the event was created
        $event = \App\Models\Event::findOrFail($eventId);
        
        // Assert the image_path starts with secure-media/
        $this->assertStringStartsWith('secure-media/', $event->getRawOriginal('image_path'));

        $mediaId = explode('/', $event->getRawOriginal('image_path'))[1];

        // Assert database record exists and holds the content
        $this->assertDatabaseHas('secure_media', [
            'id' => $mediaId,
            'storage_type' => 'local',
        ]);

        $dbMedia = SecureMedia::find($mediaId);
        Storage::disk('local')->assertExists($dbMedia->file_path);

        // Verify the dynamic banner_url resolves to the route
        $expectedUrl = route('secure-media.serve', ['id' => $mediaId]);
        $this->assertEquals($expectedUrl, $event->banner_url);
    }

    /**
     * 7. Test updating event general info handles and deletes old secure banners.
     */
    public function test_event_general_info_update_handles_secure_banner()
    {
        // 1. Create event with initial secure banner
        $initialFile = UploadedFile::fake()->image('banner_v1.png', 800, 600);
        $secureMediaService = app(\App\Services\SecureMediaService::class);
        $mediaV1 = $secureMediaService->store($initialFile, 'local');

        $event = \App\Models\Event::create([
            'organizer_id' => $this->user->id,
            'title' => 'Test Event Banner Update',
            'image_path' => 'secure-media/' . $mediaV1->id,
            'status' => 'draft',
        ]);

        Storage::disk('local')->assertExists($mediaV1->file_path);

        // 2. Perform update with a new banner
        $newFile = UploadedFile::fake()->image('banner_v2.png', 800, 600);

        $updateResponse = $this->actingAs($this->user)
            ->postJson("/api/event-dashboard/{$event->id}/info-utama/update", [
                'title' => 'Updated Secure Banner Event',
                'description' => 'New description',
                'banner' => $newFile,
            ]);

        $updateResponse->assertStatus(200)
            ->assertJsonPath('status', 'success');

        // 3. Assert old secure banner was deleted
        $this->assertDatabaseMissing('secure_media', ['id' => $mediaV1->id]);
        Storage::disk('local')->assertMissing($mediaV1->file_path);

        // 4. Assert new secure banner was created
        $event->refresh();
        $this->assertStringStartsWith('secure-media/', $event->getRawOriginal('image_path'));
        
        $mediaIdV2 = explode('/', $event->getRawOriginal('image_path'))[1];
        $dbMediaV2 = SecureMedia::findOrFail($mediaIdV2);
        
        Storage::disk('local')->assertExists($dbMediaV2->file_path);
        $this->assertEquals(route('secure-media.serve', ['id' => $mediaIdV2]), $event->banner_url);
    }

    /**
     * 8. Test that the fallback /storage/secure-media/{id} web route resolves and serves perfectly.
     */
    public function test_fallback_storage_secure_media_url_works()
    {
        $file = UploadedFile::fake()->image('fallback_avatar.png', 100, 100);

        $uploadResponse = $this->actingAs($this->user)
            ->postJson(route('secure-media.upload'), [
                'file' => $file,
                'storage_type' => 'local',
            ]);

        $mediaId = $uploadResponse->json('data.id');
        $dbMedia = SecureMedia::findOrFail($mediaId);

        // Fetch / Serve the file using web fallback route (no /api/ prefix)
        $serveResponse = $this->get("/storage/secure-media/{$mediaId}");
        $serveResponse->assertStatus(200)
            ->assertHeader('Content-Type', 'image/png');

        $this->assertEquals(
            Storage::disk('local')->path($dbMedia->file_path),
            $serveResponse->getFile()->getPathname()
        );
    }
}
