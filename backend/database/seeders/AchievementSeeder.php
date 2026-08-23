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
                'name' => 'Scholar of Shadows',
                'description' => 'Tulis 5 entri jurnal.',
                'condition_type' => 'journal_count',
                'condition_value' => 5,
                'badge_icon' => 'book-open',
            ],
            [
                'name' => 'Focus Blade',
                'description' => 'Kumpulkan 120 menit fokus.',
                'condition_type' => 'focus_minutes_total',
                'condition_value' => 120,
                'badge_icon' => 'timer',
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
                'description' => 'Capai streak 14 hari.',
                'condition_type' => 'streak',
                'condition_value' => 14,
                'badge_icon' => 'shield',
            ],
            [
                'name' => 'Shadow Monarch',
                'description' => 'Naik ke Level 10.',
                'condition_type' => 'level',
                'condition_value' => 10,
                'badge_icon' => 'crown',
            ],
            [
                'name' => 'Time Mage',
                'description' => 'Kumpulkan 500 menit fokus.',
                'condition_type' => 'focus_minutes_total',
                'condition_value' => 500,
                'badge_icon' => 'clock',
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
