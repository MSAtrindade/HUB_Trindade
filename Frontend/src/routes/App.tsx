import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "../state/auth";
import { AppShell } from "../ui/AppShell";

import { LoginPage } from "../views/LoginPage";
import { HomePage } from "../views/HomePage";
import { SectorsPage } from "../views/SectorsPage";
import { SectorKpisPage } from "../views/SectorKpisPage";
import { KpiViewPage } from "../views/KpiViewPage";
import { RequestsPage } from "../views/RequestsPage";
import { RequestCreatePage } from "../views/RequestCreatePage";
import { KpisNoSectorPage } from "../views/KpisNoSectorPage";

import { AdminDashboard } from "../views/admin/AdminDashboard";
import { AdminUsers } from "../views/admin/AdminUsers";
import { AdminSectors } from "../views/admin/AdminSectors";
import { AdminKpis } from "../views/admin/AdminKpis";
import { AdminAssign } from "../views/admin/AdminAssign";
import { AdminLogs } from "../views/admin/AdminLogs";
import { AdminRequests } from "../views/admin/AdminRequests";

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="container py-4"><div className="card p-4">Carregando…</div></div>;
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function RequireAdmin({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  const isAdmin = user.role === "admin";
  return isAdmin ? <>{children}</> : <Navigate to="/" replace />;
}

export function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route path="/" element={
        <RequireAuth>
          <AppShell />
        </RequireAuth>
      }>
        <Route index element={<HomePage />} />
        <Route path="setores" element={<SectorsPage />} />
        <Route path="setores/:sectorId" element={<SectorKpisPage />} />
        <Route path="kpis/:kpiId" element={<KpiViewPage />} />
        <Route path="solicitacoes" element={<RequestsPage />} />
        <Route path="solicitar" element={<RequestCreatePage />} />
        <Route path="kpis-sem-setor" element={<KpisNoSectorPage />} />

        {/* ADMIN */}
        <Route path="admin" element={<RequireAdmin><AdminDashboard /></RequireAdmin>} />
        <Route path="admin/users" element={<RequireAdmin><AdminUsers /></RequireAdmin>} />
        <Route path="admin/setores" element={<RequireAdmin><AdminSectors /></RequireAdmin>} />
        <Route path="admin/kpis" element={<RequireAdmin><AdminKpis /></RequireAdmin>} />
        <Route path="admin/assign" element={<RequireAdmin><AdminAssign /></RequireAdmin>} />
        <Route path="admin/logs" element={<RequireAdmin><AdminLogs /></RequireAdmin>} />
        <Route path="admin/solicitacoes" element={<RequireAdmin><AdminRequests /></RequireAdmin>} />

        <Route path="*" element={<div className="container py-4"><div className="card p-4">Página não encontrada.</div></div>} />
      </Route>
    </Routes>
  );
}
