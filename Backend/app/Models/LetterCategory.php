<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class LetterCategory extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'nama_kategori',
        'grup_kategori',
        'deskripsi',
        'file_template_path',
        'file_template_permohonan_path',
        'file_template_pengantar_path',
        'ttd_digital',
    ];

    protected $casts = [
        'ttd_digital' => 'boolean',
    ];

    public function requirements()
    {
        return $this->hasMany(LetterRequirement::class, 'category_id');
    }

    public function variables()
    {
        return $this->hasMany(LetterVariable::class, 'category_id');
    }

    public function requests()
    {
        return $this->hasMany(LetterRequest::class, 'category_id');
    }
}
