<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('letter_requirements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('category_id')->constrained('letter_categories')->onDelete('cascade');
            $table->string('nama_syarat', 255);
            $table->string('tipe_file', 50);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('letter_requirements');
    }
};
