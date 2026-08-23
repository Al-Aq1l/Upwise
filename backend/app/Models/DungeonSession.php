<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Model;

class DungeonSession extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'date',
        'status',
        'check_in_at',
        'check_out_at',
        'mood',
        'energy',
        'note',
        'reflection',
        'learning',
        'productivity',
        'end_mood',
        'exp_earned',
    ];

    protected function casts(): array
    {
        return [
            'date' => 'date',
            'check_in_at' => 'datetime',
            'check_out_at' => 'datetime',
            'energy' => 'integer',
            'productivity' => 'integer',
            'exp_earned' => 'integer',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function quests(): HasMany
    {
        return $this->hasMany(Quest::class);
    }
}
