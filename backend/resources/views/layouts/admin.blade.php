<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>@yield('title', 'Admin Dashboard') - KampusX</title>
    <!-- Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
    <!-- Tailwind CSS CDN -->
    <script src="https://cdn.tailwindcss.com"></script>
    <script>
        tailwind.config = {
            theme: {
                extend: {
                    fontFamily: {
                        sans: ['Plus Jakarta Sans', 'sans-serif'],
                        outfit: ['Outfit', 'sans-serif'],
                    },
                }
            }
        }
    </script>
    <style>
        body {
            font-family: 'Plus Jakarta Sans', sans-serif;
            background-color: #0b0f19;
            color: #f8fafc;
        }
        .sidebar-glass {
            background: rgba(15, 23, 42, 0.45);
            backdrop-filter: blur(16px);
            border-right: 1px solid rgba(255, 255, 255, 0.05);
        }
        .card-glass {
            background: rgba(30, 41, 59, 0.35);
            backdrop-filter: blur(12px);
            border: 1px solid rgba(255, 255, 255, 0.05);
        }
        /* Custom scrollbar */
        ::-webkit-scrollbar {
            width: 6px;
            height: 6px;
        }
        ::-webkit-scrollbar-track {
            background: #0f172a;
        }
        ::-webkit-scrollbar-thumb {
            background: #334155;
            border-radius: 99px;
        }
        ::-webkit-scrollbar-thumb:hover {
            background: #475569;
        }
    </style>
    @yield('styles')
</head>
<body class="min-h-screen flex flex-col bg-[#080d1a] selection:bg-indigo-500 selection:text-white">

    <div class="flex flex-1 overflow-hidden">
        <!-- Sidebar -->
        <aside class="sidebar-glass w-72 hidden lg:flex flex-col shrink-0">
            <!-- Brand Logo -->
            <div class="h-20 flex items-center px-8 border-b border-white/[0.05]">
                <a href="#" class="flex items-center gap-3">
                    <div class="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-violet-600 flex items-center justify-center font-outfit font-extrabold text-white text-lg shadow-lg shadow-indigo-500/20">
                        KX
                    </div>
                    <div>
                        <span class="font-outfit font-bold text-white tracking-wide text-lg">Kampus<span class="text-indigo-400">X</span></span>
                        <span class="block text-[10px] text-slate-400 font-semibold tracking-wider uppercase -mt-1">Simulator Panel</span>
                    </div>
                </a>
            </div>

            <!-- Navigation Links -->
            <nav class="flex-1 py-8 px-4 space-y-1.5 overflow-y-auto">
                <div class="px-4 mb-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Simulator Menu</div>
                
                <a href="/admin/payment" class="flex items-center gap-3.5 px-4 py-3 rounded-xl transition-all duration-200 group text-indigo-400 bg-indigo-500/[0.08] font-medium border border-indigo-500/10">
                    <svg class="w-5 h-5 transition-transform duration-200 group-hover:scale-110" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Payment Gateway</span>
                </a>

                <a href="/payment-sandbox/ORD-1" class="flex items-center gap-3.5 px-4 py-3 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.04] transition-all duration-200 group">
                    <svg class="w-5 h-5 transition-transform duration-200 group-hover:scale-110" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                    </svg>
                    <span>Sandbox Sandbox</span>
                </a>
            </nav>

            <!-- User Profile / Exits -->
            <div class="p-6 border-t border-white/[0.05] flex items-center justify-between">
                <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center font-bold text-indigo-400 border border-white/10">
                        A
                    </div>
                    <div>
                        <span class="block text-sm font-semibold text-white">Administrator</span>
                        <span class="block text-[11px] text-indigo-400">Super Admin</span>
                    </div>
                </div>
                <button onclick="window.location.href='/'" class="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all duration-200" title="Keluar ke Web Utama">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                </button>
            </div>
        </aside>

        <!-- Main Wrapper -->
        <div class="flex-1 flex flex-col overflow-y-auto">
            <!-- Header -->
            <header class="h-20 flex items-center justify-between px-8 border-b border-white/[0.05] bg-[#0b0f19]/80 backdrop-blur-md sticky top-0 z-30">
                <div class="flex items-center gap-4 lg:hidden">
                    <div class="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-violet-600 flex items-center justify-center font-outfit font-extrabold text-white text-lg">
                        KX
                    </div>
                    <span class="font-outfit font-bold text-white tracking-wide">KampusX</span>
                </div>

                <div class="hidden lg:flex items-center gap-2 text-slate-400 text-sm">
                    <span class="font-semibold text-white">Dashboard</span>
                    <span>/</span>
                    <span>Simulator</span>
                    <span>/</span>
                    <span class="text-indigo-400 font-medium">Payment Logs</span>
                </div>

                <!-- Right Header Tools -->
                <div class="flex items-center gap-4">
                    <div class="flex items-center gap-2 bg-slate-900 border border-white/5 rounded-full px-4 py-1.5 shadow-inner">
                        <span class="relative flex h-2.5 w-2.5">
                            <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span class="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                        </span>
                        <span class="text-xs font-semibold text-emerald-400 uppercase tracking-widest font-outfit">Live Simulator</span>
                    </div>
                </div>
            </header>

            <!-- Content Area -->
            <main class="flex-1 p-8 max-w-7xl w-full mx-auto">
                @yield('content')
            </main>

            <!-- Footer -->
            <footer class="h-16 flex items-center justify-center border-t border-white/[0.05] text-xs text-slate-500 px-8">
                &copy; 2026 KampusX Simulator. Designed for high fidelity testing.
            </footer>
        </div>
    </div>

    @yield('scripts')
</body>
</html>
