<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('daily_stats', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->date('date');
            $table->unsignedInteger('total_exp_earned')->default(0);
            $table->unsignedInteger('quests_completed')->default(0);
            $table->unsignedInteger('quests_total')->default(0);
            $table->unsignedInteger('focus_minutes')->default(0);
            $table->unsignedTinyInteger('productivity_score')->nullable();
            $table->timestamps();

            $table->unique(['user_id', 'date']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('daily_stats');
    }
};
