import React, { useEffect, useState } from "react";
import { api } from "../../lib/api";
import { Alert } from "../../ui/Toast";

export function AdminSectors() {
  const [data, setData] = useState<any>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    api("/api/admin/sectors").then(setData).catch((e) => setErr(e.message));
  }, []);

  return (
    <div className="card p-4">
      <h3 className="m-0"><i className="bi bi-folder me-2" />Admin • Setores</h3>
      <div className="muted mt-2">Página administrativa (mesmo estilo do HUB).</div>
      {err && <div className="mt-3"><Alert type="danger" message={err} /></div>}
      {data && <pre className="mt-3" style={{ whiteSpace: "pre-wrap" }}>{JSON.stringify(data, null, 2)}</pre>}
    </div>
  );
}
