<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LetterCategory extends Model
{
    use HasFactory;

    protected $fillable = [
        'nama_kategori',
        'deskripsi',
        'file_template_path',
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
