<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('letter_categories', function (Blueprint $table) {
            $table->boolean('ttd_digital')->default(false)->after('file_template_path');
        });
    }

    public function down(): void
    {
        Schema::table('letter_categories', function (Blueprint $table) {
            $table->dropColumn('ttd_digital');
        });
    }
};
