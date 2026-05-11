# Crave 🍽️

Plataforma que conecta consumidores con restaurantes que ofrecen excedentes de comida a precios reducidos, reduciendo el desperdicio de alimentos.

## Para consumidores

Explorá ofertas cercanas en un mapa o lista, reservá packs de comida y retiralos en el local. Cada pack tiene un código único de recogida.

## Para restaurantes

Registrá tu negocio, creá packs sorpresa o fijos, gestioná órdenes entrantes y verificá la recogida con código QR.

## Proyectos

| App | Puerto | Stack |
|---|---|---|
| `backend/` | `:3000` | Express.js, Supabase, JWT |
| `client-app/` | `:5173` | React 19, Vite, Leaflet |
| `store-app/` | `:5174` | React 19, Vite, CSS Modules |

## Stack

**Frontend:** React, TypeScript, Vite, React Router, Zustand, CSS Modules
**Backend:** Node.js, Express, Supabase (PostgreSQL + Storage)
**Mapa:** Leaflet + OpenStreetMap

## Inicio rápido

```bash
git clone https://github.com/n1car/Base-Crave.git
cd Base-Crave

cp backend/.env.example backend/.env
cp client-app/.env.example client-app/.env
cp store-app/.env.example store-app/.env
# Completar credenciales de Supabase en cada .env

cd backend    && npm install && npm run dev
cd client-app && npm install && npm run dev
cd store-app  && npm install && npm run dev
```

## Scripts

| Comando | Descripción |
|---|---|
| `npm run dev` | Inicia servidor de desarrollo |
| `npm run build` | Compila y empaqueta para producción |
| `npm run preview` | Vista previa de build |


## Estructura

```
Base-Crave/
├── backend/         # API REST
│   └── src/
│       ├── routes/    # Endpoints
│       └── services/  # Lógica de negocio
├── client-app/      # App consumidores
│   └── src/
│       ├── pages/      # Vistas
│       ├── components/ # Componentes compartidos
│       └── store/      # Estado (Zustand)
└── store-app/       # App restaurantes
    └── src/
        ├── pages/      # Vistas
        ├── components/ # Componentes compartidos
        └── store/      # Estado (Zustand)
```
