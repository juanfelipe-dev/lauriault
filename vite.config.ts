import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  return {
    define: {
      "process.env.MAPTILER_API": JSON.stringify(env.MAPTILER_API),
    },
    plugins: [react()],
    server: {
      proxy: {
        "/api": {
          target:
            "https://nextrip-public-api.azure-api.net/octranspo/gtfs-rt-vp/beta/v1",
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ""), // Remove /api prefix if added
        },
      },
    },
  };
});
