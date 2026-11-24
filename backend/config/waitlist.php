<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Waiting List & FIFO Queue Configuration
    |--------------------------------------------------------------------------
    |
    | Konfigurasi parameter waktu tunggu, batas offer eksklusif, dan estimasi waktu.
    |
    */

    // Batas waktu offer eksklusif untuk peserta di urutan terdepan antrean (Menit)
    'offer_ttl_minutes' => (int) env('WAITLIST_OFFER_MINUTES', 3),

    // Batas waktu checkout hold standar setelah offer diklaim (Menit)
    'checkout_ttl_minutes' => (int) env('PAYMENT_HOLD_MINUTES', 15),

    // Batas minimum & maksimum offer TTL yang dapat dikonfigurasi organizer
    'min_offer_ttl_minutes' => 1,
    'max_offer_ttl_minutes' => 10,

    // Rata-rata perputaran hold/transaksi (menit) untuk baseline estimasi konservatif
    'default_service_rate_minutes' => 5,

    // Maksimal kuota antrean per event (null = unlimited)
    'max_queue_per_event' => env('WAITLIST_MAX_QUEUE', 200),
];
