@extends('layouts.admin')

@section('title', 'Simulator Payment Gateway Dashboard')

@section('content')
<div class="space-y-8 animate-fade-in">
    <!-- Header Block -->
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
            <h1 class="font-outfit font-extrabold text-3xl tracking-tight text-white">Payment Simulator Logs</h1>
            <p class="text-slate-400 mt-1">Pantau dan kelola simulasi transaksi pembayaran yang masuk ke Merchant Server.</p>
        </div>
        <div class="flex gap-3">
            <form action="{{ url('/payment/expire') }}" method="GET" class="inline">
                <button type="submit" class="flex items-center gap-2 px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-semibold text-sm rounded-xl border border-white/[0.08] transition-all duration-200">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Check Expirations</span>
                </button>
            </form>
        </div>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <!-- Card: Total Volume -->
        <div class="card-glass p-6 rounded-2xl flex items-center justify-between shadow-xl">
            <div class="space-y-2">
                <span class="text-xs font-bold text-slate-400 uppercase tracking-wider block">Total Volume</span>
                <span class="text-2xl font-extrabold text-indigo-400 font-outfit block">Rp{{ number_format($totalVolume, 0, ',', '.') }}</span>
            </div>
            <div class="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 text-indigo-400">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
            </div>
        </div>

        <!-- Card: Success Rate -->
        <div class="card-glass p-6 rounded-2xl flex items-center justify-between shadow-xl">
            <div class="space-y-2">
                <span class="text-xs font-bold text-slate-400 uppercase tracking-wider block">Success Rate</span>
                <span class="text-2xl font-extrabold text-emerald-400 font-outfit block">{{ number_format($successRate, 1) }}%</span>
            </div>
            <div class="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 text-emerald-400">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            </div>
        </div>

        <!-- Card: Pending Count -->
        <div class="card-glass p-6 rounded-2xl flex items-center justify-between shadow-xl">
            <div class="space-y-2">
                <span class="text-xs font-bold text-slate-400 uppercase tracking-wider block">Pending Checkout</span>
                <span class="text-2xl font-extrabold text-amber-400 font-outfit block">{{ $pendingCount }}</span>
            </div>
            <div class="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20 text-amber-400">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            </div>
        </div>

        <!-- Card: Total Sessions -->
        <div class="card-glass p-6 rounded-2xl flex items-center justify-between shadow-xl">
            <div class="space-y-2">
                <span class="text-xs font-bold text-slate-400 uppercase tracking-wider block">Total Sessions</span>
                <span class="text-2xl font-extrabold text-slate-300 font-outfit block">{{ $totalCount }}</span>
            </div>
            <div class="w-12 h-12 rounded-xl bg-slate-500/10 flex items-center justify-center border border-slate-500/20 text-slate-400">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
            </div>
        </div>
    </div>

    <!-- Logs Table -->
    <div class="card-glass rounded-2xl overflow-hidden shadow-xl">
        <div class="px-8 py-5 border-b border-white/[0.05] flex items-center justify-between">
            <h3 class="font-outfit font-bold text-lg text-white">Simulated Transactions</h3>
            <span class="text-xs text-slate-400 font-medium">Menampilkan transaksi terbaru</span>
        </div>
        
        <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse">
                <thead>
                    <tr class="bg-white/[0.02] border-b border-white/[0.05] text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                        <th class="px-8 py-4">Transaction Token</th>
                        <th class="px-6 py-4">Order ID</th>
                        <th class="px-6 py-4">Customer Info</th>
                        <th class="px-6 py-4">Item Name</th>
                        <th class="px-6 py-4">Amount</th>
                        <th class="px-6 py-4">Status</th>
                        <th class="px-6 py-4">Created At</th>
                        <th class="px-8 py-4 text-center">Actions</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-white/[0.03] text-sm text-slate-300">
                    @forelse($transactions as $transaction)
                        <tr class="hover:bg-white/[0.01] transition-all duration-150">
                            <!-- Token -->
                            <td class="px-8 py-4 font-mono text-indigo-400 font-medium text-xs">
                                {{ $transaction->token }}
                            </td>
                            <!-- Order ID -->
                            <td class="px-6 py-4">
                                <span class="px-2.5 py-1 rounded bg-slate-900 border border-white/5 font-mono text-slate-300 text-xs">
                                    {{ $transaction->order_id }}
                                </span>
                            </td>
                            <!-- Customer Info -->
                            <td class="px-6 py-4">
                                <div class="font-semibold text-white">{{ $transaction->customer_name }}</div>
                                <div class="text-xs text-slate-400">{{ $transaction->customer_email }}</div>
                            </td>
                            <!-- Item Name -->
                            <td class="px-6 py-4 truncate max-w-[150px]">
                                {{ $transaction->item_name }}
                            </td>
                            <!-- Amount -->
                            <td class="px-6 py-4 font-semibold text-slate-200">
                                Rp{{ number_format($transaction->amount, 0, ',', '.') }}
                            </td>
                            <!-- Status -->
                            <td class="px-6 py-4">
                                @if($transaction->status === 'success')
                                    <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                        <span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                                        <span>Success</span>
                                    </span>
                                @elseif($transaction->status === 'pending')
                                    <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                                        <span class="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                                        <span>Pending</span>
                                    </span>
                                @elseif($transaction->status === 'failed')
                                    <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                                        <span class="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
                                        <span>Failed</span>
                                    </span>
                                @else
                                    <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-500/10 text-slate-400 border border-slate-500/20">
                                        <span class="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                                        <span>Expired</span>
                                    </span>
                                @endif
                            </td>
                            <!-- Created At -->
                            <td class="px-6 py-4 text-xs text-slate-400">
                                {{ $transaction->created_at->format('d M Y, H:i') }}
                            </td>
                            <!-- Actions -->
                            <td class="px-8 py-4 text-center">
                                <a href="{{ url('/payment/' . $transaction->token) }}" class="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-500/10 hover:bg-indigo-500 text-indigo-400 hover:text-white border border-indigo-500/15 transition-all duration-200" title="Buka Halaman Pembayaran">
                                    <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                    </svg>
                                </a>
                            </td>
                        </tr>
                    @empty
                        <tr>
                            <td colspan="8" class="px-8 py-12 text-center text-slate-500 font-medium">
                                <svg class="w-10 h-10 mx-auto text-slate-600 mb-3" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2v-4a2 2 0 012-2m16 0h-2M4 13H2m12 0h2m-6 0H8" />
                                </svg>
                                Belum ada transaksi yang disimulasikan.
                            </td>
                        </tr>
                    @endforelse
                </tbody>
            </table>
        </div>

        @if($transactions->hasPages())
            <div class="px-8 py-5 border-t border-white/[0.05] bg-white/[0.01]">
                {{ $transactions->links() }}
            </div>
        @endif
    </div>

    <!-- Security Signature Tools Info Card -->
    <div class="card-glass p-8 rounded-2xl shadow-xl space-y-4">
        <div class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-lg bg-indigo-500/15 flex items-center justify-center border border-indigo-500/20 text-indigo-400">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
            </div>
            <h3 class="font-outfit font-bold text-lg text-white">Webhook Signature Verification Details</h3>
        </div>
        <p class="text-sm text-slate-400 leading-relaxed">
            Setiap webhook disiarkan secara asinkronus ke <code class="px-1.5 py-0.5 rounded bg-slate-900 border border-white/5 font-mono text-indigo-400 text-xs">callback_url</code> dengan header kustom <code class="px-1.5 py-0.5 rounded bg-slate-900 border border-white/5 font-mono text-indigo-400 text-xs">X-Simulator-Signature</code>. Hal ini untuk memastikan integritas data bahwa data berasal dari sistem simulator ini.
        </p>
        <div class="bg-[#0f172a] rounded-xl border border-white/[0.05] p-5 space-y-2">
            <span class="block text-xs font-bold text-indigo-400 uppercase tracking-widest">Algoritma Signature (SHA256 HMAC)</span>
            <pre class="text-xs font-mono text-slate-300 overflow-x-auto py-1">X-Simulator-Signature: hash_hmac('sha256', json_encode($webhookPayload), env('PAYMENT_SECRET_KEY'))</pre>
            <span class="block text-xs text-slate-500 mt-2">Pastikan secret key Anda di file <code class="px-1 py-0.5 rounded bg-slate-900 font-mono text-slate-400 text-xs">.env</code> merchant sama dengan <code class="px-1 py-0.5 rounded bg-slate-900 font-mono text-indigo-400 text-xs">PAYMENT_SECRET_KEY</code> simulator untuk proses verifikasi.</span>
        </div>
    </div>
</div>
@endsection
