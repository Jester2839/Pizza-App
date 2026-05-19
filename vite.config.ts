import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  root: 'src',
  publicDir: 'assets',
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'src/index.html'),
        detail: resolve(__dirname, 'src/detail.html'),
        kosik: resolve(__dirname, 'src/kosik.html'),
      },
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@ts': resolve(__dirname, 'src/ts'),
      '@scss': resolve(__dirname, 'src/scss'),
      '@assets': resolve(__dirname, 'src/assets'),
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        api: 'modern-compiler',
        additionalData: `@use "@scss/_variables.scss" as *;`,
      },
    },
  },
});
