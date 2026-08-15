<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LetterRequest extends Model
{
    use HasFactory;

    protected $fillable = [
        'mahasiswa_id',
        'category_id',
        'nomor_surat',
        'status',
        'tanggal_pengajuan',
        'file_hasil_path',
        'file_permohonan_path',
        'file_ttd_digital_path',
        'alasan_penolakan',
    ];

    public function mahasiswa()
    {
        return $this->belongsTo(Mahasiswa::class, 'mahasiswa_id');
    }

    public function category()
    {
        return $this->belongsTo(LetterCategory::class, 'category_id')->withTrashed();
    }

    public function values()
    {
        return $this->hasMany(LetterRequestValue::class, 'request_id');
    }

    public function requestRequirements()
    {
        return $this->hasMany(LetterRequestRequirement::class, 'request_id');
    }
}
