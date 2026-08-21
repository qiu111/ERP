import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

export default defineConfig(() => ({
  plugins: [
    vue(),
  ],
  // 部署在 GitHub Pages 时使用 '/ERP/' 作为 base；如需自适应模式可改回：
  // base: mode === 'production' ? './' : '/ERP/'
  base: '/ERP/',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    host: '0.0.0.0',
    proxy: {
      '/api': {
        target: 'http://localhost:8081',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
      '/api1': {
        target: 'http://localhost:8081',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api1/, ''),
      },
    },
    hmr: {
      overlay: false
    }
  },
  build: {
    target: 'es2015',
    emptyOutDir: true,
  }
}))
