# Farmacia Control

Sistema web para control de farmacia con frontend en React/Vite y backend en ASP.NET Core.

## Estructura

- `frontend/`: aplicacion web React.
- `backend/`: API ASP.NET Core con Entity Framework y MySQL.

## Ejecutar frontend

```bash
cd frontend
npm install
npm run dev
```

## Ejecutar backend

Abrir `backend/FarmaciaControlAPI.sln` en Visual Studio y ejecutar el perfil HTTPS.

La API queda configurada para `https://localhost:7120`.

## Base de datos

El backend usa MySQL y la cadena de conexion esta en `backend/appsettings.json`.
