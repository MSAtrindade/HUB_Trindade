import React, { useEffect, useMemo, useState } from "react";
import { api } from "../../lib/api";
import { Alert } from "../../ui/Toast";

type UserRow = {
  id: number;
  name: string;
  email: string;
  role: "admin" | "user" | string;
};

type UsersResponse = { users: UserRow[] };

const EMPTY_FORM = {
  name: "",
  email: "",
  password: "",
  role: "user",
};

export function AdminUsers() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);

  async function loadUsers() {
    try {
      setErr(null);
      const res = await api<UsersResponse>("/api/admin/users");
      setUsers(res.users || []);
    } catch (e: any) {
      setErr(e.message || "Erro ao carregar usuários");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadUsers();
  }, []);

  const totals = useMemo(() => {
    const admins = users.filter((u) => u.role === "admin").length;
    const comuns = users.filter((u) => u.role !== "admin").length;
    return { total: users.length, admins, comuns };
  }, [users]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setErr(null);
    setSuccess(null);

    try {
      await api("/api/admin/users", {
        method: "POST",
        body: {
          name: form.name,
          email: form.email,
          password: form.password,
          role: form.role,
        },
      });

      setForm(EMPTY_FORM);
      setSuccess("Usuário criado com sucesso.");
      await loadUsers();
    } catch (e: any) {
      setErr(e.message || "Erro ao criar usuário");
    } finally {
      setSaving(false);
    }
  }

  function updateField(field: keyof typeof EMPTY_FORM, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  return (
    <div className="d-grid gap-3">
      <div className="card p-4">
        <div className="d-flex flex-wrap justify-content-between align-items-start gap-3">
          <div>
            <h3 className="m-0">
              <i className="bi bi-people me-2" />Admin • Usuários
            </h3>
            <div className="muted mt-2">
              Cadastre novos usuários diretamente pela tela administrativa do HUB.
            </div>
          </div>
          <div className="d-flex gap-2 flex-wrap">
            <span className="badge text-bg-primary">Total: {totals.total}</span>
            <span className="badge text-bg-dark">Admins: {totals.admins}</span>
            <span className="badge text-bg-secondary">Usuários: {totals.comuns}</span>
          </div>
        </div>

        {err && (
          <div className="mt-3">
            <Alert type="danger" message={err} />
          </div>
        )}
        {success && (
          <div className="mt-3">
            <Alert type="success" message={success} />
          </div>
        )}
      </div>

      <div className="row g-3">
        <div className="col-12 col-xl-4">
          <div className="card p-4 h-100">
            <h5 className="mb-3">
              <i className="bi bi-person-plus me-2" />Criar usuário
            </h5>

            <form onSubmit={handleSubmit} className="d-grid gap-3">
              <div>
                <label className="form-label">Nome</label>
                <input
                  className="form-control"
                  value={form.name}
                  onChange={(e) => updateField("name", e.target.value)}
                  placeholder="Ex.: Eduardo Martins"
                  required
                />
              </div>

              <div>
                <label className="form-label">E-mail</label>
                <input
                  type="email"
                  className="form-control"
                  value={form.email}
                  onChange={(e) => updateField("email", e.target.value)}
                  placeholder="usuario@empresa.com"
                  required
                />
              </div>

              <div>
                <label className="form-label">Senha</label>
                <input
                  type="password"
                  className="form-control"
                  value={form.password}
                  onChange={(e) => updateField("password", e.target.value)}
                  placeholder="Mínimo 4 caracteres"
                  required
                />
              </div>

              <div>
                <label className="form-label">Perfil</label>
                <select
                  className="form-select"
                  value={form.role}
                  onChange={(e) => updateField("role", e.target.value)}
                >
                  <option value="user">Usuário</option>
                  <option value="admin">Administrador</option>
                </select>
              </div>

              <button className="btn btn-primary" type="submit" disabled={saving}>
                {saving ? "Salvando..." : "Criar usuário"}
              </button>
            </form>
          </div>
        </div>

        <div className="col-12 col-xl-8">
          <div className="card p-4 h-100">
            <div className="d-flex justify-content-between align-items-center mb-3 gap-2 flex-wrap">
              <h5 className="mb-0">
                <i className="bi bi-list-ul me-2" />Usuários cadastrados
              </h5>
              <button className="btn btn-outline-light btn-sm" onClick={loadUsers}>
                Atualizar lista
              </button>
            </div>

            {loading ? (
              <div className="muted">Carregando usuários...</div>
            ) : users.length === 0 ? (
              <div className="muted">Nenhum usuário encontrado.</div>
            ) : (
              <div className="table-responsive">
                <table className="table table-dark table-hover align-middle mb-0">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Nome</th>
                      <th>E-mail</th>
                      <th>Perfil</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.id}>
                        <td>{user.id}</td>
                        <td>{user.name}</td>
                        <td>{user.email}</td>
                        <td>
                          <span className={`badge ${user.role === "admin" ? "text-bg-primary" : "text-bg-secondary"}`}>
                            {user.role === "admin" ? "Administrador" : "Usuário"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
