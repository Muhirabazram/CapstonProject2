<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Mahasiswa extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'nim',
        'nama',
        'prodi',
        'angkatan',
        'jenis_kelamin',
        'jenis_mahasiswa',
        'tempat_lahir',
        'tanggal_lahir',
        'alamat',
        'email',
        'no_hp',
        'dosen_wali',
        'status_mahasiswa',
    ];

    protected $casts = [
        'tanggal_lahir' => 'date',
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function letterRequests()
    {
        return $this->hasMany(LetterRequest::class, 'mahasiswa_id');
    }
}
