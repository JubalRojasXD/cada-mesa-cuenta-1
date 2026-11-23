import { useEffect, useMemo, useState } from "react";

const KEY = "cmc-demo-v1";
const today = () => {
  const d = new Date();
  return new Date(d.getTime() - d.getTimezoneOffset() * 6e4).toISOString().slice(0, 10);
};
const toMin = (t) => { const [h, m] = t.split(":").map(Number); return h * 60 + m; };
const fmt = (m) => `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
const uid = () => Math.random().toString(36).slice(2, 9);
const ACTIVE = (r) => r.estado === "pendiente" || r.estado === "confirmada" || r.estado === "asistio";
const ESTADOS = { pendiente: "Pendiente", confirmada: "Confirmada", asistio: "Asistió", no_asistio: "No asistió", cancelada: "Cancelada" };

const seedTables = () => [
  { id: "t1", nombre: "Mesa 1", cupo: 2 }, { id: "t2", nombre: "Mesa 2", cupo: 2 },
  { id: "t3", nombre: "Mesa 3", cupo: 4 }, { id: "t4", nombre: "Mesa 4", cupo: 4 },
  { id: "t5", nombre: "Mesa 5", cupo: 4 }, { id: "t6", nombre: "Mesa 6", cupo: 6 },
  { id: "t7", nombre: "Mesa 7", cupo: 6 }, { id: "t8", nombre: "Mesa 8", cupo: 8 },
];
const seedRes = () => {
  const d = today();
  return [
    { id: uid(), fecha: d, hora: "12:30", dur: 90, personas: 2, mesaId: "t1", nombre: "Laura Gómez", tel: "3001112233", notas: "", estado: "confirmada" },
    { id: uid(), fecha: d, hora: "13:00", dur: 90, personas: 4, mesaId: "t3", nombre: "Carlos Pérez", tel: "3014445566", notas: "Cumpleaños", estado: "pendiente" },
    { id: uid(), fecha: d, hora: "19:30", dur: 120, personas: 6, mesaId: "t6", nombre: "Familia Rojas", tel: "3027778899", notas: "", estado: "confirmada" },
    { id: uid(), fecha: d, hora: "20:00", dur: 90, personas: 2, mesaId: "t2", nombre: "Andrea Díaz", tel: "3039990011", notas: "Terraza si es posible", estado: "pendiente" },
  ];
};

const load = () => {
  try {
    const s = JSON.parse(localStorage.getItem(KEY));
    if (s && s.mesas && s.reservas) return s;
  } catch { /* sin datos previos */ }
  return { mesas: seedTables(), reservas: seedRes() };
};

const overlaps = (a, b) => {
  const as = toMin(a.hora), bs = toMin(b.hora);
  return a.fecha === b.fecha && as < bs + b.dur && bs < as + a.dur;
};
const conflict = (r, all) =>
  all.find((x) => x.id !== r.id && x.mesaId === r.mesaId && ACTIVE(x) && ACTIVE(r) && overlaps(r, x));

export default function Demo() {
  const [data, setData] = useState(load);
  const [tab, setTab] = useState("mapa");
  const [fecha, setFecha] = useState(today());
  const [hora, setHora] = useState("13:00");
  const [editing, setEditing] = useState(null);

  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify(data)); } catch { /* almacenamiento no disponible */ }
  }, [data]);

  const { mesas, reservas } = data;
  const setRes = (fn) => setData((d) => ({ ...d, reservas: fn(d.reservas) }));
  const setMesas = (fn) => setData((d) => ({ ...d, mesas: fn(d.mesas) }));

  const save = (r) => {
    setRes((list) => (list.some((x) => x.id === r.id) ? list.map((x) => (x.id === r.id ? r : x)) : [...list, r]));
    setEditing(null);
  };
  const patch = (id, p) => setRes((l) => l.map((x) => (x.id === id ? { ...x, ...p } : x)));
  const remove = (id) => setRes((l) => l.filter((x) => x.id !== id));
  const reset = () => { if (confirm("¿Restablecer los datos de ejemplo?")) setData({ mesas: seedTables(), reservas: seedRes() }); };

  const newRes = (mesaId = "") => setEditing({ id: uid(), fecha, hora, dur: 90, personas: 2, mesaId, nombre: "", tel: "", notas: "", estado: "pendiente" });

  return (
    <main className="demo">
      <div className="demo-head">
        <div>
          <h1>Demo del sistema</h1>
          <p className="muted">Los datos se guardan solo en este navegador. Es una demostración, no un servicio en producción.</p>
        </div>
        <div className="row">
          <button className="btn" onClick={() => newRes()}>+ Nueva reserva</button>
          <button className="btn ghost" onClick={reset}>Restablecer</button>
        </div>
      </div>

      <div className="tabs" role="tablist">
        {[["mapa", "Mapa de mesas"], ["agenda", "Agenda"], ["kpi", "Indicadores"], ["mesas", "Configurar mesas"]].map(([k, l]) => (
          <button key={k} role="tab" aria-selected={tab === k} className={tab === k ? "on" : ""} onClick={() => setTab(k)}>{l}</button>
        ))}
      </div>

      {(tab === "mapa" || tab === "agenda") && (
        <div className="filters">
          <label>Fecha<input type="date" value={fecha} onChange={(e) => e.target.value && setFecha(e.target.value)} /></label>
          {tab === "mapa" && <label>Hora<input type="time" step="900" value={hora} onChange={(e) => e.target.value && setHora(e.target.value)} /></label>}
        </div>
      )}

      {tab === "mapa" && <MapView mesas={mesas} reservas={reservas} fecha={fecha} hora={hora} onFree={newRes} onEdit={setEditing} />}
      {tab === "agenda" && <Agenda mesas={mesas} reservas={reservas} fecha={fecha} patch={patch} remove={remove} onEdit={setEditing} />}
      {tab === "kpi" && <Kpis reservas={reservas} />}
      {tab === "mesas" && <Tables mesas={mesas} reservas={reservas} setMesas={setMesas} />}

      {editing && <Form r={editing} mesas={mesas} reservas={reservas} onSave={save} onClose={() => setEditing(null)} />}
    </main>
  );
}

function MapView({ mesas, reservas, fecha, hora, onFree, onEdit }) {
  const probe = { fecha, hora, dur: 1 };
  const at = (m) => reservas.find((r) => r.mesaId === m.id && ACTIVE(r) && overlaps(probe, r));
  const free = mesas.filter((m) => !at(m)).length;
  return (
    <>
      <p className="legend">
        <span className="sw free" /> Libre ({free}) <span className="sw busy" /> Reservada ({mesas.length - free})
        <span className="muted"> · Toca una mesa libre para reservar o una ocupada para ver la reserva.</span>
      </p>
      <div className="floor">
        {mesas.map((m) => {
          const r = at(m);
          return (
            <button key={m.id} className={`table ${r ? "busy" : "free"} ${m.cupo > 4 ? "wide" : ""}`} onClick={() => (r ? onEdit(r) : onFree(m.id))}>
              <strong>{m.nombre}</strong>
              <span>{m.cupo} pers.</span>
              {r && <small>{r.nombre} · {r.hora}</small>}
            </button>
          );
        })}
      </div>
    </>
  );
}

function Agenda({ mesas, reservas, fecha, patch, remove, onEdit }) {
  const day = useMemo(() => reservas.filter((r) => r.fecha === fecha).sort((a, b) => a.hora.localeCompare(b.hora)), [reservas, fecha]);
  const name = (id) => mesas.find((m) => m.id === id)?.nombre || "Sin mesa";
  if (!day.length) return <p className="empty">No hay reservas para esta fecha.</p>;
  return (
    <div className="list">
      {day.map((r) => (
        <article key={r.id} className={`res ${r.estado}`}>
          <div className="time">{r.hora}<small>{r.dur} min</small></div>
          <div className="info">
            <strong>{r.nombre}</strong> · {r.personas} pers. · {name(r.mesaId)}
            <div className="muted">{r.tel}{r.notas && ` · ${r.notas}`}</div>
            <span className={`tag st-${r.estado}`}>{ESTADOS[r.estado]}</span>
          </div>
          <div className="actions">
            {r.estado === "pendiente" && <button onClick={() => patch(r.id, { estado: "confirmada" })}>Confirmar</button>}
            {r.estado === "confirmada" && <button onClick={() => patch(r.id, { estado: "asistio" })}>Asistió</button>}
            {r.estado === "confirmada" && <button onClick={() => patch(r.id, { estado: "no_asistio" })}>No asistió</button>}
            {ACTIVE(r) && r.estado !== "asistio" && <button onClick={() => patch(r.id, { estado: "cancelada" })}>Cancelar</button>}
            <button onClick={() => onEdit(r)}>Editar</button>
            <button className="danger" onClick={() => confirm("¿Eliminar reserva?") && remove(r.id)}>Eliminar</button>
          </div>
        </article>
      ))}
    </div>
  );
}

function Kpis({ reservas }) {
  const n = reservas.length;
  const c = (e) => reservas.filter((r) => r.estado === e).length;
  const byHour = {};
  reservas.filter((r) => r.estado !== "cancelada").forEach((r) => { const h = r.hora.slice(0, 2); byHour[h] = (byHour[h] || 0) + 1; });
  const hours = Object.keys(byHour).sort();
  const max = Math.max(1, ...Object.values(byHour));
  const avg = n ? (reservas.reduce((s, r) => s + Number(r.personas), 0) / n).toFixed(1) : "0";
  const pct = (x) => (n ? Math.round((x / n) * 100) : 0);
  return (
    <>
      <div className="kpis">
        {[["Reservas registradas", n], ["Confirmadas", c("confirmada")], ["Cancelaciones", `${c("cancelada")} (${pct(c("cancelada"))}%)`], ["Inasistencias", c("no_asistio")], ["Personas por reserva", avg]].map(([l, v]) => (
          <div className="kpi" key={l}><span>{l}</span><strong>{v}</strong></div>
        ))}
      </div>
      <h3>Reservas por franja horaria</h3>
      {hours.length ? (
        <div className="bars">
          {hours.map((h) => (
            <div key={h} className="bar"><div style={{ height: `${(byHour[h] / max) * 100}%` }}><b>{byHour[h]}</b></div><span>{h}:00</span></div>
          ))}
        </div>
      ) : <p className="empty">Aún no hay datos.</p>}
    </>
  );
}

function Tables({ mesas, reservas, setMesas }) {
  const [nombre, setNombre] = useState("");
  const [cupo, setCupo] = useState(4);
  const add = (e) => {
    e.preventDefault();
    if (!nombre.trim()) return;
    setMesas((l) => [...l, { id: uid(), nombre: nombre.trim(), cupo: Number(cupo) }]);
    setNombre("");
  };
  const del = (m) => {
    if (reservas.some((r) => r.mesaId === m.id && ACTIVE(r))) return alert("Esta mesa tiene reservas activas. Cancélalas o reasígnalas primero.");
    setMesas((l) => l.filter((x) => x.id !== m.id));
  };
  return (
    <>
      <form className="inline" onSubmit={add}>
        <input placeholder="Nombre de la mesa" value={nombre} onChange={(e) => setNombre(e.target.value)} />
        <input type="number" min="1" max="30" value={cupo} onChange={(e) => setCupo(e.target.value)} aria-label="Cupo" />
        <button className="btn small" type="submit">Agregar mesa</button>
      </form>
      <div className="list">
        {mesas.map((m) => (
          <article className="res" key={m.id}>
            <div className="info"><strong>{m.nombre}</strong> · cupo {m.cupo}</div>
            <div className="actions"><button className="danger" onClick={() => del(m)}>Quitar</button></div>
          </article>
        ))}
      </div>
    </>
  );
}

function Form({ r, mesas, reservas, onSave, onClose }) {
  const [f, setF] = useState(r);
  const [err, setErr] = useState("");
  const exists = reservas.some((x) => x.id === r.id);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const suggest = () => {
    const ok = mesas
      .filter((m) => m.cupo >= f.personas && !conflict({ ...f, mesaId: m.id }, reservas))
      .sort((a, b) => a.cupo - b.cupo)[0];
    if (ok) setF({ ...f, mesaId: ok.id }); else setErr("No hay mesas disponibles para ese horario y tamaño de grupo.");
  };

  const submit = (e) => {
    e.preventDefault();
    const m = mesas.find((x) => x.id === f.mesaId);
    const out = { ...f, personas: Number(f.personas), dur: Number(f.dur) };
    if (!m) return setErr("Selecciona una mesa.");
    if (m.cupo < out.personas) return setErr(`${m.nombre} tiene cupo para ${m.cupo} personas.`);
    const c = conflict(out, reservas);
    if (c) return setErr(`Conflicto: ${m.nombre} ya está reservada por ${c.nombre} a las ${c.hora} (${c.dur} min).`);
    onSave(out);
  };

  return (
    <div className="overlay" onClick={onClose}>
      <form className="modal" onClick={(e) => e.stopPropagation()} onSubmit={submit}>
        <h2>{exists ? "Editar reserva" : "Nueva reserva"}</h2>
        <label>Nombre<input required value={f.nombre} onChange={set("nombre")} /></label>
        <label>Teléfono<input required value={f.tel} onChange={set("tel")} inputMode="tel" /></label>
        <div className="two">
          <label>Fecha<input required type="date" value={f.fecha} onChange={set("fecha")} /></label>
          <label>Hora<input required type="time" step="900" value={f.hora} onChange={set("hora")} /></label>
        </div>
        <div className="two">
          <label>Personas<input required type="number" min="1" max="30" value={f.personas} onChange={set("personas")} /></label>
          <label>Duración (min)<input required type="number" min="30" step="15" value={f.dur} onChange={set("dur")} /></label>
        </div>
        <label>Mesa
          <select value={f.mesaId} onChange={set("mesaId")}>
            <option value="">Seleccionar…</option>
            {mesas.map((m) => <option key={m.id} value={m.id}>{m.nombre} (cupo {m.cupo})</option>)}
          </select>
        </label>
        <button type="button" className="btn ghost small" onClick={suggest}>Sugerir mesa disponible</button>
        <label>Notas (opcional)<input value={f.notas} onChange={set("notas")} /></label>
        <label>Estado
          <select value={f.estado} onChange={set("estado")}>
            {Object.entries(ESTADOS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </label>
        <p className="muted">Solo se solicitan los datos mínimos necesarios para gestionar la reserva.</p>
        {err && <p className="error" role="alert">{err}</p>}
        <div className="row end">
          <button type="button" className="btn ghost" onClick={onClose}>Cerrar</button>
          <button className="btn" type="submit">Guardar</button>
        </div>
      </form>
    </div>
  );
}
