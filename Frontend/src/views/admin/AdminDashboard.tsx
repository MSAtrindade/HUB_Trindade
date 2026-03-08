import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../lib/api";
import { Alert } from "../../ui/Toast";

type DashboardData = {
  users: number;
  sectors: number;
  kpis: number;
  requests: number;
  open_requests: number;
};

const modules = [
  { to: "/admin/users", icon: "bi-people", title: "Usuários", desc: "Visualizar usuários e perfis." },
  { to: "/admin/setores", icon: "bi-folder", title: "Setores", desc: "Criar e editar setores existentes." },
  { to: "/admin/kpis", icon: "bi-journal-text", title: "KPIs", desc: "Consultar indicadores cadastrados." },
  { to: "/admin/assign", icon: "bi-person-check", title: "Permissões", desc: "Estrutura de permissões do HUB." },
  { to: "/admin/solicitacoes", icon: "bi-envelope", title: "Solicitações", desc: "Acompanhar pedidos dos usuários." },
  { to: "/admin/logs", icon: "bi-bug", title: "Logs", desc: "Consultar registros administrativos." },
];

export function AdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    api<DashboardData>("/api/admin/dashboard").then(setData).catch((e) => setErr(e.message));
  }, []);

  return (
    <div className="d-flex flex-column gap-4">
      <div className="card p-4">
        <h2 className="m-0"><i className="bi bi-speedometer2 me-2" />Administração do HUB</h2>
        <div className="muted mt-2">Cada módulo administrativo possui sua própria página para manter a Home leve e organizada.</div>
        {err && <div className="mt-3"><Alert type="danger" message={err} /></div>}
      </div>

      <div className="row g-3">
        {[
          ["Usuários", data?.users ?? 0, "bi-people"],
          ["Setores", data?.sectors ?? 0, "bi-folder"],
          ["KPIs", data?.kpis ?? 0, "bi-bar-chart-line"],
          ["Solicitações abertas", data?.open_requests ?? 0, "bi-envelope-open"],
        ].map(([label, value, icon]) => (
          <div className="col-12 col-md-6 col-xl-3" key={String(label)}>
            <div className="card p-4 h-100 hub-card">
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <div className="muted">{label}</div>
                  <div style={{ fontSize: 30, fontWeight: 800, lineHeight: 1.1 }}>{value}</div>
                </div>
                <i className={`bi ${icon}`} style={{ fontSize: 24 }} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="row g-3">
        {modules.map((item) => (
          <div className="col-12 col-md-6 col-xl-4" key={item.to}>
            <Link to={item.to} className="text-decoration-none">
              <div className="card p-4 h-100 hub-card">
                <div className="d-flex align-items-start justify-content-between gap-3">
                  <div>
                    <h5 className="m-0 text-white"><i className={`bi ${item.icon} me-2`} />{item.title}</h5>
                    <div className="muted mt-2">{item.desc}</div>
                  </div>
                  <i className="bi bi-arrow-right-circle" style={{ fontSize: 22 }} />
                </div>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
