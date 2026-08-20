<?php

namespace App\Imports;

use App\Models\User;
use App\Models\Mahasiswa;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Hash;
use Maatwebsite\Excel\Concerns\ToCollection;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Exception;

class StudentsImport implements ToCollection, WithHeadingRow
{
    protected $importedCount = 0;

    public function collection(Collection $rows)
    {
        if ($rows->isEmpty()) {
            throw new Exception("Format kolom tidak sesuai / File kosong. Jangan ubah judul kolom pada baris header file template dan pastikan NIM tidak kosong.");
        }

        // Validate header columns on first row
        $firstRow = $rows->first();
        $firstRowArray = $firstRow instanceof Collection ? $firstRow->toArray() : (array) $firstRow;
        $keys = array_map('strval', array_keys($firstRowArray));
        
        $hasNimCol = in_array('nim', $keys, true) || in_array('username', $keys, true);
        $hasNamaCol = in_array('nama', $keys, true) || in_array('nama_lengkap', $keys, true);

        if (!$hasNimCol || !$hasNamaCol) {
            throw new Exception("Format kolom tidak sesuai / Gagal pada baris ke-1. Jangan ubah judul kolom pada baris header file template dan pastikan NIM tidak kosong.");
        }

        $rowNumber = 1; // Header row is 1, first data row is 2
        $seenNims = [];
        $seenEmails = [];

        foreach ($rows as $row) {
            $rowNumber++;

            $rowArr = $row instanceof Collection ? $row->toArray() : (array) $row;
            $filledValues = array_filter($rowArr, function ($val) {
                return $val !== null && trim((string) $val) !== '';
            });

            // Skip completely blank rows
            if (empty($filledValues)) {
                continue;
            }

            $nim = $row['nim'] ?? $row['username'] ?? null;
            $nama = $row['nama'] ?? $row['nama_lengkap'] ?? null;
            $prodi = $row['prodi'] ?? $row['program_studi'] ?? 'Informatika';

            if ($nim === null || trim((string) $nim) === '') {
                throw new Exception("Format kolom tidak sesuai / Gagal pada baris ke-{$rowNumber}. Jangan ubah judul kolom pada baris header file template dan pastikan NIM tidak kosong.");
            }

            if ($nama === null || trim((string) $nama) === '') {
                throw new Exception("Format kolom tidak sesuai / Gagal pada baris ke-{$rowNumber}. Jangan ubah judul kolom pada baris header file template dan pastikan NIM tidak kosong.");
            }

            $cleanNim = trim((string) $nim);

            // Check duplicate NIM within the uploaded file
            if (isset($seenNims[$cleanNim])) {
                throw new Exception("NIM atau Email sudah terdaftar dalam sistem (NIM '{$cleanNim}' duplikat pada baris ke-{$rowNumber}). Pastikan data NIM dan email bersifat unik.");
            }
            $seenNims[$cleanNim] = true;

            // Check if NIM already exists in database
            if (Mahasiswa::where('nim', $cleanNim)->exists()) {
                throw new Exception("NIM atau Email sudah terdaftar dalam sistem (NIM '{$cleanNim}' pada baris ke-{$rowNumber} sudah terdaftar). Pastikan data NIM dan email bersifat unik.");
            }

            $email = isset($row['email']) ? trim((string)$row['email']) : (isset($row['e_mail']) ? trim((string)$row['e_mail']) : null);
            if ($email !== null && $email !== '') {
                // Check duplicate email within file
                if (isset($seenEmails[$email])) {
                    throw new Exception("NIM atau Email sudah terdaftar dalam sistem (Email '{$email}' duplikat pada baris ke-{$rowNumber}). Pastikan data NIM dan email bersifat unik.");
                }
                $seenEmails[$email] = true;

                // Check if email already exists in database
                if (Mahasiswa::where('email', $email)->exists()) {
                    throw new Exception("NIM atau Email sudah terdaftar dalam sistem (Email '{$email}' pada baris ke-{$rowNumber} sudah terdaftar). Pastikan data NIM dan email bersifat unik.");
                }
            }

            $defaultUsnPw = 'stmik' . $cleanNim;
            $customPassword = $row['password'] ?? null;
            $passwordHash = $customPassword ? Hash::make((string) $customPassword) : Hash::make($defaultUsnPw);

            $noHp = $row['no_hp'] ?? $row['nohp'] ?? $row['no_telepon'] ?? $row['telepon'] ?? $row['phone'] ?? null;
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

            // Create User account
            $user = User::create([
                'username' => $defaultUsnPw,
                'password' => $passwordHash,
                'role' => 'mahasiswa',
            ]);

            // Create Mahasiswa profile
            Mahasiswa::create([
                'user_id' => $user->id,
                'nim' => $cleanNim,
                'nama' => (string) $nama,
                'prodi' => (string) $prodi,
                'no_hp' => $noHp ? (string) $noHp : null,
                'email' => $email ? (string) $email : null,
                'angkatan' => $angkatan ? (string) $angkatan : null,
                'jenis_kelamin' => $jk,
                'jenis_mahasiswa' => $jenisMhs ? (string) $jenisMhs : 'Reguler',
                'dosen_wali' => $dosenWali ? (string) $dosenWali : null,
                'alamat' => $alamat ? (string) $alamat : null,
                'status_mahasiswa' => 'Aktif',
            ]);

            $this->importedCount++;
        }
    }

    public function getImportedCount()
    {
        return $this->importedCount;
    }
}
