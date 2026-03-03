# HUB Trindade - Frontend React (Vite)

## Rodar local
1) Copie `.env.example` para `.env` e ajuste `VITE_API_BASE`.
2) Instale dependências:
   ```bash
   npm install
   ```
3) Suba:
   ```bash
   npm run dev
   ```

## Deploy Vercel
- Defina a env `VITE_API_BASE` no Vercel (Project Settings > Environment Variables)
- O `vercel.json` já está configurado para SPA (React Router).

## Observação importante (backend)
Este front pressupõe que o backend Flask expõe endpoints JSON em `/api/*` e usa sessão via cookie:
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/me`
- `GET /api/sectors`
- `GET /api/sectors/:id/kpis`
- `GET /api/kpis/:id`
- `GET/POST /api/requests`
- `GET /api/home`
- `/api/admin/*` (opcional)

No fetch usamos `credentials: "include"` para enviar/receber cookies.
