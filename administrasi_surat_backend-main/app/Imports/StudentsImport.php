<?php

namespace App\Imports;

use App\Models\User;
use App\Models\Mahasiswa;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Hash;
use Maatwebsite\Excel\Concerns\ToCollection;
use Maatwebsite\Excel\Concerns\WithHeadingRow;

class StudentsImport implements ToCollection, WithHeadingRow
{
    public function collection(Collection $rows)
    {
        foreach ($rows as $row) {
            // Flexible keys (lowercase / trimmed)
            $nim = $row['nim'] ?? $row['username'] ?? null;
            $nama = $row['nama'] ?? $row['nama_lengkap'] ?? null;
            $prodi = $row['prodi'] ?? $row['program_studi'] ?? 'Informatika';

            if (!$nim || !$nama) {
                continue;
            }

            $cleanNim = trim((string) $nim);
            $defaultUsnPw = 'stmik' . $cleanNim;
            $customPassword = $row['password'] ?? null;
            $passwordHash = $customPassword ? Hash::make((string) $customPassword) : Hash::make($defaultUsnPw);

            $noHp = $row['no_hp'] ?? $row['nohp'] ?? $row['no_telepon'] ?? $row['telepon'] ?? $row['phone'] ?? null;
            $email = $row['email'] ?? $row['e_mail'] ?? null;
            $angkatan = $row['angkatan'] ?? $row['tahun_angkatan'] ?? null;
            $jk = $row['jenis_kelamin'] ?? $row['jk'] ?? null;
            $jenisMhs = $row['jenis_mahasiswa'] ?? $row['jenis'] ?? 'Reguler';
            $dosenWali = $row['dosen_wali'] ?? null;
            $alamat = $row['alamat'] ?? null;

            // Normalize Jenis Kelamin (L/P)
            if ($jk) {
                $firstChar = strtoupper(substr(trim((string) $jk), 0, 1));
                $jk = in_array($firstChar, ['L', 'P']) ? $firstChar : null;
            }

            // Create or Update User account
            $user = User::updateOrCreate(
                ['username' => $defaultUsnPw],
                [
                    'password' => $passwordHash,
                    'role' => 'mahasiswa',
                ]
            );

            // Create or Update Mahasiswa profile
            $mahasiswaData = [
                'nim' => $cleanNim,
                'nama' => (string) $nama,
                'prodi' => (string) $prodi,
            ];

            if ($noHp) $mahasiswaData['no_hp'] = (string) $noHp;
            if ($email) $mahasiswaData['email'] = (string) $email;
            if ($angkatan) $mahasiswaData['angkatan'] = (string) $angkatan;
            if ($jk) $mahasiswaData['jenis_kelamin'] = $jk;
            if ($jenisMhs) $mahasiswaData['jenis_mahasiswa'] = (string) $jenisMhs;
            if ($dosenWali) $mahasiswaData['dosen_wali'] = (string) $dosenWali;
            if ($alamat) $mahasiswaData['alamat'] = (string) $alamat;

            Mahasiswa::updateOrCreate(
                ['user_id' => $user->id],
                $mahasiswaData
            );
        }
    }
}
