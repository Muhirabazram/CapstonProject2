<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::table('mahasiswas')
            ->whereNull('angkatan')
            ->orWhere('angkatan', '')
            ->update(['angkatan' => '2024']);
    }

    public function down(): void
    {
        DB::table('mahasiswas')
            ->where('angkatan', '2024')
            ->update(['angkatan' => null]);
    }
};
