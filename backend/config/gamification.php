<?php

return [
    /*
    |--------------------------------------------------------------------------
    | EXP Rewards
    |--------------------------------------------------------------------------
    | Semua nilai EXP yang diberikan untuk berbagai aksi.
    | Mudah di-tuning setelah testing tanpa ubah kode.
    */
    'exp' => [
        'quest_easy'              => 45,
        'quest_normal'            => 80,
        'quest_hard'              => 130,
        'focus_per_minute'        => 1.5,
        'check_in'                => 25,
        'check_out_base'          => 50,
        'check_out_per_quest'     => 30,
        'check_out_reflection'    => 40,
        'journal'                 => 35,
        'streak_bonus_per_day'    => 10,
    ],

    /*
    |--------------------------------------------------------------------------
    | Level Formula
    |--------------------------------------------------------------------------
    | EXP needed to reach level N = N^2 * multiplier
    | Level from EXP = floor(sqrt(EXP / multiplier)) + 1
    */
    'level' => [
        'multiplier' => 120,
    ],

    /*
    |--------------------------------------------------------------------------
    | Battle Power Weights
    |--------------------------------------------------------------------------
    | BP = (level * level_weight) + (streak * streak_weight) + ...
    */
    'battle_power' => [
        'level_weight'            => 260,
        'streak_weight'           => 145,
        'quest_completion_weight' => 18,
        'productivity_weight'     => 120,
        'focus_weight'            => 7,
    ],

    /*
    |--------------------------------------------------------------------------
    | Hunter Rank Thresholds (evaluated top-down, first match wins)
    |--------------------------------------------------------------------------
    */
    'ranks' => [
        'S' => ['min_level' => 20, 'min_bp' => 8000],
        'A' => ['min_level' => 15, 'min_bp' => 6000],
        'B' => ['min_level' => 10, 'min_bp' => 4200],
        'C' => ['min_level' => 7,  'min_bp' => 2800],
        'D' => ['min_level' => 4,  'min_bp' => 1500],
        'E' => ['min_level' => 0,  'min_bp' => 0],
    ],
];
