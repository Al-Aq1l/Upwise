<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\HunterProfile;
use Illuminate\Database\Seeder;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        $user = User::create([
            'name' => 'Sung Jin-Woo',
            'email' => 'hunter@solo.local',
            'title' => 'Shadow Hunter',
            'password' => bcrypt('hunter123'),
        ]);

        HunterProfile::create([
            'user_id' => $user->id,
            'exp' => 0,
            'streak' => 0,
            'longest_streak' => 0,
            'battle_power' => 0,
            'level' => 1,
            'rank' => 'E',
            'theme' => 'dark',
            'notifications' => [
                'checkIn' => true,
                'checkOut' => true,
                'quest' => false,
            ],
        ]);
    }
}
