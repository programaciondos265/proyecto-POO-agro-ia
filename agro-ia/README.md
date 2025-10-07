# Agro IA - Dashboard inicial

Aplicación web en React (Vite + TypeScript) para el dashboard inicial de identificación de plagas con visión por computadora.

## Requisitos
- Node.js 18+

## Ejecutar en desarrollo
```bash
npm install
npm run dev
```

Abrir `http://localhost:5173`.

## Construir para producción
```bash
npm run build
npm run preview
```

## Estructura
- `src/pages/Dashboard.tsx`: Pantalla inicial (UI responsiva)
- `src/styles/theme.ts`: Tokens de tema y estilos globales
- `src/App.tsx`: Rutas con React Router

No hay backend ni captura de cámara aún; solo UI.
