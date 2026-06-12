<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Pembayaran - KampusX</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }

        body {
            font-family: 'Inter', sans-serif;
            background: #f1f5f9;
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 16px;
            color: #0f172a;
        }

        .wrap { width: 100%; max-width: 420px; }

        /* Back */
        .back-btn {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            color: #64748b;
            font-size: 13px;
            font-weight: 500;
            text-decoration: none;
            margin-bottom: 16px;
            padding: 6px 0;
            border: none;
            background: none;
            cursor: pointer;
            transition: color .15s;
        }
        .back-btn:hover { color: #0f172a; }
        .back-btn svg { flex-shrink: 0; }

        /* Card */
        .card {
            background: #fff;
            border-radius: 16px;
            border: 1px solid #e2e8f0;
            overflow: hidden;
        }

        /* Sandbox pill */
        .card-header {
            background: #0f172a;
            padding: 14px 20px;
            display: flex;
            align-items: center;
            justify-content: space-between;
        }
        .brand { color: #fff; font-size: 15px; font-weight: 700; letter-spacing: -0.01em; }
        .sandbox-pill {
            display: inline-flex;
            align-items: center;
            gap: 5px;
            background: rgba(255,255,255,0.1);
            border: 1px solid rgba(255,255,255,0.2);
            color: #94a3b8;
            font-size: 10px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.07em;
            padding: 3px 9px;
            border-radius: 99px;
        }
        .dot {
            width: 5px; height: 5px;
            background: #38bdf8;
            border-radius: 50%;
            animation: blink 1.5s infinite;
        }
        @keyframes blink { 0%,100%{opacity:.3} 50%{opacity:1} }

        /* Amount */
        .amount-block {
            padding: 28px 24px 20px;
            border-bottom: 1px solid #f1f5f9;
            text-align: center;
        }
        .amount-label { font-size: 12px; color: #94a3b8; font-weight: 500; text-transform: uppercase; letter-spacing: .07em; margin-bottom: 6px; }
        .amount-value { font-size: 36px; font-weight: 700; color: #0f172a; letter-spacing: -0.03em; }
        .amount-value .rp { font-size: 18px; font-weight: 500; color: #64748b; margin-right: 2px; vertical-align: 5px; }

        /* Details */
        .details { padding: 0 24px; }
        .row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 13px 0;
            border-bottom: 1px solid #f1f5f9;
            gap: 16px;
        }
        .row:last-child { border-bottom: none; }
        .row-label { font-size: 13px; color: #64748b; white-space: nowrap; }
        .row-value { font-size: 13px; font-weight: 600; color: #0f172a; text-align: right; word-break: break-word; max-width: 60%; }
        .row-value.code {
            font-family: monospace;
            font-size: 12px;
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            padding: 2px 8px;
            border-radius: 5px;
            color: #0369a1;
        }

        /* Action */
        .action { padding: 20px 24px 24px; }

        .btn-pay {
            width: 100%;
            padding: 14px;
            background: #0f172a;
            color: #fff;
            border: none;
            border-radius: 10px;
            font-family: 'Inter', sans-serif;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            transition: background .15s, transform .1s;
        }
        .btn-pay:hover:not(:disabled) { background: #1e293b; }
        .btn-pay:active:not(:disabled) { transform: scale(0.99); }
        .btn-pay:disabled { opacity: .55; cursor: not-allowed; }

        .secure-note {
            text-align: center;
            font-size: 11px;
            color: #cbd5e1;
            margin-top: 10px;
        }

        /* Spinner */
        .spinner {
            width: 15px; height: 15px;
            border: 2px solid rgba(255,255,255,.3);
            border-top-color: #fff;
            border-radius: 50%;
            animation: spin .7s linear infinite;
            display: none;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        /* Success */
        .success-state {
            display: none;
            padding: 48px 24px;
            text-align: center;
            animation: fadeUp .35s ease both;
        }
        @keyframes fadeUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        .check-circle {
            width: 64px; height: 64px;
            background: #f0fdf4;
            border: 2px solid #bbf7d0;
            border-radius: 50%;
            display: flex; align-items: center; justify-content: center;
            margin: 0 auto 18px;
        }
        .success-title { font-size: 18px; font-weight: 700; color: #0f172a; margin-bottom: 6px; }
        .success-sub { font-size: 13px; color: #64748b; }
        .redirect-dots { display: flex; justify-content: center; gap: 5px; margin-top: 18px; }
        .redirect-dots span {
            width: 5px; height: 5px; background: #cbd5e1; border-radius: 50%;
            animation: dotpop 1.2s ease-in-out infinite;
        }
        .redirect-dots span:nth-child(2) { animation-delay: .2s; }
        .redirect-dots span:nth-child(3) { animation-delay: .4s; }
        @keyframes dotpop { 0%,80%,100%{opacity:.25;transform:scale(.8)} 40%{opacity:1;transform:scale(1.3)} }
    </style>
</head>
<body>

<div class="wrap">

    <button class="back-btn" onclick="history.back()">
        <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
            <polyline points="15 18 9 12 15 6"/>
        </svg>
        Kembali
    </button>

    <div class="card">

        <div class="card-header">
            <span class="brand">Konfirmasi Pembayaran</span>
            {{-- <span class="sandbox-pill"><span class="dot"></span>Sandbox</span> --}}
        </div>

        <!-- Invoice -->
        <div id="invoiceDetails">
            <div class="amount-block">
                <div class="amount-label">Total Tagihan</div>
                <div class="amount-value"><span class="rp">Rp</span>{{ number_format($order->amount, 0, ',', '.') }}</div>
            </div>

            <div class="details">
                <div class="row">
                    <span class="row-label">Order ID</span>
                    <span class="row-value code">{{ $order->order_id }}</span>
                </div>
                <div class="row">
                    <span class="row-label">Event</span>
                    <span class="row-value">{{ $order->event->title ?? 'Tidak Diketahui' }}</span>
                </div>
                <div class="row">
                    <span class="row-label">Nama Pemesan</span>
                    <span class="row-value">{{ $order->user->name ?? '-' }}</span>
                </div>
                <div class="row">
                    <span class="row-label">Email</span>
                    <span class="row-value">{{ $order->user->email ?? '-' }}</span>
                </div>
            </div>

            <div class="action">
                <button class="btn-pay" id="btnPay" onclick="simulatePayment()">
                    <span class="spinner" id="paySpinner"></span>
                    <span id="btnText">Simulasi Bayar Lunas</span>
                </button>
                {{-- <p class="secure-note">🔒 Transaksi simulator — tidak memproses data nyata</p> --}}
            </div>
        </div>

        <!-- Success -->
        <div class="success-state" id="successState">
            <div class="check-circle">
                <svg width="28" height="28" fill="none" stroke="#16a34a" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
                    <polyline points="20 6 9 17 4 12"/>
                </svg>
            </div>
            <div class="success-title">Pembayaran Lunas!</div>
            <div class="success-sub">Mengalihkan Anda kembali ke situs merchant…</div>
            <div class="redirect-dots"><span></span><span></span><span></span></div>
        </div>

    </div>
</div>

<script>
    async function simulatePayment() {
        const btnPay = document.getElementById('btnPay');
        const btnText = document.getElementById('btnText');
        const paySpinner = document.getElementById('paySpinner');
        const invoiceDetails = document.getElementById('invoiceDetails');
        const successState = document.getElementById('successState');

        btnPay.disabled = true;
        btnText.innerText = "Memproses...";
        paySpinner.style.display = "inline-block";

        try {
            const response = await fetch('/api/v1/payment/callback', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    order_id: '{{ $order->order_id }}'
                })
            });

            const data = await response.json();

            if (response.ok && data.status === 'success') {
                invoiceDetails.style.display = 'none';
                successState.style.display = 'block';

                setTimeout(() => {
                    const frontendUrl = "{{ config('app.frontend_url') }}";
                    const ticketCode = data.ticket_code;

                    if (ticketCode) {
                        window.location.href = `${frontendUrl}/ticket/${ticketCode}`;
                    } else {
                        window.location.href = `${frontendUrl}/my-tickets`;
                    }
                }, 2500);
            } else {
                alert('Gagal memproses pembayaran: ' + (data.message || 'Kesalahan sistem.'));
                resetBtn();
            }
        } catch (error) {
            console.error(error);
            alert('Terjadi kesalahan jaringan atau server.');
            resetBtn();
        }
    }

    function resetBtn() {
        const btnPay = document.getElementById('btnPay');
        const btnText = document.getElementById('btnText');
        const paySpinner = document.getElementById('paySpinner');

        btnPay.disabled = false;
        btnText.innerText = "Simulasi Bayar Lunas";
        paySpinner.style.display = "none";
    }
</script>
</body>
</html>
