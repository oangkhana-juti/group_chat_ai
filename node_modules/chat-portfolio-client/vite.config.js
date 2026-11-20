import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { loadEnv } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

export default defineConfig(({ mode }) => {
  const env = {
    ...loadEnv(mode, root, ''),
    ...loadEnv(mode, path.resolve(root, 'server'), ''),
  };
  const apiTarget = new URL(env.API_URL || `http://127.0.0.1:${env.PORT || 3001}`);
  if (apiTarget.hostname === 'localhost') apiTarget.hostname = '127.0.0.1';
  const apiProxy = { '/api': apiTarget.toString() };

  return {
    base: env.VITE_BASE_PATH || '/',
    envDir: root,
    plugins: [react()],
    server: { port: 3000, proxy: apiProxy },
    preview: { port: 4173, proxy: apiProxy },
    build: { outDir: 'out' },
  };
});
