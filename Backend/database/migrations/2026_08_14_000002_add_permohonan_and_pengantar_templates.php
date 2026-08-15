<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('letter_categories', function (Blueprint $table) {
            $table->string('file_template_permohonan_path')->nullable()->after('deskripsi');
            $table->string('file_template_pengantar_path')->nullable()->after('file_template_permohonan_path');
        });

        Schema::table('letter_requests', function (Blueprint $table) {
            $table->string('file_permohonan_path')->nullable()->after('alasan_penolakan');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('letter_categories', function (Blueprint $table) {
            $table->dropColumn(['file_template_permohonan_path', 'file_template_pengantar_path']);
        });

        Schema::table('letter_requests', function (Blueprint $table) {
            $table->dropColumn('file_permohonan_path');
        });
    }
};
