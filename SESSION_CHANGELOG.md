# Session Changelog & Development Summary

Dokumen ini berisi rekap riwayat pengerjaan, pembaruan (*updates*), penambahan alur/fitur, serta spesifikasi detail (logika aliran data) mengenai semua komponen yang telah dikembangkan di repositori **KampusX** (untuk *Frontend* dan *Backend*) pada sesi pengerjaan ini.

---

## 1. Penyempurnaan Sistem Absensi Kegiatan (Event Attendance System)
**Sasaran**: Mewujudkan proses penerbitan tiket dan pemindaian *QR Scanner* secara _end-to-end_ sampai integrasi turunnya poin interaksi kehadiran.

**Apa yang telah selesai:**
*   **API & Backend**: Tabel `attendance_logs` dan `event_staff` disisipkan ke *database* beserta sampel (*seeders*). Controller dan API disiapkan agar menerima hash ter-enkripsi.
*   **UI Peserta (`MyTicketComponent.jsx`)**: Dimodifikasi dari visualisasi statis menjadi komponen dinamis yang men-fetch Axios (`GET API qr-string`), merender susunan *hash* dari backend tersebut ke dalam kanvas bentuk `react-qr-code`.
*   **UI Panitia/Scanner (`ScannerPage.jsx`)**: Mengawinkan pembaca kamera WebRTC (`html5-qrcode`) agar string yang ditangkap seketika "ditembakkan" ke validasi presensi (`POST /api/attendance/scan`).
*   **Flow Reaksi Cerdas**: Keberhasilan scan terhubung lincah memanggil *Modal Engagement* (Tawaran Klaim Poin Presensi). Kegagalan karena tiket basi diterjemahkan sistem menjadi rentetan *Toast Error* bewarna peringatan (React Hot Toast) di sisi *Browser*.

---

## 2. Akses Konten Pasca-Acara (Post-Event Content Access)
**Sasaran**: Memfasilitasi panitia membagikan rekaman ulang (Replay), slide PPT, dan dokumen pasca-event kepada peserta via sistem (memakai strategi _External Link_ guna menghemat ruang hard disk server *production* Anda).

**Apa yang telah selesai:**
*   **Backend & Skema**: Kelahiran migrasi dan model baru bernama `EventMaterial` yang mengait pada `Event` *(belongsTo)*.
*   **Pembatasan Kedatangan (*Require Attendance Flow*)**: Kolom canggih berupa _flag_ `require_attendance`. Apabila dihidupkan, _Endpoint_ `EventMaterialController` secara *defensif* menyembunyikan tayangan video tersebut apabila Peserta X tidak terekam sukses di gerbang _Scan_ Kehadiran.
*   **UI Layer**: Terwujudnya dua bilah utama `OrganizerMaterialsManage.jsx` demi kelancaran penyusunan arsip, dan `PostEventMaterials.jsx` sebagai wahana tonton peserta yang dikemas indah dengan instrumen *Lock/Unlocked* visual.

---

## 3. Infrastruktur Penertiban Platform (Admin Pusat / Super Admin)
**Sasaran**: Memberikan tongkat kuasa "Dewa" demi memoderasi keanggotaan dan ekosistem penyelenggara (*Organizer*), menyiasati _fraud account_ secara ringkas.

**Apa yang telah selesai:**
*   **Birokrasi Penyelenggara yang Ringkas (`OrganizerRequest`)**: Tidak ada hambatan formulir pendaftaran menyebalkan. Partisipan tinggal menekan 'Apply' masuk sebagai tiket ke deretan tabel `organizer_requests`.
*   **Otoritas "Satu Ketukan" (`AdminController`)**: Dibukanya jalan tol lewat rute `POST /admin/organizer-requests/{id}/approve` yang memecah *pending status* dan langsung meroketkan _user hierarchy_ dari _participant_ menjadi _organizer_ seutuhnya.
*   **Senjata *Banned* & Promosi Acara**: Apabila ada pengguna menyimpang, tembakan *endpoint* mutasi (`users/{id}/status => banned/suspended`) beroperasi efektif untuk *mencabut izin dan membersihkan token aktif Sanctum*. Terdapat pula injeksi penonjolan (`POST /events/{id}/feature`) yang menyalakan tombol _boolean is_featured_ agar event dipromosikan (Boost) secara masif pada katalog aplikasi.

---

## 4. Sistem Delegasi Manajerial Perusahaan (B2B Institution Flow)
**Sasaran**: Memecahkan kebuntuan perizinan agar Pimpinan Organisasi / Universitas dapat menunjuk (_appoint_) staf pribadinya *(sub-account)* merilis acaranya dan merepresentasikan lambang Organisasi tanpa bertabrakan sistem pertukaran kata sandi *(password sharing)*.

**Apa yang telah selesai:**
*   **Ketetapan Kurasi Anti-Spam**: Mengingat resiko hadirnya "Entitas Falsu", Pendaftaran awal Institusi dikemas absolut dan diotorisasi murni oleh Admin Pusat lewat antarmuka `AdminInstitutionsManage.jsx`. Sang super admin menetapkan nama Ketua/CEO *(The Owner)* untuk dipasrahkan otoritas institusinya lewat _bridge (pivot table)_ `institution_user`.
*   **Appointing Kilat *(Direct Assignment)***: Pimpinan CEO yang terpilih ini melaju ke *dashboard ManageInstitutionTeam.jsx*, di mana dia hanya harus **mengetik email staf**. Tidak perlu perizinan link _Accept/Invite_; jika sistem mendapatkan email terdaftar milik bawahan mereka, sistem memberlakukan fungsi di `InstitutionMemberController` agar si Staf ini diikat menjadi wakil institusi seutuhnya untuk membuat acara secara representatif! Staf yang cuma _participant_ ini digesut naik jabatannya menuju parameter _Organizer_ di seluruh platform.

---

## 5. CRUD Data Master Organik (Super Admin)
**Sasaran**: Mengeliminasi kebutuhan manipulasi _Database Client_ (seperti phpMyAdmin) dengan menyajikan laman terpadu pengatur Kategori, Tipe Acara, dan Institusi.

**Apa yang telah selesai:**
*   **Perakitan 3 Controller Backend**: `CategoryController`, `EventTypeController`, dan `AdminInstitutionController` kini menggendong fungsi penuh `store`, `update`, dan `destroy`.
*   **Keamanan Penghapusan Paksa (*Protected Delete*)**: Mencegah kecelakaan fatal akibat fitur "Hapus". Endpoint API kini mendeteksi apabila Kategori X sedang dipakai oleh 10 *Event*. Jika ya, sistem melempar _Error 400 Validation_ agar data lama tak mendadak lumpuh (menjaga integritas data basis).
*   **Aplikasi Dasbor Tunggal (`AdminMasterDataPage.jsx`)**: Menggabungkan tiga entitas kelola ke dalam bilah menu _Tabs_ tunggal berbasis interaksi dinamis untuk efisiensi layar.

---

## 6. Mesin Pengingat Otomatis (Event Reminder Engine)
**Sasaran**: Meningkatkan atensi dan kehadiran (engagement) dengan menembakkan peringatan massal terjadwal bagi peserta dan panitia menjelang _kick-off_ acara berjalan.

**Apa yang telah selesai:**
*   **Tracking Penembakan Memori**: Tabel standar `notifications` ditarik dan dibangkitkan. Di samping itu, tabel acara (_events_) diperkuat dengan relawan penanda _Boolean_: `is_h24_sent`, `is_h1_sent`, dan `is_m15_sent` (`default: false`), bertindak layaknya katup keamanan penangkal "Spam Email" walau peronda dipaksa berputar ribuan kali sekalipun.
*   **Eksekusi Peronda Gaib (`SendEventReminders.php`)**: Konstruksi program komando mesin (Command) bertugas _menggerayangi_ rentang waktu seluruh tiket _(published)_. Apabila menembus koridor waktu (H-24 Jam, H-1 Jam, atau 15 Menit sebelum), algoritma melintasi _pivot tickets_ untuk menjaring data pengguna unik secara serentak (bulk). 
*   **Surat Pengumuman Cetak (`EventReminderNotification.php`)**: Pencetakan notifikasi *In-app* di pecah dua gaya. _Organizer_ diberi aba-aba teguran panitia, sementara partisipan ditarik gairah dengan kata _"Reminder: Acara akan segera dimulai..."_
*   **Pewaktu (Scheduler)**: Dipantek secara otomatis mendenyut setiap 15 Menit (`->everyFifteenMinutes()`) melalui simpul Laravel 11. Endpoint UI ditaruh di `GET /api/notifications`.

---

**⚠️ CHECKLIST TAMBAHAN (CRITICAL STEP 2):**
Harap **PASTIKAN** melaksanakan komando `php artisan migrate` kembali, karena ada pendatangan `create_notifications_table` dan injeksi *trigger reminder* ke dalam kerangka _events_!
