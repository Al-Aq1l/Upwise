<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('journals', function (Blueprint $table) {
            if (!Schema::hasColumn('journals', 'date')) {
                $table->date('date')->nullable();
            }
            if (!Schema::hasColumn('journals', 'mood')) {
                $table->string('mood', 20)->nullable()->default('Baik');
            }
        });
    }

    public function down(): void
    {
        Schema::table('journals', function (Blueprint $table) {
            if (Schema::hasColumn('journals', 'date')) {
                $table->dropColumn('date');
            }
            if (Schema::hasColumn('journals', 'mood')) {
                $table->dropColumn('mood');
            }
        });
    }
};
