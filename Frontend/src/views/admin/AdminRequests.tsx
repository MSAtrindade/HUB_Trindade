import React, { useEffect, useState } from "react";
import { api } from "../../lib/api";
import { Alert } from "../../ui/Toast";

type RequestItem = { id: number; user_name: string; sector_name?: string | null; title: string; status: string; created_at: string; details?: string | null };

export function AdminRequests() {
  const [items, setItems] = useState<RequestItem[]>([]);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    api<{ requests: RequestItem[] }>("/api/admin/requests").then((r) => setItems(r.requests || [])).catch((e) => setErr(e.message));
  }, []);

  return (
    <div className="card p-4">
      <h2 className="m-0"><i className="bi bi-envelope me-2" />Admin • Solicitações</h2>
      <div className="muted mt-2">Acompanhamento administrativo em página dedicada.</div>
      {err && <div className="mt-3"><Alert type="danger" message={err} /></div>}
      <div className="row g-3 mt-1">
        {items.map((item) => (
          <div className="col-12 col-lg-6" key={item.id}>
            <div className="card hub-card p-4 h-100">
              <div className="d-flex justify-content-between gap-3">
                <div>
                  <h5 className="m-0 text-white">{item.title}</h5>
                  <div className="muted mt-2">Solicitante: {item.user_name}</div>
                  <div className="muted">Setor: {item.sector_name || "Não informado"}</div>
                  <div className="muted">Criado em: {item.created_at}</div>
                </div>
                <span className="badge text-bg-warning align-self-start">{item.status}</span>
              </div>
              {item.details && <div className="mt-3">{item.details}</div>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
