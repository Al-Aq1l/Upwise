<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreFocusSessionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'quest_id' => 'nullable|integer|exists:quests,id',
            'quest_title' => 'nullable|string|max:255',
            'duration_minutes' => 'required|integer|min:5|max:120',
        ];
    }
}
