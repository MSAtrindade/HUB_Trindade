import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api";

type Req = {
  id: number;
  title: string;
  details?: string;
  status?: string;
  created_at?: string;
  status_color?: string;
};

export function RequestsPage() {
  const [items, setItems] = useState<Req[]>([]);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    api<{ requests: Req[] }>("/api/requests")
      .then((r) => setItems(r.requests || []))
      .catch((e: any) => setErr(e?.message || "Falha ao carregar"));
  }, []);

  return (
    <div className="hub-hero">
      <h1 className="hub-title">
        <i className="bi bi-list-task me-3" />
        Minhas Solicitações
      </h1>
      <div className="hub-subtitle">Acompanhe suas solicitações e status</div>

      <div className="mt-4" style={{ maxWidth: 1100 }}>
        <div className="d-flex align-items-center justify-content-between mb-3">
          <Link className="btn btn-warning" to="/solicitar">
            <i className="bi bi-plus-circle me-2" />
            Nova Solicitação
          </Link>
        </div>

        {err && <div className="alert alert-danger">{err}</div>}

        {items.length === 0 ? (
          <div className="card hub-card p-4">
            <div className="muted">Nenhuma solicitação encontrada.</div>
          </div>
        ) : (
          <div className="card hub-card p-3">
            <div className="table-responsive">
              <table className="table table-dark table-hover align-middle mb-0">
                <thead>
                  <tr>
                    <th style={{ width: 90 }}>#</th>
                    <th>Título</th>
                    <th style={{ width: 160 }}>Status</th>
                    <th style={{ width: 220 }}>Criado em</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((it) => (
                    <tr key={it.id}>
                      <td className="text-muted">{it.id}</td>
                      <td>
                        <div className="fw-semibold">{it.title}</div>
                        {it.details && <div className="text-muted small">{it.details}</div>}
                      </td>
                      <td>
                        <span className={`badge bg-${it.status_color || "secondary"}`}>
                          {it.status || "—"}
                        </span>
                      </td>
                      <td className="text-muted">{it.created_at || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}