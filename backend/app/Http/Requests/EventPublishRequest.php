<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class EventPublishRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        // Sesuaikan dengan logic authorization aplikasi kamu (misal: mengecek role organizer)
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            // ==========================================
            // 1. DATA EVENT UTAMA (tabel: events)
            // ==========================================
            'institution_id' => ['required', 'exists:institutions,id'],
            'title'          => ['required', 'string', 'max:200'],
            'description'    => ['required', 'string'],
            // Diasumsikan dikirim sebagai file, akan disimpan dan path-nya masuk DB
            'image_path'          => ['required', 'image', 'mimes:jpeg,png,jpg', 'max:2048'],
            'start_date'     => ['required', 'date', 'before:end_date'],
            'end_date'       => ['required', 'date', 'after:start_date'],
            'timezone'       => ['required', 'string', 'max:50'],

            // ==========================================
            // 2. KATEGORI & TIPE (Pivot Tables)
            // ==========================================
            'category_ids'   => ['required', 'array', 'min:1'],
            'category_ids.*' => ['required', 'exists:categories,id'],

            'event_type_ids'   => ['required', 'array', 'min:1'],
            'event_type_ids.*' => ['required', 'exists:event_types,id'],

            // ==========================================
            // 3. COLLABORATORS (tabel: event_collaborators)
            // ==========================================
            // Nullable jika event bisa berjalan tanpa kolaborator, tapi jika dikirim wajib lengkap
            'collaborators'                  => ['nullable', 'array'],
            'collaborators.*.institution_id' => ['required_with:collaborators', 'exists:institutions,id'],
            'collaborators.*.role'           => ['required_with:collaborators', 'in:co_host,sponsor,media_partner'],

            // ==========================================
            // 4. LOKASI EVENT (tabel: event_locations)
            // ==========================================
            'location'      => ['required', 'array'],
            'location.type' => ['required', 'in:online,offline,hybrid'],

            // -- Rules untuk Online / Hybrid
            'location.platform'           => ['required_if:location.type,online,hybrid', 'string', 'max:255'],
            'location.meeting_link'       => ['required_if:location.type,online,hybrid', 'url'],
            'location.online_instruction' => ['required_if:location.type,online,hybrid', 'string'],
            'location.online_quota'       => ['required_if:location.type,online,hybrid', 'integer', 'min:1'],

            // -- Rules untuk Offline / Hybrid
            'location.location'            => ['required_if:location.type,offline,hybrid', 'string', 'max:255'],
            'location.location_detail'     => ['required_if:location.type,offline,hybrid', 'string'],
            'location.maps_url'            => ['required_if:location.type,offline,hybrid', 'url'],
            'location.offline_instruction' => ['required_if:location.type,offline,hybrid', 'string'],
            'location.offline_quota'       => ['required_if:location.type,offline,hybrid', 'integer', 'min:1'],

            // ==========================================
            // 5. PEMBICARA (tabel: speakers)
            // ==========================================
            'speakers'               => ['required', 'array', 'min:1'],
            'speakers.*.name'        => ['required', 'string', 'max:255'],
            'speakers.*.role'        => ['required', 'string', 'max:255'],
            'speakers.*.bio'         => ['required', 'string'],
            'speakers.*.social_link' => ['nullable', 'array'], // JSON field
            'speakers.*.expertise'   => ['nullable', 'array'], // JSON field

            // ==========================================
            // 6. SESI EVENT (tabel: event_sessions & pivot)
            // ==========================================
            'sessions'               => ['required', 'array', 'min:1'],
            'sessions.*.title'       => ['required', 'string', 'max:255'],
            'sessions.*.description' => ['required', 'string'],
            'sessions.*.day_number'  => ['required', 'integer', 'min:1'],
            'sessions.*.date'        => ['required', 'date'],
            'sessions.*.start_time'  => ['required', 'date_format:H:i'],
            'sessions.*.end_time'    => ['required', 'date_format:H:i', 'after:sessions.*.start_time'],

            // Relasi antara sesi dan pembicara (menggunakan index/urutan dari array 'speakers')
            // Cth: array [0, 1] berarti sesi ini dibawakan oleh speaker pada index ke-0 dan ke-1
            'sessions.*.speaker_indices'   => ['required', 'array'],
            'sessions.*.speaker_indices.*' => ['integer', 'min:0'],
        ];
    }

    /**
     * Kustomisasi pesan error (opsional, untuk UX yang lebih baik).
     */
/**
     * Kustomisasi pesan error (opsional, untuk UX yang lebih baik).
     */
    public function messages(): array
    {
        return [
            // ==========================================
            // 1. DATA EVENT UTAMA
            // ==========================================
            'institution_id.required' => 'Institusi penyelenggara wajib dipilih.',
            'title.required'          => 'Judul event tidak boleh kosong.',
            'description.required'    => 'Deskripsi event harus diisi.',
            'image_path.required'     => 'Poster atau gambar cover event wajib diunggah.',
            'start_date.required'     => 'Tanggal mulai event belum ditentukan.',
            'end_date.required'       => 'Tanggal selesai event belum ditentukan.',
            'end_date.after'          => 'Tanggal selesai harus lebih lambat dari tanggal mulai.',
            'timezone.required'       => 'Zona waktu event wajib dipilih.',

            // ==========================================
            // 2. KATEGORI & TIPE
            // ==========================================
            'category_ids.required'   => 'Event harus memiliki minimal satu kategori.',
            'event_type_ids.required' => 'Event harus memiliki minimal satu tipe event.',

            // ==========================================
            // 3. LOKASI EVENT
            // ==========================================
            'location.required'                   => 'Informasi lokasi event belum lengkap.',
            'location.type.required'              => 'Tipe lokasi (Online, Offline, atau Hybrid) wajib dipilih.',
            'location.platform.required_if'       => 'Platform (misal: Zoom, GMeet) wajib diisi karena event ini memiliki sesi Online.',
            'location.meeting_link.required_if'   => 'Link meeting belum ada. Ini wajib diisi untuk event Online/Hybrid.',
            'location.location.required_if'       => 'Nama lokasi atau gedung wajib diisi karena event ini memiliki sesi Offline.',
            'location.maps_url.required_if'       => 'Link Google Maps masih kosong. Harap isi untuk memudahkan peserta.',

            // ==========================================
            // 4. PEMBICARA
            // ==========================================
            'speakers.required'        => 'Event ini belum memiliki pembicara. Harap tambahkan minimal satu pembicara.',
            'speakers.min'             => 'Minimal harus ada 1 pembicara yang ditambahkan.',
            'speakers.*.name.required' => 'Pastikan semua pembicara yang kamu tambahkan memiliki nama.',
            'speakers.*.role.required' => 'Peran atau jabatan pembicara wajib diisi.',
            'speakers.*.bio.required'  => 'Bio pembicara tidak boleh kosong.',

            // ==========================================
            // 5. SESI EVENT
            // ==========================================
            'sessions.required'                   => 'Event ini belum memiliki jadwal/sesi. Harap buat minimal satu sesi.',
            'sessions.min'                        => 'Minimal harus ada 1 sesi acara.',
            'sessions.*.title.required'           => 'Terdapat sesi yang judulnya belum diisi.',
            'sessions.*.date.required'            => 'Pastikan semua sesi memiliki tanggal pelaksanaan.',
            'sessions.*.start_time.required'      => 'Waktu mulai sesi belum lengkap.',
            'sessions.*.end_time.required'        => 'Waktu selesai sesi belum lengkap.',
            'sessions.*.end_time.after'           => 'Waktu selesai sesi harus lebih dari waktu mulai.',

            // Pesan error khusus jika sesi belum di-assign speaker
            'sessions.*.speaker_indices.required' => 'Ada sesi yang belum ditugaskan pembicara. Harap assign minimal satu pembicara ke dalam sesi tersebut.',
        ];
    }
}
