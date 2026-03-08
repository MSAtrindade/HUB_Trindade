import React, { useEffect, useState } from "react";
import { api } from "../../lib/api";
import { Alert } from "../../ui/Toast";

type User = { id: number; name: string; email: string; role: string };

export function AdminUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    api<{ users: User[] }>("/api/admin/users").then((r) => setUsers(r.users || [])).catch((e) => setErr(e.message));
  }, []);

  return (
    <div className="card p-4">
      <h2 className="m-0"><i className="bi bi-people me-2" />Admin • Usuários</h2>
      <div className="muted mt-2">Lista dos usuários cadastrados e seus perfis de acesso.</div>
      {err && <div className="mt-3"><Alert type="danger" message={err} /></div>}
      <div className="table-responsive mt-4">
        <table className="table table-dark table-hover align-middle mb-0">
          <thead><tr><th>ID</th><th>Nome</th><th>E-mail</th><th>Perfil</th></tr></thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}><td>{u.id}</td><td>{u.name}</td><td>{u.email}</td><td><span className={`badge ${u.role === "admin" ? "text-bg-warning" : "text-bg-secondary"}`}>{u.role}</span></td></tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
