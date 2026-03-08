import React, { useEffect, useState } from "react";
import { api } from "../../lib/api";
import { Alert } from "../../ui/Toast";

type AssignItem = { module: string; status: string; description: string };

export function AdminAssign() {
  const [items, setItems] = useState<AssignItem[]>([]);
  const [note, setNote] = useState("");
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    api<{ note: string; items: AssignItem[] }>("/api/admin/assign")
      .then((r) => { setItems(r.items || []); setNote(r.note || ""); })
      .catch((e) => setErr(e.message));
  }, []);

  return (
    <div className="card p-4">
      <h2 className="m-0"><i className="bi bi-person-check me-2" />Admin • Permissões</h2>
      <div className="muted mt-2">{note || "Área administrativa separada da Home principal."}</div>
      {err && <div className="mt-3"><Alert type="danger" message={err} /></div>}
      <div className="row g-3 mt-1">
        {items.map((item) => (
          <div className="col-12 col-lg-4" key={item.module}>
            <div className="card hub-card p-4 h-100">
              <h5 className="m-0 text-white">{item.module}</h5>
              <div className="mt-2"><span className="badge text-bg-info">{item.status}</span></div>
              <div className="muted mt-3">{item.description}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
