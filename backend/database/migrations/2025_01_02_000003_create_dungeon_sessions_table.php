<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('dungeon_sessions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->date('date');
            $table->enum('status', ['active', 'completed'])->default('active');
            $table->timestamp('check_in_at');
            $table->timestamp('check_out_at')->nullable();
            $table->string('mood', 20)->nullable();
            $table->unsignedTinyInteger('energy')->nullable();
            $table->text('note')->nullable();
            $table->text('reflection')->nullable();
            $table->text('learning')->nullable();
            $table->unsignedTinyInteger('productivity')->nullable();
            $table->string('end_mood', 20)->nullable();
            $table->unsignedInteger('exp_earned')->default(0);
            $table->timestamps();

            $table->unique(['user_id', 'date']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('dungeon_sessions');
    }
};
