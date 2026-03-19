<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreEventRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        // return false;
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        // Rule dasar (hanya title yang wajib)
        $rules = [
            'title' => 'required|string|max:200',
            'status' => 'nullable|in:draft,published',
            'description' => 'nullable|string',
            'location_type' => 'nullable|in:offline,online,hybrid',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
        ];

        // Jika user ingin langsung 'published', paksa field lain jadi 'required'
        if ($this->status === 'published') {
            $rules['description'] = 'required|string';
            $rules['location_type'] = 'required|in:offline,online,hybrid';
            $rules['start_date'] = 'required|date';
            $rules['end_date'] = 'required|date|after_or_equal:start_date';
        }

        return $rules;
    }

    protected function prepareForValidation()
    {
        $this->merge([
            'slug' => \Str::slug($this->title),
        ]);
    }
}
