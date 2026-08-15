<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LetterRequestValue extends Model
{
    use HasFactory;

    protected $fillable = [
        'request_id',
        'variable_id',
        'nilai_isian',
    ];

    public function request()
    {
        return $this->belongsTo(LetterRequest::class, 'request_id');
    }

    public function variable()
    {
        return $this->belongsTo(LetterVariable::class, 'variable_id');
    }
}
