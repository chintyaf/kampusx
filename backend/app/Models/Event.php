<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasOne;

use Illuminate\Database\Eloquent\Relations\HasMany;

class Event extends Model
{
    use HasFactory;

    protected $fillable = [
        'organizer_id',
        'institution_id',

        'title',
        'slug',
        'description',
        'image_path',

        'start_date',
        'end_date',
        'timezone',

        'status',

        'is_featured'
    ];

    protected $casts = [
        'start_date' => 'datetime',
        'end_date' => 'datetime',
        'is_featured' => 'boolean',
    ];

    // Penyelenggara individu (User)
    public function organizer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'organizer_id');
    }

    // Institusi penyelenggara utama
    public function institution(): BelongsTo
    {
        return $this->belongsTo(Institution::class);
    }

    // Lokasi (1-to-1)
    public function locationDetail(): HasOne
    {
        return $this->hasOne(EventLocation::class);
    }

    // Sesi/Agenda event
    public function sessions(): HasMany
    {
        return $this->hasMany(EventSession::class);
    }

    // Daftar pembicara yang terdaftar di event ini
    public function speakers(): HasMany
    {
        return $this->hasMany(Speaker::class);
    }

    // Institusi partner (Collaborators)
    public function collaborators(): BelongsToMany
    {
        return $this->belongsToMany(Institution::class, 'event_collaborators')
                    ->withPivot('role');
    }

    public function categories(): BelongsToMany
    {
        return $this->belongsToMany(Category::class, 'event_categories');
    }

    public function eventTypes(): BelongsToMany
    {
        return $this->belongsToMany(EventType::class, 'event_types_event', 'event_id', 'event_types_id');
    }

    public function getPublishErrors(): array
    {
        $errors = [];

        // --- 1. Validasi Data Utama Event ---
        if (empty($this->title)) $errors[] = 'Judul event belum diisi.';
        if (empty($this->description)) $errors[] = 'Deskripsi event harus diisi.';
        if (empty($this->image_path)) $errors[] = 'Poster/gambar cover event belum diunggah.';
        if (empty($this->start_date) || empty($this->end_date)) $errors[] = 'Tanggal mulai dan selesai event belum ditentukan.';
        if (empty($this->timezone)) $errors[] = 'Zona waktu event belum ditentukan.';

        // --- 2. Validasi Kategori & Tipe ---
        if ($this->categories()->count() === 0) {
            $errors[] = 'Event minimal harus memiliki satu kategori.';
        }
        if ($this->eventTypes()->count() === 0) {
            $errors[] = 'Tipe event (misal: Seminar, Workshop) belum ditentukan.';
        }

        // --- 3. Validasi Lokasi (Berdasarkan Schema event_locations) ---
        $location = $this->locationDetail;

        if (!$location) {
            $errors[] = 'Informasi lokasi (Online/Offline/Hybrid) belum diatur.';
        } else {
            $type = $location->type;

            // A. Validasi Khusus Online & Hybrid
            if (in_array($type, ['online', 'hybrid'])) {
                if (empty($location->platform)) {
                    $errors[] = 'Platform (Zoom, GMeet, dll) wajib diisi untuk akses online.';
                }
                if (empty($location->meeting_link)) {
                    $errors[] = 'Link meeting belum dicantumkan.';
                }
                // Gunakan null coalescing (??) untuk memastikan angka saat perbandingan
                // Hanya validasi jika online_quota TIDAK null
                if ($location?->online_quota !== null && $location->online_quota <= 0) {
                    $errors[] = 'Kuota peserta online harus lebih dari 0.';
                }
            }

            // B. Validasi Khusus Offline & Hybrid
            if (in_array($type, ['offline', 'hybrid'])) {
                if (empty($location->location_name)) {
                    $errors[] = 'Nama tempat/gedung lokasi offline wajib diisi.';
                }
                if (empty($location->province) || empty($location->city)) {
                    $errors[] = 'Provinsi dan Kota lokasi offline belum dipilih.';
                }
                if (empty($location->address_detail)) {
                    $errors[] = 'Alamat lengkap (jalan/nomor) lokasi offline wajib diisi.';
                }
                if ($location?->offline_quota !== null && $location->offline_quota <= 0) {
                    $errors[] = 'Kuota peserta offline harus lebih dari 0.';
                }

                // Validasi Map (Minimal Maps URL atau Koordinat)
                $hasCoords = !empty($location->latitude) && !empty($location->longitude);
                if (empty($location->maps_url) && !$hasCoords) {
                    $errors[] = 'Lokasi offline harus menyertakan Link Google Maps atau Titik Koordinat.';
                }
            }
        }

        // --- 4. Validasi Sesi & Pembicara ---
        $sessions = $this->sessions;
        if ($sessions->isEmpty()) {
            $errors[] = 'Jadwal atau sesi event belum dibuat.';
        } else {
            foreach ($sessions as $index => $session) {
                $sessionNum = $index + 1;
                $sessionTitle = $session->title ?: "Sesi ke-{$sessionNum}";

                if (empty($session->date) || empty($session->start_time) || empty($session->end_time)) {
                    $errors[] = "Waktu pelaksanaan pada '{$sessionTitle}' belum lengkap.";
                }

                if ($session->speakers()->count() === 0) {
                    $errors[] = "Sesi '{$sessionTitle}' belum memiliki pembicara.";
                }
            }
        }

        return $errors;
    }

    public function materials(): HasMany
    {
        return $this->hasMany(EventMaterial::class);
    }
}
