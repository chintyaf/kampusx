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
            // Kita gunakan snake_case untuk kolom database
            'is_in_person' => fake()->boolean(70), // 70% kemungkinan offline
            'is_online' => fake()->boolean(50),    // 50% kemungkinan online
            'is_featured' => fake()->boolean(20),  // 20% kemungkinan featured event
            'image' => "https://placehold.co/600x300/e2e8f0/64748b?text=Event+{$eventNumber}",
            // Format tanggal dimiripkan dengan mock data kamu: "March 26, 2026"
            'date' => fake()->dateTimeBetween('now', '+1 year')->format('F d, Y'),
            // Harga diacak antara gratis atau berbayar
            'price' => fake()->randomElement(['Free', 'Rp 50.000', 'Rp 100.000', 'Rp 150.000', 'Rp 250.000']),
            'location' => fake()->randomElement([fake()->city() . ', ID', 'Online']),
            'org' => fake()->company(),

            'organizer_id' => \App\Models\User::factory(),
        ];
    }
}