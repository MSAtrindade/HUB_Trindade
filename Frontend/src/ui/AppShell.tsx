import React, { useEffect, useMemo, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../state/auth";

function usePwaInstall() {
  const [deferred, setDeferred] = useState<any>(null);

  useEffect(() => {
    const handler = (e: any) => { e.preventDefault(); setDeferred(e); };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  async function promptInstall() {
    if (!deferred) return;
    deferred.prompt();
    try { await deferred.userChoice; } finally { setDeferred(null); }
  }

  return useMemo(() => ({ canInstall: !!deferred, promptInstall }), [deferred]);
}

function TopNavItem({ to, icon, label }: { to: string; icon: string; label: string }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `nav-link d-flex align-items-center gap-2 px-3 ${isActive ? "active" : ""}`
      }
    >
      <i className={`bi ${icon}`} />
      <span>{label}</span>
    </NavLink>
  );
}

export function AppShell() {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  const pwa = usePwaInstall();

  async function onLogout() {
    await logout();
    nav("/login");
  }

  return (
    <div className="hub-bg">
      <nav className="navbar navbar-expand-lg navbar-dark hub-topbar">
        <div className="container-fluid px-3">
          <NavLink className="navbar-brand fw-bold" to="/">
            HUB Trindade Mineração
          </NavLink>

          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#hubTopbarNav"
            aria-controls="hubTopbarNav"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon" />
          </button>

          <div className="collapse navbar-collapse" id="hubTopbarNav">
            <ul className="navbar-nav me-auto mb-2 mb-lg-0">
              <li className="nav-item">
                <TopNavItem to="/" icon="bi-house" label="Início" />
              </li>
              <li className="nav-item">
                <TopNavItem to="/setores" icon="bi-grid" label="Setores" />
              </li>
              <li className="nav-item">
                <TopNavItem to="/solicitar" icon="bi-envelope" label="Solicitar" />
              </li>
              <li className="nav-item">
                <TopNavItem to="/solicitacoes" icon="bi-list-task" label="Minhas Solicitações" />
              </li>

              {user?.role === "admin" && (
                <li className="nav-item dropdown">
                  <a
                    className="nav-link dropdown-toggle d-flex align-items-center gap-2 px-3"
                    href="#"
                    role="button"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                  >
                    <i className="bi bi-gear" />
                    Admin
                  </a>
                  <ul className="dropdown-menu dropdown-menu-dark">
                    <li><NavLink className="dropdown-item" to="/admin"><i className="bi bi-speedometer2 me-2" />Dashboard</NavLink></li>
                    <li><NavLink className="dropdown-item" to="/admin/users"><i className="bi bi-people me-2" />Usuários</NavLink></li>
                    <li><NavLink className="dropdown-item" to="/admin/setores"><i className="bi bi-folder me-2" />Setores</NavLink></li>
                    <li><NavLink className="dropdown-item" to="/admin/kpis"><i className="bi bi-journal-text me-2" />KPIs</NavLink></li>
                    <li><NavLink className="dropdown-item" to="/admin/assign"><i className="bi bi-person-check me-2" />Permissões</NavLink></li>
                    <li><NavLink className="dropdown-item" to="/admin/solicitacoes"><i className="bi bi-envelope me-2" />Solicitações</NavLink></li>
                    <li><NavLink className="dropdown-item" to="/admin/logs"><i className="bi bi-bug me-2" />Logs</NavLink></li>
                  </ul>
                </li>
              )}
            </ul>

            <div className="d-flex align-items-center gap-2">
              {pwa.canInstall && (
                <button className="btn btn-sm btn-hub-install" onClick={pwa.promptInstall}>
                  <i className="bi bi-download me-2" />
                  Instalar App
                </button>
              )}

              <div className="dropdown">
                <a
                  className="btn btn-sm btn-outline-light dropdown-toggle d-flex align-items-center gap-2"
                  href="#"
                  role="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  <i className="bi bi-person-circle" />
                  <span>{user?.name || "Usuário"}</span>
                </a>
                <ul className="dropdown-menu dropdown-menu-dark dropdown-menu-end">
                  {user?.email && <li><span className="dropdown-item-text small muted">{user.email}</span></li>}
                  {user?.email && <li><hr className="dropdown-divider" /></li>}
                  <li>
                    <button className="dropdown-item" onClick={onLogout}>
                      <i className="bi bi-box-arrow-right me-2" />
                      Sair
                    </button>
                  </li>
                </ul>
              </div>
            </div>

          </div>
        </div>
      </nav>

      <main className="container-fluid hub-content">
        <div className="container py-4">
          <Outlet />
        </div>
      </main>

      <footer className="hub-footer">
        © {new Date().getFullYear()} HUB Trindade Mineração | Eduardo Martins & Rudgere Germano
      </footer>
    </div>
  );
}
