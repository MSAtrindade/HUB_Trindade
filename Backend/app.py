import os
import sqlite3
from datetime import datetime
from pathlib import Path
from threading import Lock

from flask import Flask, request, jsonify, session
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash

BASE_DIR = Path(__file__).resolve().parent
DB_PATH = BASE_DIR / "hub_local.db"
_db_ready = False
_db_lock = Lock()

def db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = db()
    cur = conn.cursor()

    cur.executescript("""
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'user'
    );

    CREATE TABLE IF NOT EXISTS sectors (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT
    );

    CREATE TABLE IF NOT EXISTS kpis (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sector_id INTEGER,
      title TEXT NOT NULL,
      description TEXT,
      pdf_url TEXT,
      FOREIGN KEY (sector_id) REFERENCES sectors(id)
    );

    CREATE TABLE IF NOT EXISTS requests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      sector_id INTEGER,
      title TEXT NOT NULL,
      details TEXT,
      status TEXT NOT NULL DEFAULT 'aberta',
      notes TEXT,
      created_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (sector_id) REFERENCES sectors(id)
    );
    """)

    conn.commit()

    # Seed admin
    cur.execute("SELECT id FROM users WHERE email = ?", ("admin@local",))
    if not cur.fetchone():
        cur.execute(
            "INSERT INTO users (name, email, password_hash, role) VALUES (?,?,?,?)",
            ("Admin", "admin@local", generate_password_hash("admin123"), "admin"),
        )

    # Seed user
    cur.execute("SELECT id FROM users WHERE email = ?", ("user@local",))
    if not cur.fetchone():
        cur.execute(
            "INSERT INTO users (name, email, password_hash, role) VALUES (?,?,?,?)",
            ("Usuário", "user@local", generate_password_hash("user123"), "user"),
        )

    # Seed sectors/kpis
    cur.execute("SELECT COUNT(*) as c FROM sectors")
    if cur.fetchone()["c"] == 0:
        cur.execute("INSERT INTO sectors (name, description) VALUES (?,?)",
                    ("CCO", "KPIs do Centro de Controle Operacional"))
        cur.execute("INSERT INTO sectors (name, description) VALUES (?,?)",
                    ("Planta", "KPIs da Produção da Planta"))
        cur.execute("INSERT INTO sectors (name, description) VALUES (?,?)",
                    ("Mina", "KPIs de Lavra e Frota"))

        conn.commit()

        cur.execute("SELECT id, name FROM sectors")
        sec = {r["name"]: r["id"] for r in cur.fetchall()}

        cur.execute("INSERT INTO kpis (sector_id, title, description, pdf_url) VALUES (?,?,?,?)",
                    (sec["CCO"], "UF / DF • Frota", "Disponibilidade Física e Utilização Física por equipamento.", None))
        cur.execute("INSERT INTO kpis (sector_id, title, description, pdf_url) VALUES (?,?,?,?)",
                    (sec["Planta"], "Produção Hora a Hora", "Ton/H por faixa de horário e comparativo de meta.", None))
        cur.execute("INSERT INTO kpis (sector_id, title, description, pdf_url) VALUES (?,?,?,?)",
                    (sec["Mina"], "ROM • Viagens", "Total de viagens e ROM por turno/dia.", None))

        conn.commit()

    conn.close()

def now_iso():
    return datetime.now().strftime("%Y-%m-%d %H:%M:%S")

def require_auth():
    uid = session.get("user_id")
    if not uid:
        return None
    return uid

def get_me():
    uid = session.get("user_id")
    if not uid:
        return None
    conn = db()
    cur = conn.cursor()
    cur.execute("SELECT id, name, email, role FROM users WHERE id = ?", (uid,))
    row = cur.fetchone()
    conn.close()
    if not row:
        return None
    return dict(row)

app = Flask(__name__)
app.secret_key = os.environ.get("SECRET_KEY", "dev-secret-key")

# Local: permite front Vite
CORS(
    app,
    origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    supports_credentials=True,
)

# Sessão/cookie para cross-site (mesmo no local ajuda)
app.config.update(
    SESSION_COOKIE_HTTPONLY=True,
    SESSION_COOKIE_SAMESITE="Lax",   # no local ok; em Vercel/Railway vira "None" + Secure
)

@app.before_request
def _startup_once():
    global _db_ready
    if _db_ready:
        return
    with _db_lock:
        if not _db_ready:
            init_db()
            _db_ready = True

@app.get("/health")
def health():
    return jsonify({"ok": True})

@app.get("/api/me")
def api_me():
    user = get_me()
    return jsonify({"ok": True, "user": user})

@app.post("/api/auth/login")
def api_login():
    data = request.get_json(force=True, silent=True) or {}
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""

    if not email or not password:
        return jsonify({"ok": False, "error": "Informe e-mail e senha"}), 400

    conn = db()
    cur = conn.cursor()
    cur.execute("SELECT id, name, email, role, password_hash FROM users WHERE email = ?", (email,))
    u = cur.fetchone()
    conn.close()

    if not u or not check_password_hash(u["password_hash"], password):
        return jsonify({"ok": False, "error": "Credenciais inválidas"}), 401

    session["user_id"] = u["id"]
    session["role"] = u["role"]

    return jsonify({"ok": True, "user": {"id": u["id"], "name": u["name"], "email": u["email"], "role": u["role"]}})

@app.post("/api/auth/logout")
def api_logout():
    session.clear()
    return jsonify({"ok": True})

@app.get("/api/home")
def api_home():
    if not require_auth():
        return jsonify({"ok": False, "error": "Não autenticado"}), 401

    conn = db()
    cur = conn.cursor()
    cur.execute("SELECT COUNT(*) c FROM sectors"); sectors = cur.fetchone()["c"]
    cur.execute("SELECT COUNT(*) c FROM kpis"); kpis = cur.fetchone()["c"]
    cur.execute("SELECT COUNT(*) c FROM requests"); reqs = cur.fetchone()["c"]
    conn.close()

    return jsonify({"sectors": sectors, "kpis": kpis, "requests": reqs})

@app.get("/api/sectors")
def api_sectors():
    if not require_auth():
        return jsonify({"ok": False, "error": "Não autenticado"}), 401

    conn = db()
    cur = conn.cursor()
    cur.execute("""
      SELECT s.id, s.name, s.description,
             (SELECT COUNT(*) FROM kpis k WHERE k.sector_id = s.id) as kpi_count
      FROM sectors s
      ORDER BY s.name
    """)
    sectors = [dict(r) for r in cur.fetchall()]
    conn.close()
    return jsonify({"sectors": sectors})

@app.get("/api/sectors/<int:sector_id>/kpis")
def api_sector_kpis(sector_id: int):
    if not require_auth():
        return jsonify({"ok": False, "error": "Não autenticado"}), 401

    conn = db()
    cur = conn.cursor()

    cur.execute("SELECT id, name, description FROM sectors WHERE id = ?", (sector_id,))
    sector = cur.fetchone()
    if not sector:
        conn.close()
        return jsonify({"ok": False, "error": "Setor não encontrado"}), 404

    cur.execute("""
      SELECT id, sector_id, title, description,
             CASE WHEN pdf_url IS NULL OR pdf_url = '' THEN 0 ELSE 1 END as has_pdf
      FROM kpis
      WHERE sector_id = ?
      ORDER BY title
    """, (sector_id,))
    kpis = [dict(r) for r in cur.fetchall()]
    conn.close()

    return jsonify({"sector": dict(sector), "kpis": kpis})

@app.get("/api/kpis/<int:kpi_id>")
def api_kpi(kpi_id: int):
    if not require_auth():
        return jsonify({"ok": False, "error": "Não autenticado"}), 401

    conn = db()
    cur = conn.cursor()
    cur.execute("""
      SELECT id, sector_id, title, description, pdf_url
      FROM kpis
      WHERE id = ?
    """, (kpi_id,))
    kpi = cur.fetchone()
    conn.close()

    if not kpi:
        return jsonify({"ok": False, "error": "KPI não encontrado"}), 404

    return jsonify(dict(kpi))

@app.get("/api/requests")
def api_requests_list():
    uid = require_auth()
    if not uid:
        return jsonify({"ok": False, "error": "Não autenticado"}), 401

    conn = db()
    cur = conn.cursor()

    # admin vê tudo, user vê só suas
    role = session.get("role", "user")
    if role == "admin":
        cur.execute("""
          SELECT r.*, u.name as user_name
          FROM requests r
          JOIN users u ON u.id = r.user_id
          ORDER BY r.id DESC
          LIMIT 200
        """)
    else:
        cur.execute("""
          SELECT r.*
          FROM requests r
          WHERE r.user_id = ?
          ORDER BY r.id DESC
          LIMIT 200
        """, (uid,))

    rows = []
    for r in cur.fetchall():
        d = dict(r)
        st = (d.get("status") or "").lower()
        d["status_color"] = "secondary"
        if st in ("aberta", "open"): d["status_color"] = "warning"
        if st in ("em_andamento", "andamento"): d["status_color"] = "info"
        if st in ("concluida", "concluída", "done"): d["status_color"] = "success"
        if st in ("reprovada", "cancelada"): d["status_color"] = "danger"
        rows.append(d)

    conn.close()
    return jsonify({"requests": rows})

@app.post("/api/requests")
def api_requests_create():
    uid = require_auth()
    if not uid:
        return jsonify({"ok": False, "error": "Não autenticado"}), 401

    data = request.get_json(force=True, silent=True) or {}
    title = (data.get("title") or "").strip()
    details = (data.get("details") or "").strip()
    sector_id = data.get("sector_id") or None

    if not title:
        return jsonify({"ok": False, "error": "Título é obrigatório"}), 400

    conn = db()
    cur = conn.cursor()
    cur.execute("""
      INSERT INTO requests (user_id, sector_id, title, details, status, notes, created_at)
      VALUES (?, ?, ?, ?, 'aberta', '', ?)
    """, (uid, sector_id, title, details, now_iso()))
    conn.commit()
    conn.close()

    return jsonify({"ok": True}), 201

# Admin endpoints (simples só pra não quebrar as telas)
def require_admin():
    if not require_auth():
        return False
    return session.get("role") == "admin"

@app.get("/api/admin/dashboard")
def api_admin_dashboard():
    if not require_admin():
        return jsonify({"ok": False, "error": "Sem permissão"}), 403
    conn = db(); cur = conn.cursor()
    cur.execute("SELECT COUNT(*) c FROM users"); users = cur.fetchone()["c"]
    cur.execute("SELECT COUNT(*) c FROM sectors"); sectors = cur.fetchone()["c"]
    cur.execute("SELECT COUNT(*) c FROM kpis"); kpis = cur.fetchone()["c"]
    cur.execute("SELECT COUNT(*) c FROM requests"); reqs = cur.fetchone()["c"]
    conn.close()
    return jsonify({"users": users, "sectors": sectors, "kpis": kpis, "requests": reqs})

@app.get("/api/admin/users")
def api_admin_users():
    if not require_admin():
        return jsonify({"ok": False, "error": "Sem permissão"}), 403
    conn = db(); cur = conn.cursor()
    cur.execute("SELECT id, name, email, role FROM users ORDER BY id DESC")
    data = [dict(r) for r in cur.fetchall()]
    conn.close()
    return jsonify({"users": data})

@app.get("/api/admin/sectors")
def api_admin_sectors():
    if not require_admin():
        return jsonify({"ok": False, "error": "Sem permissão"}), 403
    conn = db(); cur = conn.cursor()
    cur.execute("SELECT id, name, description FROM sectors ORDER BY name")
    data = [dict(r) for r in cur.fetchall()]
    conn.close()
    return jsonify({"sectors": data})

@app.get("/api/admin/kpis")
def api_admin_kpis():
    if not require_admin():
        return jsonify({"ok": False, "error": "Sem permissão"}), 403
    conn = db(); cur = conn.cursor()
    cur.execute("SELECT id, sector_id, title, description, pdf_url FROM kpis ORDER BY id DESC")
    data = [dict(r) for r in cur.fetchall()]
    conn.close()
    return jsonify({"kpis": data})

@app.get("/api/admin/assign")
def api_admin_assign():
    if not require_admin():
        return jsonify({"ok": False, "error": "Sem permissão"}), 403
    return jsonify({"ok": True, "note": "Placeholder: permissões por setor/kpi"})

@app.get("/api/admin/logs")
def api_admin_logs():
    if not require_admin():
        return jsonify({"ok": False, "error": "Sem permissão"}), 403
    return jsonify({"ok": True, "note": "Placeholder: logs"})

@app.get("/api/admin/requests")
def api_admin_requests():
    if not require_admin():
        return jsonify({"ok": False, "error": "Sem permissão"}), 403
    conn = db(); cur = conn.cursor()
    cur.execute("""
      SELECT r.*, u.name as user_name
      FROM requests r
      JOIN users u ON u.id = r.user_id
      ORDER BY r.id DESC
      LIMIT 200
    """)
    data = [dict(r) for r in cur.fetchall()]
    conn.close()
    return jsonify({"requests": data})

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    app.run(host="0.0.0.0", port=port)



