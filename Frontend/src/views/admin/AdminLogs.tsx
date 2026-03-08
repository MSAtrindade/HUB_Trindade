import React, { useEffect, useState } from "react";
import { api } from "../../lib/api";
import { Alert } from "../../ui/Toast";

type LogItem = { level: string; message: string; created_at: string };

export function AdminLogs() {
  const [items, setItems] = useState<LogItem[]>([]);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    api<{ items: LogItem[] }>("/api/admin/logs").then((r) => setItems(r.items || [])).catch((e) => setErr(e.message));
  }, []);

  return (
    <div className="card p-4">
      <h2 className="m-0"><i className="bi bi-bug me-2" />Admin • Logs</h2>
      <div className="muted mt-2">Visão administrativa dedicada para registros do sistema.</div>
      {err && <div className="mt-3"><Alert type="danger" message={err} /></div>}
      <div className="table-responsive mt-4">
        <table className="table table-dark align-middle mb-0">
          <thead><tr><th>Nível</th><th>Mensagem</th><th>Data</th></tr></thead>
          <tbody>
            {items.map((item, idx) => (
              <tr key={`${item.created_at}-${idx}`}><td><span className="badge text-bg-secondary">{item.level}</span></td><td>{item.message}</td><td>{item.created_at}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
