<!DOCTYPE html>
<html lang="id">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Update Status Pengajuan Surat</title>
    <style>
        body {
            font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            background-color: #f1f5f9;
            margin: 0;
            padding: 0;
            color: #334155;
        }

        .wrapper {
            max-width: 600px;
            margin: 30px auto;
            background: #ffffff;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
            border: 1px solid #e2e8f0;
        }

        .header {
            background: linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%);
            color: #ffffff;
            padding: 24px 32px;
            text-align: center;
        }

        .header h1 {
            margin: 0;
            font-size: 20px;
            font-weight: 700;
            letter-spacing: 0.5px;
        }

        .header p {
            margin: 4px 0 0 0;
            font-size: 13px;
            opacity: 0.9;
        }

        .content {
            padding: 32px;
        }

        .greeting {
            font-size: 16px;
            font-weight: 600;
            color: #0f172a;
            margin-bottom: 12px;
        }

        .intro-text {
            font-size: 14px;
            line-height: 1.6;
            color: #475569;
            margin-bottom: 24px;
        }

        .status-box {
            text-align: center;
            padding: 16px;
            border-radius: 8px;
            margin-bottom: 24px;
            font-weight: 700;
            font-size: 16px;
        }

        .status-selesai {
            background-color: #dcfce7;
            color: #166534;
            border: 1px solid #bbf7d0;
        }

        .status-ditolak {
            background-color: #fee2e2;
            color: #991b1b;
            border: 1px solid #fecaca;
        }

        .status-diproses {
            background-color: #dbeafe;
            color: #1e40af;
            border: 1px solid #bfdbfe;
        }

        .status-diterima {
            background-color: #fef3c7;
            color: #92400e;
            border: 1px solid #fde68a;
        }

        .status-diajukan {
            background-color: #f3f4f6;
            color: #374151;
            border: 1px solid #e5e7eb;
        }

        .details-card {
            background-color: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 24px;
        }

        .detail-row {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            border-bottom: 1px solid #edf2f7;
            font-size: 13px;
        }

        .detail-row:last-child {
            border-bottom: none;
        }

        .detail-label {
            color: #64748b;
            font-weight: 500;
        }

        .detail-value {
            color: #0f172a;
            font-weight: 600;
            text-align: right;
        }

        .rejection-box {
            background-color: #fff1f2;
            border-left: 4px solid #f43f5e;
            padding: 16px;
            border-radius: 4px;
            margin-bottom: 24px;
        }

        .rejection-title {
            font-size: 13px;
            font-weight: 700;
            color: #9f1239;
            margin: 0 0 6px 0;
        }

        .rejection-text {
            font-size: 13px;
            color: #881337;
            margin: 0;
            line-height: 1.5;
        }

        .success-box {
            background-color: #f0fdf4;
            border-left: 4px solid #22c55e;
            padding: 16px;
            border-radius: 4px;
            margin-bottom: 24px;
            font-size: 13px;
            color: #14532d;
            line-height: 1.5;
        }

        .btn-container {
            text-align: center;
            margin-top: 28px;
            margin-bottom: 16px;
        }

        .btn {
            display: inline-block;
            background-color: #2563eb;
            color: #ffffff !important;
            padding: 12px 28px;
            border-radius: 8px;
            font-weight: 600;
            font-size: 14px;
            text-decoration: none;
            box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.3);
        }

        .footer {
            background-color: #f8fafc;
            padding: 20px;
            text-align: center;
            font-size: 12px;
            color: #94a3b8;
            border-top: 1px solid #e2e8f0;
        }
    </style>
</head>

<body>
    <div class="wrapper">
        <div class="header">
            <h1>SIASMA STMIK</h1>
            <p>Sistem Informasi Administrasi Surat Mahasiswa</p>
        </div>

        <div class="content">
            <div class="greeting">Halo, {{ $mahasiswa->nama ?? 'Mahasiswa' }}!</div>

            <p class="intro-text">
                Status permohonan surat Anda dengan ID <strong>{{ $reqCode }}</strong> telah diperbarui oleh Layanan Administrasi Akademik.
            </p>

            @php
            $statusClass = match($status) {
            'selesai' => 'status-selesai',
            'ditolak' => 'status-ditolak',
            'diproses' => 'status-diproses',
            'diterima' => 'status-diterima',
            default => 'status-diajukan'
            };

            $statusLabel = match($status) {
            'selesai' => 'SELESAI (DOKUMEN TERSEDIA)',
            'ditolak' => 'PENGAJUAN DITOLAK',
            'diproses' => 'SEDANG DIPROSES',
            'diterima' => 'PENGAJUAN DITERIMA',
            default => strtoupper($status)
            };
            @endphp

            <div class="status-box {{ $statusClass }}">
                Status Saat Ini: {{ $statusLabel }}
            </div>

            @if($status === 'ditolak' && !empty($alasanPenolakan))
            <div class="rejection-box">
                <p class="rejection-title">Alasan Penolakan:</p>
                <p class="rejection-text">{{ $alasanPenolakan }}</p>
            </div>
            @endif

            @if($status === 'selesai')
            <div class="success-box">
                <strong>Selamat!</strong> Dokumen surat Anda telah resmi diterbitkan. Anda dapat mengunduh file surat digital secara langsung melalui portal SIASMA.
            </div>
            @endif

            <div class="details-card">
                <table style="width: 100%; border-collapse: collapse;">
                    <tr style="border-bottom: 1px solid #e2e8f0;">
                        <td style="padding: 8px 0; color: #64748b; font-size: 13px;">Kode Pengajuan</td>
                        <td style="padding: 8px 0; color: #0f172a; font-weight: 600; font-size: 13px; text-align: right;">{{ $reqCode }}</td>
                    </tr>
                    <tr style="border-bottom: 1px solid #e2e8f0;">
                        <td style="padding: 8px 0; color: #64748b; font-size: 13px;">Jenis Surat</td>
                        <td style="padding: 8px 0; color: #0f172a; font-weight: 600; font-size: 13px; text-align: right;">{{ $category ? $category->nama_kategori : '-' }}</td>
                    </tr>
                    <tr style="border-bottom: 1px solid #e2e8f0;">
                        <td style="padding: 8px 0; color: #64748b; font-size: 13px;">NIM Mahasiswa</td>
                        <td style="padding: 8px 0; color: #0f172a; font-weight: 600; font-size: 13px; text-align: right;">{{ $mahasiswa ? $mahasiswa->nim : '-' }}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px 0; color: #64748b; font-size: 13px;">Tanggal Pengajuan</td>
                        <td style="padding: 8px 0; color: #0f172a; font-weight: 600; font-size: 13px; text-align: right;">{{ $letterRequest->tanggal_pengajuan ? date('d-m-Y', strtotime($letterRequest->tanggal_pengajuan)) : '-' }}</td>
                    </tr>
                </table>
            </div>

            <div class="btn-container">
                <a href="{{ config('app.frontend_url', 'http://localhost:5173') }}" class="btn">Buka SIASMA Portal</a>
            </div>
        </div>

        <div class="footer">
            Email ini dikirimkan secara otomatis oleh Sistem Informasi Administrasi Surat STMIK.<br>
            Harap tidak membalas email ini secara langsung.
        </div>
    </div>
</body>

</html>