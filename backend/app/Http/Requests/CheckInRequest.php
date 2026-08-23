<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CheckInRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'mood' => 'required|string|in:Sangat baik,Baik,Biasa,Buruk,Sangat buruk',
            'energy' => 'required|integer|min:1|max:5',
            'note' => 'nullable|string|max:1000',
        ];
    }
}
