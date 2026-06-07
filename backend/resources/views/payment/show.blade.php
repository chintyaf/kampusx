<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Pembayaran - KampusX</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
</head>
<body class="bg-light d-flex align-items-center min-vh-100 py-4">

    <div class="container" style="max-width: 850px;">
        <div class="card border-0 shadow-sm rounded-4 overflow-hidden">
            <div class="row g-0">
                
                <div class="col-md-5 bg-dark text-white p-4 p-md-5 d-flex flex-column justify-content-between">
                    <div>
                        <div class="d-flex justify-content-between align-items-center mb-5">
                            <img src="{{ asset('images/Logo_Light_KampusX.svg') }}" alt="Logo KampusX" style="width: 120px;">
                            {{-- <h5 class="fw-bold mb-0">Kampus<span class="text-primary">X</span></h5> --}}
                            <span class="badge text-bg-secondary">Simulator</span>
                        </div>

                        <div class="mb-4">
                            <p class="text-secondary small fw-bold mb-1 text-uppercase tracking-wide">Total Tagihan</p>
                            <h2 class="fw-bold mb-0 text-white">Rp{{ number_format($transaction->amount, 0, ',', '.') }}</h2>
                        </div>

                        <hr class="border-secondary opacity-50 mb-4">

                        <div class="vstack gap-3 small">
                            <div class="d-flex justify-content-between">
                                <span class="text-secondary">Item</span>
                                <span class="fw-semibold text-truncate ms-3" style="max-width: 150px;">{{ $transaction->item_name }}</span>
                            </div>
                            <div class="d-flex justify-content-between">
                                <span class="text-secondary">Order ID</span>
                                <span class="fw-bold text-primary">{{ $transaction->order_id }}</span>
                            </div>
                            <div class="d-flex justify-content-between">
                                <span class="text-secondary">Customer</span>
                                <span class="fw-semibold text-end ms-3">{{ $transaction->customer_name }}</span>
                            </div>
                        </div>
                    </div>

                    <div class="mt-5 p-3 rounded-3 bg-secondary bg-opacity-25 border border-secondary border-opacity-50 d-flex justify-content-between align-items-center">
                        <span class="text-secondary small fw-bold text-uppercase">Sisa Waktu</span>
                        <span class="fw-bold text-warning fs-5 font-monospace" id="countdown">15:00</span>
                    </div>
                </div>

                <div class="col-md-7 bg-white p-4 p-md-5">
                    <h4 class="fw-bold mb-1">Metode Pembayaran</h4>
                    <p class="text-muted small mb-4">Pilih opsi simulasi di bawah ini.</p>

                    <div id="expiredMessage" class="alert alert-danger d-none py-2 text-center small fw-bold mb-3">
                        Waktu Pembayaran Habis!
                    </div>

                    @if($transaction->isPending())
                        <div class="row g-2 mb-4">
                            <div class="col-4">
                                <button type="button" onclick="selectMethod('qris', this)" class="method-btn btn btn-outline-dark w-100 fw-semibold active">QRIS</button>
                            </div>
                            <div class="col-4">
                                <button type="button" onclick="selectMethod('bank', this)" class="method-btn btn btn-outline-dark w-100 fw-semibold">Bank VA</button>
                            </div>
                            <div class="col-4">
                                <button type="button" onclick="selectMethod('wallet', this)" class="method-btn btn btn-outline-dark w-100 fw-semibold">E-Wallet</button>
                            </div>
                        </div>

                        <div class="bg-light border rounded-3 p-4 mb-4 d-flex align-items-center justify-content-center" style="min-height: 180px;">
                            
                            <div id="panel-qris" class="text-center w-100">
                                <div class="d-inline-block p-2 bg-white border border-secondary rounded-3 mb-3 shadow-sm">
                                    {!! $qrSvg !!}
                                </div>
                                <p class="small fw-bold text-primary mb-0 text-uppercase">Scan QRIS Merchant</p>
                            </div>

                            <div id="panel-bank" class="d-none w-100">
                                <p class="text-muted small fw-bold text-uppercase mb-2">BCA Simulator Transfer</p>
                                <div class="input-group">
                                    <input type="text" class="form-control fw-bold font-monospace text-dark bg-white fs-5" value="8039201938472910" readonly>
                                    <button class="btn btn-dark fw-bold px-4" type="button" onclick="alert('Virtual Account disalin!')">Copy</button>
                                </div>
                            </div>

                            <div id="panel-wallet" class="d-none text-center w-100">
                                <div class="d-flex justify-content-center gap-2 mb-3">
                                    <span class="badge text-bg-success px-4 py-2 fs-6 rounded-pill">GoPay</span>
                                    <span class="badge px-4 py-2 fs-6 rounded-pill text-white" style="background-color: #4B0082;">OVO</span>
                                </div>
                                <p class="text-muted small mb-0">Masukkan nomor HP saat tombol bayar ditekan.</p>
                            </div>
                        </div>

                        <form action="{{ url('/payment/' . $transaction->token . '/confirm') }}" method="POST" id="confirmForm" class="mb-3">
                            @csrf
                            <button type="submit" class="btn btn-primary w-100 py-3 fw-bold rounded-3 fs-6" id="btnPay">Bayar Sekarang</button>
                        </form>
                        
                        <form action="{{ url('/payment/' . $transaction->token . '/cancel') }}" method="POST" id="cancelForm" class="text-center">
                            @csrf
                            <button type="submit" class="btn btn-link text-danger text-decoration-none small fw-semibold">Batalkan Pembayaran</button>
                        </form>
                    @else
                        <div class="bg-light border rounded-3 p-4 mb-4 text-center d-flex flex-column justify-content-center align-items-center" style="min-height: 200px;">
                            @if($transaction->isSuccess())
                                <div class="text-success display-4 mb-2">✅</div>
                                <h5 class="text-success fw-bold">Pembayaran Sukses!</h5>
                                <p class="text-muted small mb-0">Transaksi lunas diproses merchant.</p>
                            @elseif($transaction->isFailed())
                                <div class="text-danger display-4 mb-2">❌</div>
                                <h5 class="text-danger fw-bold">Dibatalkan</h5>
                                <p class="text-muted small mb-0">Sesi dibatalkan secara manual.</p>
                            @else
                                <div class="text-secondary display-4 mb-2">⚠️</div>
                                <h5 class="text-secondary fw-bold">Kedaluwarsa</h5>
                                <p class="text-muted small mb-0">Waktu pembayaran telah habis.</p>
                            @endif
                        </div>
                        @php
                            $fallbackUrl = config('app.frontend_url');
                            $targetUrl = $fallbackUrl;
                            
                            // Find the event slug from the order to go back to the source event page
                            $order = \App\Models\Order::with('event')->where('order_id', $transaction->order_id)->first();
                            if ($order && $order->event && $order->event->slug) {
                                $targetUrl = $fallbackUrl . '/event/' . $order->event->slug;
                            }
                            
                            if ($transaction->isSuccess()) {
                                $targetUrl = $transaction->redirect_url ?: $fallbackUrl;
                            }
                        @endphp
                        <a href="{{ $targetUrl }}" class="btn btn-dark w-100 py-3 fw-bold rounded-3">
                            {{ $transaction->isSuccess() ? 'Lihat Tiket Saya' : 'Kembali ke Event' }}
                        </a>
                    @endif
                </div>
            </div>
        </div>
    </div>

    <script>
        @if($transaction->isPending())
            const expiredAt = new Date("{{ $transaction->expired_at->toIso8601String() }}").getTime();

            function updateTimer() {
                const now = new Date().getTime();
                const diff = expiredAt - now;

                if (diff <= 0) {
                    document.getElementById('countdown').innerHTML = "EXPIRED";
                    document.getElementById('countdown').classList.replace('text-warning', 'text-danger');
                    
                    const btnPay = document.getElementById('btnPay');
                    if (btnPay) btnPay.disabled = true;
                    
                    document.getElementById('expiredMessage').classList.remove('d-none');
                    
                    setTimeout(() => { window.location.reload(); }, 2000);
                    return;
                }

                const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((diff % (1000 * 60)) / 1000);

                document.getElementById('countdown').innerHTML = 
                    (minutes < 10 ? "0" : "") + minutes + ":" + (seconds < 10 ? "0" : "") + seconds;
            }

            setInterval(updateTimer, 1000);
            updateTimer();

            function selectMethod(method, btnElement) {
                // Hapus state active dari semua tombol
                document.querySelectorAll('.method-btn').forEach(btn => btn.classList.remove('active'));
                
                // Sembunyikan semua panel
                document.getElementById('panel-qris').classList.add('d-none');
                document.getElementById('panel-bank').classList.add('d-none');
                document.getElementById('panel-wallet').classList.add('d-none');

                // Aktifkan tombol dan panel yang dipilih
                btnElement.classList.add('active');
                document.getElementById('panel-' + method).classList.remove('d-none');
            }

            @if(request()->query('source') !== 'qr')
                // Real-time status polling every 3 seconds
                let isRedirecting = false;
                
                function pollStatus() {
                    if (isRedirecting) return;
                    
                    fetch('{{ url("/payment/" . $transaction->token . "/status") }}', {
                        headers: {
                            'Accept': 'application/json'
                        }
                    })
                    .then(response => response.json())
                    .then(data => {
                        if (isRedirecting) return;
                        
                        const status = data.status;
                        const redirectBase = '{{ $transaction->redirect_url ?: config("app.frontend_url") . "/ticket/" }}';
                        
                        if (status === 'success' || status === 'failed' || status === 'expired') {
                            isRedirecting = true;
                            clearInterval(pollInterval);
                            
                            const separator = redirectBase.includes('?') ? '&' : '?';
                            const finalUrl = redirectBase + separator + 'status=' + status + '&token={{ $transaction->token }}';
                            
                            window.location.href = finalUrl;
                        }
                    })
                    .catch(err => console.error('Error polling status:', err));
                }

                const pollInterval = setInterval(pollStatus, 3000);
            @endif
        @endif
    </script>
</body>
</html>