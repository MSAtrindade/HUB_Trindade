import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api";
import { useAuth } from "../state/auth";

export function HomePage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<{
    sectors: number;
    kpis: number;
    requests: number;
    kpis_no_sector?: number;
  } | null>(null);
  const [showWelcome, setShowWelcome] = useState(true);

  useEffect(() => {
    api("/api/home")
      .then((r: any) => setStats(r))
      .catch(() => setStats({ sectors: 0, kpis: 0, requests: 0, kpis_no_sector: 0 }));
  }, []);

  const name = useMemo(() => user?.name || "Usuário", [user]);

  return (
    <div className="hub-hero">
      {showWelcome && (
        <div className="alert alert-success alert-dismissible fade show hub-welcome" role="alert">
          <div>Bem-vindo, {name}!</div>
          <button type="button" className="btn-close" aria-label="Close" onClick={() => setShowWelcome(false)} />
        </div>
      )}

      <h1 className="hub-title">
        <i className="bi bi-house-door-fill me-3" />
        Bem-vindo ao HUB Trindade Mineração
      </h1>
      <div className="hub-subtitle">
        Sistema de Gestão de KPIs - Controle e visualize indicadores por setor
      </div>

      <div className="row g-4 mt-4">
        <div className="col-12 col-lg-4">
          <div className="card hub-card h-100">
            <div className="card-body text-center">
              <div className="hub-card-icon text-primary">
                <i className="bi bi-grid-3x3-gap" />
              </div>
              <h3 className="hub-card-title">Setores</h3>
              <div className="hub-card-muted">{stats?.sectors ?? 0} setores com KPIs</div>
              <Link to="/setores" className="btn btn-primary mt-3">Ver Setores</Link>
            </div>
          </div>
        </div>

        <div className="col-12 col-lg-4">
          <div className="card hub-card h-100">
            <div className="card-body text-center">
              <div className="hub-card-icon text-success">
                <i className="bi bi-bar-chart-line" />
              </div>
              <h3 className="hub-card-title">KPIs sem Setor</h3>
              <div className="hub-card-muted">{stats?.kpis_no_sector ?? 0} KPIs disponíveis</div>
              <Link to="/kpis-sem-setor" className="btn btn-success mt-3">Ver KPIs</Link>
            </div>
          </div>
        </div>

        <div className="col-12 col-lg-4">
          <div className="card hub-card h-100">
            <div className="card-body text-center">
              <div className="hub-card-icon text-warning">
                <i className="bi bi-envelope" />
              </div>
              <h3 className="hub-card-title">Solicitações</h3>
              <div className="hub-card-muted">Solicite novos KPIs ou acesso</div>
              <Link to="/solicitar" className="btn btn-warning mt-3">Nova Solicitação</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}