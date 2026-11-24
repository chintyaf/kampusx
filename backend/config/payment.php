<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Default Payment Provider
    |--------------------------------------------------------------------------
    |
    | Provider pembayaran default yang aktif pada sistem.
    | Contoh: 'duitku', 'simulator'
    |
    */
    'default' => env('PAYMENT_PROVIDER', 'duitku'),

    /*
    |--------------------------------------------------------------------------
    | Payment Mode
    |--------------------------------------------------------------------------
    |
    | Mode gateway: 'sandbox' (testing) atau 'production' (live).
    | Default mode selalu 'sandbox' untuk keamanan pengembangan.
    |
    */
    'mode' => env('PAYMENT_MODE', 'sandbox'),

    /*
    |--------------------------------------------------------------------------
    | Hold / Expiry Time (Menit)
    |--------------------------------------------------------------------------
    |
    | Durasi penguncian kuota kursi dan batas waktu invoice sebelum kedaluwarsa.
    | Default: 15 menit.
    |
    */
    'hold_minutes' => (int) env('PAYMENT_HOLD_MINUTES', 15),

    /*
    |--------------------------------------------------------------------------
    | Provider Configurations
    |--------------------------------------------------------------------------
    |
    | Konfigurasi spesifik per payment gateway provider.
    |
    */
    'providers' => [
        'duitku' => [
            // Mode Sandbox (Duitku POP API)
            'sandbox' => [
                'merchant_code' => env('DUITKU_MERCHANT_CODE', ''),
                'api_key'       => env('DUITKU_API_KEY', ''),
                
                //sandbox
                'inquiry_url' => 'https://api-sandbox.duitku.com/api/merchant/createInvoice',
                //production
                // 'inquiry_url' => 'https://api-prod.duitku.com/api/merchant/createInvoice',

                // 'inquiry_url'   => 'https://sandbox.duitku.com/webapi/api/merchant/v2/inquiry',
                'status_url'    => 'https://sandbox.duitku.com/webapi/api/merchant/transactionStatus',
            ],

            // Mode Production (Live Gateway)
            'production' => [
                'merchant_code' => env('DUITKU_MERCHANT_CODE', ''),
                'api_key'       => env('DUITKU_API_KEY', ''),
                'inquiry_url'   => 'https://passport.duitku.com/webapi/api/merchant/v2/inquiry',
                'status_url'    => 'https://passport.duitku.com/webapi/api/merchant/transactionStatus',
            ],

            // URLs Callback & Return
            'callback_url' => env('DUITKU_CALLBACK_URL', rtrim(env('APP_URL', 'http://127.0.0.1:8000'), '/') . '/api/payment/callback/duitku'),
            'return_url'   => env('DUITKU_RETURN_URL', rtrim(env('FRONTEND_URL', 'http://localhost:5173'), '/') . '/checkout/result'),
        ],
    ],
];
