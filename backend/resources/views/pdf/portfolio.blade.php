<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="utf-8">
    <title>Portofolio & Transkrip - {{ $user->name }}</title>
    <style>
        body {
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            font-size: 11px;
            color: #334155;
            line-height: 1.4;
            margin: 0;
            padding: 0;
        }
        .header {
            border-bottom: 3px double #1e3a8a;
            padding-bottom: 12px;
            margin-bottom: 20px;
        }
        .header-title {
            font-size: 22px;
            font-weight: bold;
            color: #1e3a8a;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin: 0 0 4px 0;
        }
        .header-subtitle {
            font-size: 11px;
            color: #64748b;
            margin: 0 0 10px 0;
        }
        .profile-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 8px;
        }
        .profile-table td {
            padding: 3px 0;
            vertical-align: top;
        }
        .profile-label {
            font-weight: bold;
            color: #475569;
            width: 120px;
        }
        .profile-value {
            color: #0f172a;
        }
        .interests-container {
            margin-top: 2px;
        }
        .interest-badge {
            display: inline-block;
            background-color: #f1f5f9;
            color: #475569;
            border: 1px solid #e2e8f0;
            border-radius: 4px;
            padding: 2px 6px;
            font-size: 9px;
            margin-right: 4px;
            margin-bottom: 4px;
        }
        .section-title {
            font-size: 13px;
            font-weight: bold;
            color: #1e3a8a;
            border-bottom: 1px solid #cbd5e1;
            padding-bottom: 4px;
            margin-top: 22px;
            margin-bottom: 10px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        .data-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 6px;
        }
        .data-table th {
            background-color: #f8fafc;
            border-bottom: 1.5px solid #cbd5e1;
            color: #475569;
            font-weight: bold;
            text-align: left;
            padding: 6px 8px;
            font-size: 10px;
        }
        .data-table td {
            border-bottom: 1px solid #e2e8f0;
            padding: 6px 8px;
            font-size: 10px;
            vertical-align: top;
        }
        .badge-status {
            display: inline-block;
            padding: 1px 5px;
            border-radius: 3px;
            font-size: 8px;
            font-weight: bold;
            text-transform: uppercase;
        }
        .badge-completed {
            background-color: #dcfce7;
            color: #166534;
        }
        .badge-upcoming {
            background-color: #dbeafe;
            color: #1e40af;
        }
        .footer {
            position: fixed;
            bottom: -15px;
            left: 0;
            right: 0;
            text-align: center;
            font-size: 8px;
            color: #94a3b8;
            border-top: 1px solid #e2e8f0;
            padding-top: 4px;
        }
        .link {
            color: #2563eb;
            text-decoration: none;
        }
    </style>
</head>
<body>
    <div class="header">
        <table style="width: 100%; border-collapse: collapse;">
            <tr>
                <td style="vertical-align: middle;">
                    <h1 class="header-title">{{ $user->name }}</h1>
                    <div class="header-subtitle">Portofolio Pembelajaran & Transkrip Aktivitas Resmi</div>
                </td>
                <td style="text-align: right; vertical-align: top; color: #64748b; font-size: 9px; line-height: 1.2;">
                    <strong>Diterbitkan oleh:</strong> KampusX<br>
                    <strong>Tanggal Cetak:</strong> {{ $generated_at }}
                </td>
            </tr>
        </table>

        <table class="profile-table">
            <tr>
                <td class="profile-label">Email</td>
                <td class="profile-value">: {{ $user->email }}</td>
            </tr>
            <tr>
                <td class="profile-label">Institusi / Universitas</td>
                <td class="profile-value">: {{ $user->university->name ?? 'KampusX Member (Umum)' }}</td>
            </tr>
            <tr>
                <td class="profile-label">Tanggal Bergabung</td>
                <td class="profile-value">: {{ $user->created_at->format('d F Y') }}</td>
            </tr>
            @if(count($interests) > 0)
            <tr>
                <td class="profile-label">Fokus / Minat Belajar</td>
                <td class="profile-value" style="padding-top: 5px;">: 
                    <div class="interests-container" style="display: inline-block; vertical-align: top; margin-left: 2px;">
                        @foreach($interests as $interest)
                            <span class="interest-badge">#{{ $interest }}</span>
                        @endforeach
                    </div>
                </td>
            </tr>
            @endif
        </table>
    </div>

    <div>
        <div class="section-title">I. Riwayat Pembelajaran & Keikutsertaan Event</div>
        @if(count($history) > 0)
            <table class="data-table">
                <thead>
                    <tr>
                        <th style="width: 48%;">Nama Kegiatan / Course</th>
                        <th style="width: 24%;">Penyelenggara</th>
                        <th style="width: 18%;">Tanggal Pelaksanaan</th>
                        <th style="width: 10%; text-align: center;">Status</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach($history as $item)
                        <tr>
                            <td style="font-weight: bold; color: #0f172a;">{{ $item['title'] }}</td>
                            <td>{{ $item['organizer'] }}</td>
                            <td>{{ $item['start_date'] }}</td>
                            <td style="text-align: center;">
                                @if($item['status'] === 'Selesai')
                                    <span class="badge-status badge-completed">Selesai</span>
                                @else
                                    <span class="badge-status badge-upcoming">Terdaftar</span>
                                @endif
                            </td>
                        </tr>
                    @endforeach
                </tbody>
            </table>
        @else
            <p style="color: #64748b; font-style: italic; margin-top: 5px;">Belum ada riwayat keikutsertaan event / course yang tercatat.</p>
        @endif
    </div>

    <div style="margin-top: 15px;">
        <div class="section-title">II. Daftar Sertifikat Resmi & Terverifikasi</div>
        @if(count($certificates) > 0)
            <table class="data-table">
                <thead>
                    <tr>
                        <th style="width: 22%;">No. Sertifikat</th>
                        <th style="width: 44%;">Nama Penghargaan / Kompetensi</th>
                        <th style="width: 20%;">Penerbit</th>
                        <th style="width: 14%; text-align: center;">Validasi</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach($certificates as $cert)
                        <tr>
                            <td style="font-family: monospace; font-weight: bold; color: #0f172a;">{{ $cert['id'] }}</td>
                            <td style="font-weight: bold;">Sertifikat Kelulusan: {{ $cert['eventName'] }}</td>
                            <td>{{ $cert['organizer'] }}</td>
                            <td style="text-align: center;"><a href="{{ $cert['validation_url'] }}" class="link" target="_blank">Cek Validitas</a></td>
                        </tr>
                    @endforeach
                </tbody>
            </table>
        @else
            <p style="color: #64748b; font-style: italic; margin-top: 5px;">Belum ada sertifikat kelulusan yang diklaim.</p>
        @endif
    </div>

    <div class="footer">
        Dokumen ini diterbitkan secara otomatis dan sah secara hukum sebagai rekam jejak digital (digital portfolio) pembelajaran Anda di KampusX.
    </div>
</body>
</html>
