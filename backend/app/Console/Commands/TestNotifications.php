<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\User;
use App\Models\Event;
use App\Models\Category;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Ticket;
use App\Models\CertificateTemplate;
use App\Models\Survey;
use App\Notifications\OperationalNotification;
use App\Services\CertificateNotificationHelper;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class TestNotifications extends Command
{
    protected $signature = 'app:test-notifications {email : Email of the user to receive the test notifications}';
    protected $description = 'Simulate and test all notification types for a specific user';

    public function handle()
    {
        $email = $this->argument('email');
        $user = User::where('email', $email)->first();

        if (!$user) {
            $this->error("User dengan email '{$email}' tidak ditemukan. Silakan daftarkan user ini dulu di frontend atau gunakan email user yang sudah ada.");
            return 1;
        }

        $this->info("=== Memulai Simulasi Pengujian Notifikasi untuk {$user->name} ({$user->email}) ===");

        // Dapatkan atau buat Kategori dan Event simulasi
        $category = Category::firstOrCreate(['name' => 'Kategori Test']);
        
        $event = Event::create([
            'organizer_id' => $user->id,
            'title' => 'Event Simulasi Notifikasi ' . Str::random(5),
            'description' => 'Ini adalah event simulasi untuk menguji sistem notifikasi.',
            'status' => 'draft',
            'pos_pin' => strtoupper(Str::random(6)),
            'start_date' => now()->addDays(2),
            'end_date' => now()->addDays(2)->addHours(2),
            'timezone' => 'WIB'
        ]);

        $event->categories()->sync([$category->id]);

        $this->info("1. Berhasil membuat Event Simulasi: '{$event->title}'");

        // ----------------------------------------------------
        // Test 1: Event Rekomendasi
        // ----------------------------------------------------
        $this->comment("\n--- Pengujian: Event Rekomendasi ---");
        // Asosiasikan minat kategori dengan user
        $user->categories()->syncWithoutDetaching([$category->id]);
        $this->info("Menambahkan kategori '{$category->name}' ke daftar minat user '{$user->name}'");

        // Kirim notifikasi rekomendasi event
        $categoryIds = $event->categories()->pluck('categories.id')->toArray();
        $usersToNotify = User::whereHas('categories', function($q) use ($categoryIds) {
            $q->whereIn('categories.id', $categoryIds);
        })->get();

        $recommendationCount = 0;
        foreach ($usersToNotify as $u) {
            $u->notify(new OperationalNotification(
                "Rekomendasi Event Baru!",
                "Event baru '{$event->title}' telah dipublikasikan dan cocok dengan minat kategori Anda.",
                "event_recommendation",
                [
                    'event_id' => $event->id,
                    'event_slug' => $event->slug
                ]
            ));
            $recommendationCount++;
        }
        $this->info("Berhasil mengirim notifikasi 'event_recommendation' ke {$recommendationCount} user.");

        // ----------------------------------------------------
        // Test 2: Status Pembayaran (Payment Pending & Success)
        // ----------------------------------------------------
        $this->comment("\n--- Pengujian: Status Pembayaran ---");
        
        // Kirim Pending Payment
        $user->notify(new OperationalNotification(
            "Menunggu Pembayaran",
            "Tiket Anda untuk event '{$event->title}' berhasil dipesan. Selesaikan pembayaran Anda sebelum kedaluwarsa.",
            "payment_pending",
            ['event_id' => $event->id]
        ));
        $this->info("Berhasil mengirim notifikasi 'payment_pending'.");

        // Kirim Successful Payment
        $user->notify(new OperationalNotification(
            "Pembayaran Sukses!",
            "Pembayaran Anda untuk event '{$event->title}' telah berhasil diverifikasi. Tiket Anda kini aktif.",
            "payment_success",
            ['event_id' => $event->id]
        ));
        $this->info("Berhasil mengirim notifikasi 'payment_success'.");

        // ----------------------------------------------------
        // Test 3: Sertifikat Tersedia
        // ----------------------------------------------------
        $this->comment("\n--- Pengujian: Sertifikat Tersedia ---");
        
        // Ubah status event menjadi completed
        $event->update(['status' => 'completed']);
        $this->info("Mengubah status event simulasi menjadi 'completed'.");

        // Buat Template Sertifikat
        CertificateTemplate::create([
            'event_id' => $event->id,
            'background_path' => 'certificates/default.png',
            'canvas_width' => 800,
            'canvas_height' => 600,
        ]);
        $this->info("Membuat template sertifikat simulasi untuk event.");

        // Buat Survey
        $survey = Survey::create([
            'event_id' => $event->id,
            'title' => 'Evaluasi ' . $event->title,
            'is_active' => true
        ]);
        $this->info("Membuat survey evaluasi simulasi untuk event.");

        // Buat Tiket status 'used' (Hadir)
        $order = Order::create([
            'order_id' => 'SIM-' . strtoupper(Str::random(8)),
            'event_id' => $event->id,
            'user_id' => $user->id,
            'amount' => 0,
            'status' => 'paid',
            'paid_at' => now(),
        ]);
        $orderItem = OrderItem::create([
            'order_id' => $order->id,
            'quantity' => 1,
            'price' => 0,
        ]);
        $ticket = Ticket::create([
            'participant_id' => $user->id,
            'order_item_id' => $orderItem->id,
            'attendee_name' => $user->name,
            'attendee_email' => $user->email,
            'ticket_code' => strtoupper(Str::random(8)),
            'qr_token' => (string) Str::uuid(),
            'status' => 'used', // Hadir
        ]);
        $this->info("Membuat tiket simulasi berstatus 'used' (Hadir) untuk user.");

        // Panggil helper
        CertificateNotificationHelper::checkAndNotify($event->id);
        $this->info("Menjalankan CertificateNotificationHelper::checkAndNotify() untuk mengirim notifikasi sertifikat.");

        $this->info("\n=== Simulasi Selesai! ===");
        $this->info("Silakan login ke frontend menggunakan email '{$email}' dan periksa lonceng notifikasi atau halaman riwayat notifikasi.");
        $this->info("Pastikan Anda memberikan izin/allow notifikasi browser saat pertama kali memuat halaman frontend.");

        return 0;
    }
}
