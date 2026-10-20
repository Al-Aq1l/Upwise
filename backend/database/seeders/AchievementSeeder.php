<?php

namespace Database\Seeders;

use App\Models\Achievement;
use Illuminate\Database\Seeder;

class AchievementSeeder extends Seeder
{
    public function run(): void
    {
        $achievements = [
            [
                'name' => 'First Gate Cleared',
                'description' => 'Selesaikan quest pertama.',
                'condition_type' => 'quest_completed_total',
                'condition_value' => 1,
                'badge_icon' => 'sword',
            ],
            [
                'name' => 'Dungeon Discipline',
                'description' => 'Capai streak 7 hari berturut-turut.',
                'condition_type' => 'streak',
                'condition_value' => 7,
                'badge_icon' => 'flame',
            ],
            [
                'name' => 'Awakened Hunter',
                'description' => 'Naik ke Level 5.',
                'condition_type' => 'level',
                'condition_value' => 5,
                'badge_icon' => 'sparkles',
            ],
            [
                'name' => 'Iron Lifter',
                'description' => 'Selesaikan 10 sesi latihan gym.',
                'condition_type' => 'dungeon_sessions_total',
                'condition_value' => 10,
                'badge_icon' => 'sword',
            ],
            [
                'name' => 'Workout Warrior',
                'description' => 'Selesaikan 25 quest latihan gym.',
                'condition_type' => 'quest_completed_total',
                'condition_value' => 25,
                'badge_icon' => 'target',
            ],
            [
                'name' => 'Quest Machine',
                'description' => 'Selesaikan 50 quest total.',
                'condition_type' => 'quest_completed_total',
                'condition_value' => 50,
                'badge_icon' => 'target',
            ],
            [
                'name' => 'Iron Will',
                'description' => 'Capai streak gym 14 hari berturut-turut.',
                'condition_type' => 'streak',
                'condition_value' => 14,
                'badge_icon' => 'shield',
            ],
            [
                'name' => 'Shadow Monarch',
                'description' => 'Naik ke Level 10 Hunter.',
                'condition_type' => 'level',
                'condition_value' => 10,
                'badge_icon' => 'crown',
            ],
            [
                'name' => 'Heavy Duty Monarch',
                'description' => 'Capai streak gym 30 hari.',
                'condition_type' => 'streak',
                'condition_value' => 30,
                'badge_icon' => 'trophy',
            ],
            [
                'name' => 'S-Rank Candidate',
                'description' => 'Lewati 8.000 Battle Power.',
                'condition_type' => 'battle_power',
                'condition_value' => 8000,
                'badge_icon' => 'zap',
            ],
            [
                'name' => 'Arise!',
                'description' => 'Naik ke Level 20.',
                'condition_type' => 'level',
                'condition_value' => 20,
                'badge_icon' => 'swords',
            ],
            [
                'name' => 'Dungeon Master',
                'description' => 'Selesaikan 30 sesi dungeon.',
                'condition_type' => 'dungeon_sessions_total',
                'condition_value' => 30,
                'badge_icon' => 'castle',
            ],
        ];

        foreach ($achievements as $achievement) {
            Achievement::updateOrCreate(
                ['name' => $achievement['name']],
                $achievement
            );
        }
    }
}
