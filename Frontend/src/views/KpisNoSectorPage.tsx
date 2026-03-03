import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api";

type Kpi = { id: number; title: string; description?: string; pdf_url?: string | null };

export function KpisNoSectorPage() {
  const [kpis, setKpis] = useState<Kpi[]>([]);

  useEffect(() => {
    api<{ kpis: Kpi[] }>("/api/kpis-no-sector")
      .then((r) => setKpis(r.kpis || []))
      .catch(() => setKpis([]));
  }, []);

  return (
    <div className="hub-hero">
      <h1 className="hub-title">
        <i className="bi bi-bar-chart-line me-3" />
        KPIs sem Setor
      </h1>
      <div className="hub-subtitle">KPIs disponíveis que não estão vinculados a um setor.</div>

      <div className="row g-3 mt-4">
        {kpis.map((k) => (
          <div className="col-12 col-lg-6" key={k.id}>
            <Link to={`/kpis/${k.id}`} className="text-decoration-none">
              <div className="card hub-card p-3">
                <div className="d-flex align-items-center justify-content-between">
                  <div className="fw-semibold text-white">
                    <i className="bi bi-journal-text me-2" />
                    {k.title}
                  </div>
                  {k.pdf_url ? <i className="bi bi-file-pdf text-danger" /> : <span className="muted">sem pdf</span>}
                </div>
                {k.description && <div className="muted mt-2">{k.description}</div>}
              </div>
            </Link>
          </div>
        ))}

        {kpis.length === 0 && (
          <div className="col-12">
            <div className="card hub-card p-4">
              <div className="muted">Nenhum KPI sem setor disponível.</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}