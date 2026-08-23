<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Model;

class DailyStat extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'date',
        'total_exp_earned',
        'quests_completed',
        'quests_total',
        'focus_minutes',
        'productivity_score',
    ];

    protected function casts(): array
    {
        return [
            'date' => 'date',
            'total_exp_earned' => 'integer',
            'quests_completed' => 'integer',
            'quests_total' => 'integer',
            'focus_minutes' => 'integer',
            'productivity_score' => 'integer',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
