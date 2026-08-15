<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('mahasiswas', function (Blueprint $table) {
            $table->string('angkatan', 10)->nullable()->after('prodi');
            $table->enum('jenis_kelamin', ['L', 'P'])->nullable()->after('angkatan');
            $table->enum('jenis_mahasiswa', ['Reguler', 'Kelas Karyawan', 'Ekstensi'])->default('Reguler')->after('jenis_kelamin');
            $table->string('tempat_lahir', 100)->nullable()->after('jenis_mahasiswa');
            $table->date('tanggal_lahir')->nullable()->after('tempat_lahir');
            $table->text('alamat')->nullable()->after('tanggal_lahir');
            $table->string('email', 100)->nullable()->after('alamat');
            $table->string('no_hp', 20)->nullable()->after('email');
            $table->string('dosen_wali', 100)->nullable()->after('no_hp');
            $table->enum('status_mahasiswa', ['Aktif', 'Cuti', 'Lulus', 'Keluar'])->default('Aktif')->after('dosen_wali');
        });

        Schema::table('users', function (Blueprint $table) {
            $table->string('name', 255)->nullable()->after('username');
        });
    }

    public function down(): void
    {
        Schema::table('mahasiswas', function (Blueprint $table) {
            $table->dropColumn([
                'angkatan', 'jenis_kelamin', 'jenis_mahasiswa',
                'tempat_lahir', 'tanggal_lahir', 'alamat',
                'email', 'no_hp', 'dosen_wali', 'status_mahasiswa',
            ]);
        });

        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('name');
        });
    }
};
