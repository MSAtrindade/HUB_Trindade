import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api";

type Sector = {
  id: number;
  name: string;
  description?: string | null;
  kpi_count?: number;
};

export function SectorsPage() {
  const [items, setItems] = useState<Sector[]>([]);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    api<{ sectors: Sector[] }>("/api/sectors")
      .then((r) => setItems(r.sectors || []))
      .catch((e: any) => setErr(e?.message || "Falha ao carregar setores"));
  }, []);

  return (
    <div className="hub-hero">
      <h1 className="hub-title">
        <i className="bi bi-grid me-3" />
        Setores
      </h1>
      <div className="hub-subtitle">Selecione um setor para visualizar seus KPIs</div>

      <div className="mt-4" style={{ maxWidth: 1100 }}>
        {err && <div className="alert alert-danger">{err}</div>}

        {items.length === 0 && !err ? (
          <div className="card hub-card p-4">
            <div className="muted">Nenhum setor encontrado.</div>
          </div>
        ) : (
          <div className="row g-3">
            {items.map((s) => (
              <div className="col-12 col-lg-6" key={s.id}>
                <Link to={`/setores/${s.id}`} className="text-decoration-none">
                  <div className="card hub-card p-4 h-100">
                    <div className="d-flex align-items-center justify-content-between gap-3">
                      <div className="fw-bold text-white" style={{ fontSize: 20 }}>
                        <i className="bi bi-folder2-open me-2" />
                        {s.name}
                      </div>

                      <span className="badge bg-primary">
                        {s.kpi_count ?? 0} KPI(s)
                      </span>
                    </div>

                    {s.description && <div className="muted mt-2">{s.description}</div>}

                    <div className="mt-3">
                      <span className="btn btn-outline-light btn-sm">
                        Ver KPIs <i className="bi bi-arrow-right ms-2" />
                      </span>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}