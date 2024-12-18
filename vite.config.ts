import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { ghPages } from 'vite-plugin-gh-pages'; // Proper import of the plugin

export default defineConfig({
  plugins: [react(), ghPages()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  assetsInclude: ['**/*.jpg', '**/*.jpeg', '**/*.png', '**/*.svg', '**/*.gif'], // Add support for image types
  base: './', // Ensures relative paths in production
});
