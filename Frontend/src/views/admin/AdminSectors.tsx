import React, { useEffect, useMemo, useState } from "react";
import { api } from "../../lib/api";
import { Alert } from "../../ui/Toast";

type Sector = {
  id: number;
  name: string;
  description: string;
  kpi_count: number;
};

const emptyForm = { name: "", description: "" };

export function AdminSectors() {
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);

  async function load() {
    setErr(null);
    const data = await api<{ sectors: Sector[] }>("/api/admin/sectors");
    setSectors(data.sectors || []);
  }

  useEffect(() => {
    load().catch((e) => setErr(e.message));
  }, []);

  const title = useMemo(() => editingId ? "Editar setor" : "Novo setor", [editingId]);

  function startCreate() {
    setEditingId(null);
    setForm(emptyForm);
    setOk(null);
    setErr(null);
  }

  function startEdit(item: Sector) {
    setEditingId(item.id);
    setForm({ name: item.name || "", description: item.description || "" });
    setOk(null);
    setErr(null);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setErr(null);
    setOk(null);
    try {
      const payload = { name: form.name.trim(), description: form.description.trim() };
      if (editingId) {
        await api(`/api/admin/sectors/${editingId}`, { method: "PUT", body: payload });
        setOk("Setor atualizado com sucesso.");
      } else {
        await api("/api/admin/sectors", { method: "POST", body: payload });
        setOk("Setor criado com sucesso.");
      }
      setForm(emptyForm);
      setEditingId(null);
      await load();
    } catch (error: any) {
      setErr(error.message || "Erro ao salvar setor.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="d-flex flex-column gap-4">
      <div className="card p-4">
        <div className="d-flex flex-wrap align-items-center justify-content-between gap-3">
          <div>
            <h2 className="m-0"><i className="bi bi-folder me-2" />Admin • Setores</h2>
            <div className="muted mt-2">Cadastre novos setores e edite os que já existem no HUB.</div>
          </div>
          <button className="btn btn-outline-light" onClick={startCreate}>
            <i className="bi bi-plus-circle me-2" />Novo setor
          </button>
        </div>
      </div>

      <div className="row g-4">
        <div className="col-12 col-xl-5">
          <div className="card p-4 h-100">
            <h4 className="m-0">{title}</h4>
            <div className="muted mt-2">Preencha os dados abaixo para salvar o setor.</div>
            {err && <div className="mt-3"><Alert type="danger" message={err} /></div>}
            {ok && <div className="mt-3"><Alert type="success" message={ok} /></div>}

            <form className="mt-4 d-flex flex-column gap-3" onSubmit={onSubmit}>
              <div>
                <label className="form-label">Nome do setor</label>
                <input
                  className="form-control"
                  value={form.name}
                  onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))}
                  placeholder="Ex.: Manutenção"
                />
              </div>

              <div>
                <label className="form-label">Descrição</label>
                <textarea
                  className="form-control"
                  rows={5}
                  value={form.description}
                  onChange={(e) => setForm((s) => ({ ...s, description: e.target.value }))}
                  placeholder="Resumo do objetivo do setor"
                />
              </div>

              <div className="d-flex gap-2">
                <button className="btn btn-primary" disabled={saving} type="submit">
                  <i className={`bi ${editingId ? "bi-pencil-square" : "bi-check2-circle"} me-2`} />
                  {saving ? "Salvando..." : editingId ? "Salvar edição" : "Criar setor"}
                </button>
                {editingId && (
                  <button className="btn btn-outline-light" type="button" onClick={startCreate}>
                    Cancelar edição
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>

        <div className="col-12 col-xl-7">
          <div className="card p-4 h-100">
            <div className="d-flex align-items-center justify-content-between gap-3 mb-3">
              <h4 className="m-0">Setores cadastrados</h4>
              <span className="badge text-bg-secondary">{sectors.length} itens</span>
            </div>

            <div className="table-responsive">
              <table className="table table-dark table-hover align-middle mb-0">
                <thead>
                  <tr>
                    <th>Setor</th>
                    <th>Descrição</th>
                    <th className="text-center">KPIs</th>
                    <th className="text-end">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {sectors.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="text-center muted py-4">Nenhum setor encontrado.</td>
                    </tr>
                  ) : sectors.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <div className="fw-semibold">{item.name}</div>
                        <div className="small muted">ID {item.id}</div>
                      </td>
                      <td>{item.description || <span className="muted">Sem descrição</span>}</td>
                      <td className="text-center">{item.kpi_count}</td>
                      <td className="text-end">
                        <button className="btn btn-sm btn-outline-light" onClick={() => startEdit(item)}>
                          <i className="bi bi-pencil-square me-2" />Editar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
