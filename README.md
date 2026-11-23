# Cada mesa cuenta — Software web de reservas de mesas

Proyecto académico (Ingeniería en Sistemas, UDI, Bucaramanga). Landing comercial + demo funcional
(mapa de mesas, agenda, reservas con detección de conflictos, indicadores y configuración de mesas).
Los datos de la demo se guardan en `localStorage` del navegador.

## Ejecutar localmente
```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # genera /dist
```

## Personalizar
Edita `src/config.js`: nombre, WhatsApp, correo, equipo y planes.

## Despliegue
Vercel detecta Vite automáticamente (Build: `npm run build`, Output: `dist`).
