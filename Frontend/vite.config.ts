import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Se você vai usar rotas no cliente (React Router) no Vercel,
// o Vercel precisa reescrever tudo para /index.html.
// Isso fica no vercel.json (incluído no projeto).
export default defineConfig({
  plugins: [react()],
  server: { port: 5173 }
});
