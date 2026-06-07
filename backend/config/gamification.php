<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Gamification Configuration Settings
    |--------------------------------------------------------------------------
    |
    | Here you can configure the conversion ratio from event local points to 
    | global points.
    |
    */

    'local_to_global_ratio' => (int) env('LOCAL_TO_GLOBAL_RATIO', 10),
];
