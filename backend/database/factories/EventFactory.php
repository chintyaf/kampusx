<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

class EventFactory extends Factory
{
    public function definition(): array
    {
        // Generate teks gambar dengan angka unik
        $eventNumber = fake()->unique()->numberBetween(1, 1000);

        return [
            'title' => fake()->catchPhrase() . ' Conference',
            'slug' => fake()->unique()->slug(),
            'description' => fake()->paragraph(),
            'is_featured' => fake()->boolean(20),
            'image_path' => "https://placehold.co/600x300/e2e8f0/64748b?text=Event+{$eventNumber}",
            'start_date' => fake()->dateTimeBetween('now', '+1 month'),
            'end_date' => fake()->dateTimeBetween('+1 month', '+2 months'),
            'timezone' => 'Asia/Jakarta',
            'status' => 'draft',
            'organizer_id' => \App\Models\User::factory(),
        ];
    }
}