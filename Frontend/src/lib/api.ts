const API_BASE = (import.meta as any).env.VITE_API_BASE || "";

type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";

export async function api<T>(
  path: string,
  opts?: { method?: HttpMethod; body?: any; headers?: Record<string, string> }
): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: opts?.method || "GET",
    headers: {
      "Content-Type": "application/json",
      ...(opts?.headers || {})
    },
    body: opts?.body ? JSON.stringify(opts.body) : undefined,
    // IMPORTANTE: para sessão (cookie) funcionar cross-site
    credentials: "include"
  });

  if (!res.ok) {
    let msg = `HTTP ${res.status}`;
    try {
      const j = await res.json();
      msg = j?.error || j?.message || msg;
    } catch {}
    throw new Error(msg);
  }

  // 204 no content
  if (res.status === 204) return undefined as any;

  const ct = res.headers.get("content-type") || "";
  if (ct.includes("application/json")) return (await res.json()) as T;
  return (await res.text()) as any;
}
