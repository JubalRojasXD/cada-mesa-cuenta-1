// Edita estos valores antes de publicar.
export const BRAND = "Cada mesa cuenta"; // Lema de campaña; el nombre comercial definitivo está por definir (ver informe, sección 7.2).
export const WHATSAPP = ""; // Ej: "573001234567" (código país + número). Si está vacío, se usa correo.
export const EMAIL = "contacto@example.com";
export const TEAM = [
  "Deimerson Andres Aguirre Lesmes",
  "Angie Mariana Ruales Diaz",
  "Jubal Gustavo Rojas Vega",
  "Juan Esteban Ayala Rendon",
];
export const PLANS = [
  {
    name: "Plan básico",
    price: 79000,
    badge: "Primera versión",
    items: ["Registro y consulta de reservas", "Configuración de mesas", "Vista diaria y mapa del salón", "Indicadores básicos"],
  },
  {
    name: "Plan avanzado",
    price: 149000,
    badge: "Tras validar la versión básica",
    items: ["Todo lo del plan básico", "Varios usuarios", "Indicadores adicionales", "Reportes exportables"],
  },
];
export const cop = (n) => n.toLocaleString("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 });
