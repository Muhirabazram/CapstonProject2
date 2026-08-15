<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LetterRequestRequirement extends Model
{
    use HasFactory;

    protected $fillable = [
        'request_id',
        'requirement_id',
        'file_path',
    ];

    public function request()
    {
        return $this->belongsTo(LetterRequest::class, 'request_id');
    }

    public function requirement()
    {
        return $this->belongsTo(LetterRequirement::class, 'requirement_id');
    }
}
