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

            // Create or Update User account
            $user = User::updateOrCreate(
                ['username' => $defaultUsnPw],
                [
                    'password' => $passwordHash,
                    'role' => 'mahasiswa',
                ]
            );

            // Create or Update Mahasiswa profile
            Mahasiswa::updateOrCreate(
                ['user_id' => $user->id],
                [
                    'nim' => $cleanNim,
                    'nama' => (string) $nama,
                    'prodi' => (string) $prodi,
                ]
            );
        }
    }
}
