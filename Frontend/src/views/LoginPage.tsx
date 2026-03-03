import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../state/auth";
import { Alert } from "../ui/Toast";

export function LoginPage() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErr(null);
    try {
      await login(email, password);
      nav("/");
    } catch (e: any) {
      setErr(e?.message || "Falha ao entrar");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="container py-5" style={{ maxWidth: 520 }}>
      <div className="text-center mb-3">
        <img src="/assets/images/truck-offroad.svg" style={{ width: 56, opacity: 0.9 }} />
        <h2 className="mt-2">HUB Trindade</h2>
        <div className="muted">Acesse com seu usuário</div>
      </div>

      <div className="card p-4">
        {err && <Alert type="danger" title="Não foi possível entrar" message={err} />}
        <form onSubmit={onSubmit}>
          <label className="form-label">E-mail</label>
          <input className="form-control" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="seu@email.com" />

          <label className="form-label mt-3">Senha</label>
          <input type="password" className="form-control" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />

          <button className="btn btn-primary w-100 mt-4" disabled={busy}>
            <i className="bi bi-box-arrow-in-right me-2" />
            {busy ? "Entrando…" : "Entrar"}
          </button>
        </form>
      </div>
    </div>
  );
}
