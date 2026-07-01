import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

// https://vite.dev/config/
export default defineConfig(async ({ mode }) => {
  const plugins = [react()];

  // Only load kimi inspect plugin in development
  if (mode === 'development') {
    try {
      const { inspectAttr } = await import('kimi-plugin-inspect-react');
      plugins.unshift(inspectAttr());
    } catch {}
  }

  return {
    base: './',
    plugins,
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    build: {
      // Split heavy vendor libraries into separate chunks for better caching
      rollupOptions: {
        output: {
          manualChunks: {
            'vendor-react': ['react', 'react-dom'],
            'vendor-charts': ['recharts'],
            'vendor-maps': ['@react-google-maps/api'],
            'vendor-ui': ['lucide-react'],
          },
        },
      },
    },
  };
});
