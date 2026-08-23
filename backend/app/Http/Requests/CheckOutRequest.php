<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CheckOutRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'reflection' => 'nullable|string|max:2000',
            'learning' => 'nullable|string|max:2000',
            'productivity' => 'required|integer|min:1|max:5',
            'end_mood' => 'required|string|in:Sangat baik,Baik,Biasa,Buruk,Sangat buruk',
        ];
    }
}
