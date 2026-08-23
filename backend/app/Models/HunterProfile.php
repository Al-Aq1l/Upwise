<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Model;

class HunterProfile extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'exp',
        'streak',
        'longest_streak',
        'battle_power',
        'level',
        'rank',
        'theme',
        'notifications',
    ];

    protected function casts(): array
    {
        return [
            'exp' => 'integer',
            'streak' => 'integer',
            'longest_streak' => 'integer',
            'battle_power' => 'integer',
            'level' => 'integer',
            'notifications' => 'array',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
