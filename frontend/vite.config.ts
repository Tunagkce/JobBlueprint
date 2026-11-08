import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

// Spring Boot (port 8080) owns the API, sign-in pages and session. In development Vite serves the
// React app on port 5173 and forwards everything else to Spring, so the browser sees a single origin.
const spring = 'http://localhost:8080';
const forwardToSpring = ['/api', '/login', '/logout', '/oauth2', '/auth.html', '/auth.js', '/styles.css'];

export default defineConfig({
  base: '/app/',
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: true,
    proxy: Object.fromEntries(forwardToSpring.map((path) => [path, { target: spring }])),
  },
  build: {
    // Spring serves this folder at /app/. It is a build output, so it is ignored by git.
    outDir: '../src/main/resources/static/app',
    emptyOutDir: true,
  },
  test: {
    environment: 'node',
  },
});
