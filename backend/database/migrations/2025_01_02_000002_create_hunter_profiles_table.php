<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('hunter_profiles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->unsignedBigInteger('exp')->default(0);
            $table->unsignedInteger('streak')->default(0);
            $table->unsignedInteger('longest_streak')->default(0);
            $table->unsignedBigInteger('battle_power')->default(0);
            $table->unsignedInteger('level')->default(1);
            $table->string('rank', 2)->default('E');
            $table->string('theme', 10)->default('dark');
            $table->json('notifications')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('hunter_profiles');
    }
};
