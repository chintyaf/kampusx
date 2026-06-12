import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

// https://vite.dev/config/
export default defineConfig({
	plugins: [react(), tailwindcss()],
	resolve: {
		alias: {
			// Mapping @ ke folder src
			'@': path.resolve(__dirname, './src'),
		},
	},
	server: {
		watch: {
			usePolling: true, // Ini memaksa Vite mengecek perubahan secara berkala
		},
	},
	build: {
		rollupOptions: {
			output: {
				manualChunks(id) {
					if (id.includes('node_modules')) {
						if (id.includes('jspdf') || id.includes('html2pdf') || id.includes('html2canvas')) {
							return 'pdf-utils';
						}
						if (id.includes('recharts')) {
							return 'charts';
						}
						if (id.includes('leaflet') || id.includes('react-leaflet')) {
							return 'maps';
						}
						return 'vendor';
					}
				},
			},
		},
	},
});

