import { useEffect, useState } from "react";
import Landing from "./Landing.jsx";
import Demo from "./Demo.jsx";
import { BRAND } from "./config.js";

const route = () => (window.location.hash.startsWith("#/demo") ? "demo" : "home");

export default function App() {
  const [page, setPage] = useState(route());
  useEffect(() => {
    const on = () => { setPage(route()); window.scrollTo(0, 0); };
    window.addEventListener("hashchange", on);
    return () => window.removeEventListener("hashchange", on);
  }, []);

  return (
    <>
      <header className="nav">
        <a className="logo" href="#/"><img className="logoimg" src="/logo.jpg" alt={BRAND} /></a>
        <nav>
          {page === "home" ? (
            <>
              <a href="#problema">Problema</a>
              <a href="#solucion">Solución</a>
              <a href="#planes">Planes</a>
              <a href="#contacto">Contacto</a>
            </>
          ) : (
            <a href="#/">Inicio</a>
          )}
          <a className="btn small" href="#/demo">Probar demo</a>
        </nav>
      </header>
      {page === "home" ? <Landing /> : <Demo />}
      <footer className="footer">
        <p>© {new Date().getFullYear()} {BRAND} · Proyecto académico, Ingeniería en Sistemas, UDI · Bucaramanga, Santander.</p>
        <p className="muted">Los precios mostrados son experimentales y no constituyen una tarifa oficial. La demo guarda datos solo en su navegador.</p>
      </footer>
    </>
  );
}
