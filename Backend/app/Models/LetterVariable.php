<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LetterVariable extends Model
{
    use HasFactory;

    protected $fillable = [
        'category_id',
        'nama_variabel',
        'tipe_input_html',
    ];

    public function category()
    {
        return $this->belongsTo(LetterCategory::class, 'category_id');
    }
}
