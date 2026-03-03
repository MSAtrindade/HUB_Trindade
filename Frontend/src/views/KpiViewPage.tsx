import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../lib/api";

type Kpi = {
  id: number;
  sector_id?: number | null;
  title: string;
  description?: string | null;
  pdf_url?: string | null;
};

export function KpiViewPage() {
  const { kpiId } = useParams();
  const [kpi, setKpi] = useState<Kpi | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!kpiId) return;
    api<Kpi>(`/api/kpis/${kpiId}`)
      .then((r) => setKpi(r))
      .catch((e: any) => setErr(e?.message || "Falha ao carregar KPI"));
  }, [kpiId]);

  return (
    <div className="hub-hero">
      <div className="d-flex align-items-center justify-content-between flex-wrap gap-2">
        <h1 className="hub-title m-0">
          <i className="bi bi-journal-text me-3" />
          KPI
        </h1>

        <Link to="/setores" className="btn btn-outline-light">
          <i className="bi bi-arrow-left me-2" />
          Voltar
        </Link>
      </div>

      <div className="hub-subtitle">Visualização do indicador</div>

      <div className="mt-4" style={{ maxWidth: 1100 }}>
        {err && <div className="alert alert-danger">{err}</div>}

        {!err && !kpi && (
          <div className="card hub-card p-4">
            <div className="muted">Carregando...</div>
          </div>
        )}

        {kpi && (
          <div className="card hub-card p-4">
            <div className="d-flex align-items-start justify-content-between gap-3 flex-wrap">
              <div>
                <div className="fw-bold text-white" style={{ fontSize: 22 }}>
                  {kpi.title}
                </div>
                {kpi.description && (
                  <div className="muted mt-2">{kpi.description}</div>
                )}
              </div>

              {kpi.pdf_url ? (
                <a className="btn btn-danger" href={kpi.pdf_url} target="_blank" rel="noreferrer">
                  <i className="bi bi-file-earmark-pdf me-2" />
                  Abrir PDF
                </a>
              ) : (
                <span className="badge bg-secondary align-self-start">
                  sem PDF
                </span>
              )}
            </div>

            {/* Preview opcional (se for link direto de PDF) */}
            {kpi.pdf_url && (
              <div className="mt-4">
                <div className="muted mb-2">Pré-visualização</div>
                <div className="ratio ratio-16x9" style={{ borderRadius: 12, overflow: "hidden" }}>
                  <iframe src={kpi.pdf_url} title="KPI PDF" />
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}