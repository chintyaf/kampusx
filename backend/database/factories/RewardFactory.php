<?php

namespace Database\Factories;

use App\Models\Reward;
use Illuminate\Database\Eloquent\Factories\Factory;

class RewardFactory extends Factory
{
    protected $model = Reward::class;

    public function definition(): array
    {
        return [
            'event_id'      => null,
            'title'         => $this->faker->words(3, true),
            'description'   => $this->faker->sentence(),
            'points_cost'   => $this->faker->numberBetween(50, 500),
            'stock'         => 10,
            'limit_per_user'=> null,
            'image_path'    => null,
            'reward_type'   => 'digital',
            'type'          => 'global',
            'is_active'     => true,
        ];
    }
}
