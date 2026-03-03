import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../lib/api";

type Sector = { id: number; name: string; description?: string | null };
type Kpi = { id: number; title: string; description?: string | null; has_pdf?: number; pdf_url?: string | null };

export function SectorKpisPage() {
  const { sectorId } = useParams();
  const [sector, setSector] = useState<Sector | null>(null);
  const [kpis, setKpis] = useState<Kpi[]>([]);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!sectorId) return;

    api<{ sector: Sector; kpis: Kpi[] }>(`/api/sectors/${sectorId}/kpis`)
      .then((r) => {
        setSector(r.sector);
        setKpis(r.kpis || []);
      })
      .catch((e: any) => setErr(e?.message || "Falha ao carregar KPIs do setor"));
  }, [sectorId]);

  return (
    <div className="hub-hero">
      <div className="d-flex align-items-center justify-content-between flex-wrap gap-2">
        <h1 className="hub-title m-0">
          <i className="bi bi-grid me-3" />
          {sector ? `Setor: ${sector.name}` : "Setor"}
        </h1>

        <Link to="/setores" className="btn btn-outline-light">
          <i className="bi bi-arrow-left me-2" />
          Voltar
        </Link>
      </div>

      <div className="hub-subtitle">
        {sector?.description ? sector.description : "KPIs disponíveis para este setor"}
      </div>

      <div className="mt-4" style={{ maxWidth: 1100 }}>
        {err && <div className="alert alert-danger">{err}</div>}

        {!err && !sector && (
          <div className="card hub-card p-4">
            <div className="muted">Carregando...</div>
          </div>
        )}

        {sector && (
          <>
            {kpis.length === 0 ? (
              <div className="card hub-card p-4">
                <div className="muted">Nenhum KPI cadastrado para este setor.</div>
              </div>
            ) : (
              <div className="row g-3">
                {kpis.map((k) => (
                  <div className="col-12 col-lg-6" key={k.id}>
                    <Link to={`/kpis/${k.id}`} className="text-decoration-none">
                      <div className="card hub-card p-3 h-100">
                        <div className="d-flex align-items-center justify-content-between gap-3">
                          <div className="fw-semibold text-white">
                            <i className="bi bi-journal-text me-2" />
                            {k.title}
                          </div>
                          {k.pdf_url || k.has_pdf ? (
                            <i className="bi bi-file-earmark-pdf text-danger fs-5" />
                          ) : (
                            <span className="badge bg-secondary">sem PDF</span>
                          )}
                        </div>

                        {k.description && (
                          <div className="muted mt-2">{k.description}</div>
                        )}
                      </div>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}