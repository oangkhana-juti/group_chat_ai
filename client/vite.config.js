import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { loadEnv } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, root, '');
  const apiUrl = env.API_URL || `http://localhost:${env.PORT || 3001}`;

  return {
    plugins: [react()],
    server: { proxy: { '/api': apiUrl } },
  };
});
