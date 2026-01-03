import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, (process as any).cwd(), '');
  return {
    plugins: [react()],
    define: {
      // Define process.env.API_KEY so it's available in the client code
      'process.env.API_KEY': JSON.stringify(env.API_KEY),
      // Polyfill process.env for libraries that might expect it
      'process.env': {},
    },
  };
});