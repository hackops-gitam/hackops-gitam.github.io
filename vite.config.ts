import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/', // Replace this with the name of your repo (if hosted as a subpath)
  build: {
    outDir: 'dist', // Ensure the output directory is set to 'dist'
  },
});
