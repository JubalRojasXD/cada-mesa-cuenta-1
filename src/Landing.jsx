import { useState } from "react";
import { BRAND, EMAIL, PLANS, TEAM, WHATSAPP, cop } from "./config.js";

const PROBLEMS = [
  ["Reservas cruzadas", "Cuadernos, llamadas y mensajes sueltos dejan la información desactualizada."],
  ["Respuestas tardías", "Se pierden solicitudes cuando no hay claridad sobre la disponibilidad."],
  ["Sin datos para decidir", "No hay registro ordenado de horas pico, cancelaciones ni uso de mesas."],
];

const FEATURES = [
  ["Registro de reservas", "Crear, consultar, modificar y cancelar con fecha, hora, personas y contacto.", "Demo disponible"],
  ["Mapa visual de mesas", "Vista del salón con el estado de cada mesa según fecha y hora.", "Demo disponible"],
  ["Agenda de turnos", "Reservas del día por franja horaria, con confirmación en un clic.", "Demo disponible"],
  ["Panel de administración", "Configuración de mesas y capacidad del establecimiento.", "Demo disponible"],
  ["Indicadores básicos", "Reservas, cancelaciones, inasistencias y distribución por horario.", "Demo disponible"],
  ["Recordatorios y lista de espera", "Avisos por canales digitales y seguimiento de clientes en espera.", "Fase posterior"],
];

const STEPS = [
  "El administrador configura el restaurante y sus mesas.",
  "El personal registra la reserva y ve la disponibilidad.",
  "El sistema evita cruces y muestra el estado de cada mesa.",
  "El administrador revisa indicadores para organizar el servicio.",
];

export default function Landing() {
  return (
    <main>
      <section className="hero">
        <div className="reveal">
          <span className="pill">Para restaurantes independientes de Bucaramanga</span>
          <h1>Tu restaurante, <em>mejor organizado.</em></h1>
          <p className="lead">
            Aplicación web por suscripción para centralizar reservas, ver la disponibilidad de mesas en un mapa
            del salón y contar con indicadores para tomar decisiones. Sin instalar nada: solo un navegador.
          </p>
          <div className="row">
            <a className="btn" href="#/demo">Probar la demo</a>
            <a className="btn ghost" href="#contacto">Solicitar demostración guiada</a>
          </div>
        </div>
        <div className="hero-wrap">
          <img className="hero-img" src="/mesero.jpg" alt="Mesero consultando el mapa de mesas en una tableta" />
          <span className="hero-badge">Mesa libre ✓</span>
        </div>
      </section>

      <section className="band">
        <div>
          <h2>Tus clientes saben cuál es su mesa</h2>
          <p>Con la disponibilidad clara y las reservas centralizadas, el cliente llega sin incertidumbre y el restaurante sabe qué mesa asignar.</p>
          <a className="btn" href="#/demo">Ver el mapa de mesas</a>
        </div>
      </section>

      <section id="problema" className="section">
        <h2>El problema</h2>
        <p className="sub">
          En muchos restaurantes pequeños las reservas se gestionan con cuadernos, llamadas, mensajes o archivos separados.
        </p>
        <div className="grid3">
          {PROBLEMS.map(([t, d]) => (
            <article className="card" key={t}><h3>{t}</h3><p>{d}</p></article>
          ))}
        </div>
      </section>

      <section id="solucion" className="section alt">
        <h2>La solución</h2>
        <p className="sub">Una herramienta sencilla, diseñada para el contexto operativo de restaurantes pequeños.</p>
        <div className="grid3">
          {FEATURES.map(([t, d, s]) => (
            <article className="card" key={t}>
              <h3>{t}</h3>
              <p>{d}</p>
              <span className={`tag ${s === "Fase posterior" ? "later" : ""}`}>{s}</span>
            </article>
          ))}
        </div>
        <h3 className="center">Cómo funciona</h3>
        <ol className="steps">
          {STEPS.map((s) => <li key={s}>{s}</li>)}
        </ol>
      </section>

      <section id="planes" className="section">
        <h2>Planes por suscripción mensual</h2>
        <p className="sub">Precios experimentales para validación con restaurantes reales; no son tarifa oficial.</p>
        <div className="grid2">
          {PLANS.map((p) => (
            <article className="card plan" key={p.name}>
              <span className="tag">{p.badge}</span>
              <h3>{p.name}</h3>
              <p className="price">{cop(p.price)}<small> / mes</small></p>
              <ul>{p.items.map((i) => <li key={i}>{i}</li>)}</ul>
              <a className="btn" href="#contacto">Quiero una demostración</a>
            </article>
          ))}
        </div>
      </section>

      <section className="section alt">
        <h2>Campaña “Cada mesa cuenta”</h2>
        <p className="sub">
          Publicaciones en Instagram y Facebook, contacto por WhatsApp Business, visitas y demostraciones guiadas.
          Metas preliminares en dos semanas: contactar 20 restaurantes, 8 solicitudes de información y 4 demostraciones.
        </p>
      </section>

      <Contact />

      <section className="section">
        <h2>Equipo</h2>
        <p className="sub">Universidad de Investigación y Desarrollo (UDI) · Proyecto Emprendedor</p>
        <ul className="team">{TEAM.map((m) => <li key={m}>{m}</li>)}</ul>
      </section>
    </main>
  );
}

function Contact() {
  const [f, setF] = useState({ nombre: "", restaurante: "", contacto: "", mensaje: "" });
  const [ok, setOk] = useState(false);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const submit = (e) => {
    e.preventDefault();
    const text = `Hola, soy ${f.nombre} de ${f.restaurante}. Contacto: ${f.contacto}. ${f.mensaje} (Solicito demostración de ${BRAND})`;
    const url = WHATSAPP
      ? `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(text)}`
      : `mailto:${EMAIL}?subject=${encodeURIComponent("Solicitud de demostración")}&body=${encodeURIComponent(text)}`;
    setOk(true);
    window.open(url, "_blank", "noopener");
  };

  return (
    <section id="contacto" className="section">
      <h2>Solicita una demostración guiada</h2>
      <p className="sub">Cuéntanos sobre tu restaurante y te contactamos.</p>
      <form className="form" onSubmit={submit}>
        <label>Tu nombre<input required value={f.nombre} onChange={set("nombre")} /></label>
        <label>Restaurante<input required value={f.restaurante} onChange={set("restaurante")} /></label>
        <label>Teléfono o correo<input required value={f.contacto} onChange={set("contacto")} /></label>
        <label>Mensaje (opcional)<textarea rows="3" value={f.mensaje} onChange={set("mensaje")} /></label>
        <p className="muted">
          Usaremos tus datos únicamente para contactarte sobre esta solicitud (Ley 1581 de 2012). No se almacenan en este sitio.
        </p>
        <button className="btn" type="submit">Enviar solicitud</button>
        {ok && <p className="okmsg">Se abrió tu aplicación de mensajería/correo para enviar la solicitud.</p>}
      </form>
    </section>
  );
}
