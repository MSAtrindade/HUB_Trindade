import React, { useEffect, useState } from "react";
import { api } from "../../lib/api";
import { Alert } from "../../ui/Toast";

type Kpi = { id: number; title: string; description: string; sector_name?: string | null; pdf_url?: string | null };

export function AdminKpis() {
  const [kpis, setKpis] = useState<Kpi[]>([]);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    api<{ kpis: Kpi[] }>("/api/admin/kpis").then((r) => setKpis(r.kpis || [])).catch((e) => setErr(e.message));
  }, []);

  return (
    <div className="card p-4">
      <h2 className="m-0"><i className="bi bi-journal-text me-2" />Admin • KPIs</h2>
      <div className="muted mt-2">Página própria para consulta dos indicadores cadastrados.</div>
      {err && <div className="mt-3"><Alert type="danger" message={err} /></div>}
      <div className="row g-3 mt-1">
        {kpis.map((kpi) => (
          <div className="col-12 col-lg-6" key={kpi.id}>
            <div className="card hub-card p-4 h-100">
              <div className="d-flex justify-content-between gap-3">
                <div>
                  <h5 className="m-0 text-white">{kpi.title}</h5>
                  <div className="muted mt-2">{kpi.description || "Sem descrição"}</div>
                </div>
                <span className="badge text-bg-secondary align-self-start">{kpi.sector_name || "Sem setor"}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
