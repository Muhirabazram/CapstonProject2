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
            $password = $row['password'] ?? $nim ?? '12345678';

            if (!$nim || !$nama) {
                continue;
            }

            // Create or Update User account
            $user = User::updateOrCreate(
                ['username' => (string) $nim],
                [
                    'password' => Hash::make((string) $password),
                    'role' => 'mahasiswa',
                ]
            );

            // Create or Update Mahasiswa profile
            Mahasiswa::updateOrCreate(
                ['user_id' => $user->id],
                [
                    'nim' => (string) $nim,
                    'nama' => (string) $nama,
                    'prodi' => (string) $prodi,
                ]
            );
        }
    }
}
