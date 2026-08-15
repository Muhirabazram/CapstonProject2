<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LetterRequirement extends Model
{
    use HasFactory;

    protected $fillable = [
        'category_id',
        'nama_syarat',
        'tipe_file',
    ];

    public function category()
    {
        return $this->belongsTo(LetterCategory::class, 'category_id');
    }
}
