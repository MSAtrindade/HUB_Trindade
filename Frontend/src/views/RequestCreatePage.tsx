import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";

export function RequestCreatePage() {
  const nav = useNavigate();
  const [type, setType] = useState("Novo KPI");
  const [title, setTitle] = useState("");
  const [details, setDetails] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => { setMsg(null); }, [type, title, details]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      await api("/api/requests", { method: "POST", body: { title: `${type}: ${title}`.trim(), details } });
      setMsg("Solicitação enviada com sucesso.");
      setTitle("");
      setDetails("");
    } catch (e: any) {
      setMsg(e?.message || "Falha ao enviar");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="hub-hero">
      <h1 className="hub-title">
        <i className="bi bi-envelope me-3" />
        Nova Solicitação
      </h1>
      <div className="hub-subtitle">Solicite novos KPIs, revisões ou acesso</div>

      {msg && (
        <div className="alert alert-info mt-3" role="alert" style={{ maxWidth: 980 }}>
          {msg}
        </div>
      )}

      <form className="mt-4" onSubmit={submit} style={{ maxWidth: 980 }}>
        <label className="form-label text-white fw-semibold">Tipo de Solicitação</label>
        <select className="form-select" value={type} onChange={(e) => setType(e.target.value)}>
          <option>Novo KPI</option>
          <option>Revisão de KPI</option>
          <option>Acesso</option>
          <option>Correção</option>
        </select>

        <label className="form-label text-white fw-semibold mt-3">Título</label>
        <input className="form-control" value={title} onChange={(e) => setTitle(e.target.value)} />

        <label className="form-label text-white fw-semibold mt-3">Descrição</label>
        <textarea className="form-control" rows={7} value={details} onChange={(e) => setDetails(e.target.value)} />

        <div className="d-flex gap-2 mt-4">
          <button className="btn btn-primary" disabled={busy}>
            <i className="bi bi-send me-2" />
            {busy ? "Enviando..." : "Enviar Solicitação"}
          </button>
          <button type="button" className="btn btn-secondary" onClick={() => nav("/")}>
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}