import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'
import wasm from "vite-plugin-wasm";


export default defineConfig({
	plugins: [react(), tailwindcss(), wasm()],
	server: {
		host: true,
		port: 8090,
		strictPort: true,
		open: '/redirect',
	},
	build: {
		outDir: './dist',
	}
})
