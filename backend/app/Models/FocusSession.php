<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Model;

class FocusSession extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'quest_id',
        'duration_minutes',
        'quest_title',
        'started_at',
        'completed_at',
        'date',
    ];

    protected function casts(): array
    {
        return [
            'duration_minutes' => 'integer',
            'started_at' => 'datetime',
            'completed_at' => 'datetime',
            'date' => 'date',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function quest(): BelongsTo
    {
        return $this->belongsTo(Quest::class);
    }
}
