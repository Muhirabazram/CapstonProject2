<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('letter_request_requirements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('request_id')->constrained('letter_requests')->onDelete('cascade');
            $table->foreignId('requirement_id')->constrained('letter_requirements')->onDelete('cascade');
            $table->string('file_path', 255);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('letter_request_requirements');
    }
};
