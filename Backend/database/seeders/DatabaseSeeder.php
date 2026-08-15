<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Mahasiswa;
use App\Models\LetterCategory;
use App\Models\LetterRequirement;
use App\Models\LetterVariable;
use App\Models\LetterRequest;
use App\Models\LetterRequestValue;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 1. Admin User
        $adminUser = User::updateOrCreate(
            ['username' => 'admin'],
            [
                'password' => Hash::make('admin123'),
                'role' => 'admin',
            ]
        );

        // 2. Mahasiswa User & Profile
        $mhsUser = User::updateOrCreate(
            ['username' => '220101001'],
            [
                'password' => Hash::make('mahasiswa123'),
                'role' => 'mahasiswa',
            ]
        );

        $mahasiswa = Mahasiswa::updateOrCreate(
            ['user_id' => $mhsUser->id],
            [
                'nim' => '220101001',
                'nama' => 'Budi Santoso',
                'prodi' => 'Teknik Informatika',
            ]
        );

        // 3. Category: Surat Pengantar Penelitian
        $category = LetterCategory::updateOrCreate(
            ['nama_kategori' => 'Surat Pengantar Penelitian'],
            [
                'deskripsi' => 'Surat resmi pengantar dari fakultas untuk kegiatan pengumpulan data penelitian / tugas akhir.',
                'file_template_path' => 'templates/template_pengantar_penelitian.docx',
            ]
        );

        // Requirements
        $reqKtm = LetterRequirement::firstOrCreate([
            'category_id' => $category->id,
            'nama_syarat' => 'Scan KTM (Kartu Tanda Mahasiswa)',
            'tipe_file' => 'pdf',
        ]);

        $reqTranskrip = LetterRequirement::firstOrCreate([
            'category_id' => $category->id,
            'nama_syarat' => 'Transkrip Nilai Terakhir',
            'tipe_file' => 'pdf',
        ]);

        // Variables
        $varJudul = LetterVariable::firstOrCreate([
            'category_id' => $category->id,
            'nama_variabel' => 'judul_penelitian',
            'tipe_input_html' => 'text',
        ]);

        $varLokasi = LetterVariable::firstOrCreate([
            'category_id' => $category->id,
            'nama_variabel' => 'lokasi_penelitian',
            'tipe_input_html' => 'text',
        ]);

        // 4. Sample Request Initial Transaction
        $letterRequest = LetterRequest::create([
            'mahasiswa_id' => $mahasiswa->id,
            'category_id' => $category->id,
            'status' => 'diajukan',
            'tanggal_pengajuan' => now()->toDateString(),
        ]);

        LetterRequestValue::create([
            'request_id' => $letterRequest->id,
            'variable_id' => $varJudul->id,
            'nilai_isian' => 'Analisis Perancangan Sistem Informasi Administrasi Surat Berbasis Web',
        ]);

        LetterRequestValue::create([
            'request_id' => $letterRequest->id,
            'variable_id' => $varLokasi->id,
            'nilai_isian' => 'Dinas Komunikasi dan Informatika Provinsi Jawa Tengah',
        ]);
    }
}
