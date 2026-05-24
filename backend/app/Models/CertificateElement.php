<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class CertificateElement extends Model
{
    use HasFactory;

    protected $fillable = [
        'template_id',
        'element_type',
        'position_x',
        'position_y',
        'font_size',
        'font_color',
        'font_family',
        'text_align',
        'custom_value',
    ];

    protected $casts = [
        'position_x' => 'float',
        'position_y' => 'float',
        'font_size' => 'integer',
    ];

    /**
     * Get the template that owns the element.
     */
    public function template(): BelongsTo
    {
        return $this->belongsTo(CertificateTemplate::class, 'template_id');
    }
}
