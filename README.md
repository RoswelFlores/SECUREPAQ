# SECUREPAQ Frontend - Documentacion tecnica

Este documento cubre el frontend (HTML/CSS/JS) del proyecto SECUREPAQ. Su objetivo es entregar a un desarrollador externo todo lo necesario para entender, ejecutar y mantener la UI.

## Tabla de contenidos
- [Vision general](#vision-general)
- [Stack y dependencias](#stack-y-dependencias)
- [Puesta en marcha](#puesta-en-marcha)
- [Configuracion](#configuracion)
- [Arquitectura](#arquitectura)
- [Estructura de carpetas](#estructura-de-carpetas)
- [Autenticacion y sesion](#autenticacion-y-sesion)
- [Roles y paginas](#roles-y-paginas)
- [Flujos principales](#flujos-principales)
- [API consumida](#api-consumida)
- [Modelos usados por la UI](#modelos-usados-por-la-ui)
- [UI y componentes](#ui-y-componentes)
- [Manejo de errores](#manejo-de-errores)
- [Convenciones](#convenciones)
- [Troubleshooting](#troubleshooting)
- [Checklist de onboarding](#checklist-de-onboarding)

## Vision general
- Frontend multipagina para gestion de encomiendas con tres perfiles: ADMIN, CONSERJERIA y RESIDENTE.
- Autenticacion basada en token JWT almacenado en `localStorage`.
- Consumo de API REST definida por `window.SECUREPAQ_API_URL`.
- Sin build step: HTML, CSS y JS vanilla.

## Stack y dependencias
- HTML5, CSS3, JavaScript ES6.
- Sin frameworks ni bundlers.
- APIs del navegador: `fetch`, `localStorage`, `DOM`.

## Puesta en marcha
1. Configura la URL del backend (ver [Configuracion](#configuracion)).
2. Abre `FRONTEND/index.html` en el navegador o levanta un servidor estatico.

Ejemplos de servidor estatico:
```bash
cd FRONTEND
python -m http.server 5173
```
```bash
cd FRONTEND
npx serve .
```

## Configuracion
La URL base del backend se define en `FRONTEND/js/config/api.js`. Si `window.SECUREPAQ_API_URL` no existe, se usa el default:

```
https://securepaq-backend.onrender.com
```

Opciones para cambiar la URL:
1. Definirla antes de cargar `api.js` en cada HTML:
   ```html
   <script>
     window.SECUREPAQ_API_URL = "http://localhost:3000";
   </script>
   <script src="js/config/api.js"></script>
   ```
2. Editar el valor default en `FRONTEND/js/config/api.js`.

## Arquitectura
El frontend se organiza por paginas, con un script por vista y helpers compartidos.

```mermaid
flowchart LR
  A[index.html (login)] --> B[js/auth/login.js]
  B --> C[localStorage: token + user]
  C --> D[pages/*]
  D --> E[js/guard/guard.global.js]
  D --> F[js/pages/*]
  G[js/config/api.js] --> F
  F --> H[API REST]
```

Puntos clave:
- `js/config/api.js` define `SECUREPAQ_API_URL`.
- `js/guard/guard.global.js` protege rutas por rol y maneja logout.
- Cada pagina tiene su controlador en `js/pages/*`.

## Estructura de carpetas
```text
FRONTEND/
  index.html
  pages/
    admin/
    conserjeria/
    residente/
    perfil/
    legal/
  assets/
    css/
    images/
  js/
    auth/
    config/
    guard/
    pages/
```

## Autenticacion y sesion
- Login: `POST /auth/login` guarda `token` y `user` en `localStorage`.
- `user` incluye `roles` y `id` (usado para resumen de perfil).
- `protectRoute(roles)` valida token y rol. Si falla, redirige a `index.html`.
- Botones con `data-logout` limpian `localStorage` y redirigen.

Claves en `localStorage`:
- `token`: JWT.
- `user`: objeto JSON con `id`, `email`, `roles`.

## Roles y paginas
Publico:
- `index.html` (login)
- `pages/legal/privacidad.html`
- `pages/legal/terminos.html`

Residente:
- `pages/residente/home.html` (pendientes, historial, regenerar OTP)
- `pages/residente/notificaciones.html` (listar y marcar como leida)

Conserjeria:
- `pages/conserjeria/home.html` (dashboard y listado)
- `pages/conserjeria/registrar-encomienda.html`
- `pages/conserjeria/retiro.html`

Admin:
- `pages/admin/home.html` (KPIs)
- `pages/admin/usuarios.html` (CRUD y estado)
- `pages/admin/estructura.html` (edificio y departamentos)
- `pages/admin/auditoria.html`

Perfil (todos los roles):
- `pages/perfil/mi-perfil.html`

## Flujos principales
<details>
<summary>Login y redireccion por rol</summary>

- `index.html` -> `POST /auth/login`
- Guarda `token` y `user`
- Redirige segun rol:
  - ADMIN -> `pages/admin/home.html`
  - CONSERJERIA -> `pages/conserjeria/home.html`
  - RESIDENTE -> `pages/residente/home.html`
</details>

<details>
<summary>Registrar encomienda (conserjeria)</summary>

- Carga residentes (`/conserjeria/residentes-lista`) y couriers (`/conserjeria/couriers`)
- Completa datos y envia:
  - `POST /encomiendas`
  - Se muestra confirmacion y aviso de OTP via correo
</details>

<details>
<summary>Validar OTP y confirmar retiro</summary>

- `POST /otp/validar-otp` con OTP
- Muestra detalle de encomienda
- `POST /encomiendas/confirmar-retiro` con observacion
</details>

<details>
<summary>Notificaciones del residente</summary>

- `GET /residente/notificaciones`
- Renderiza estado leida/no leida
- Accion "Marcar como leida" -> `POST /residente/notificaciones/marcar-como-leida`
- Badge de pendientes en `pages/residente/home.html` si existen no leidas
</details>

<details>
<summary>Administracion de usuarios</summary>

- `GET /admin/usuarios` con paginacion local
- Validaciones:
  - RUT formato `12.345.678-9`
  - Telefono `+56 9XXXXXXXX`
- Crear: `POST /admin/usuarios`
- Editar: `PUT /admin/editar-usuarios/:id`
- Activar/Desactivar: `PUT /admin/usuarios/:id`
- Reset password: `POST /admin/usuarios/:id/reset-password`
</details>

## API consumida
La UI usa `fetch` con header `Authorization: Bearer <token>`.

### Auth
- `POST /auth/login`
- `POST /auth/recover-password`

### Admin
- `GET /admin/countAllUsers`
- `GET /admin/auditoria`
- `GET /admin/usuarios`
- `POST /admin/usuarios`
- `PUT /admin/editar-usuarios/:id`
- `PUT /admin/usuarios/:id` (toggle activo)
- `POST /admin/usuarios/:id/reset-password`
- `GET /admin/usuarios/:id/resumen`
- `PUT /admin/usuarios/:id/perfil`
- `GET /admin/estructura`
- `PUT /admin/estructura`
- `GET /admin/departamentos`

### Conserjeria
- `GET /conserjeria/dashboard`
- `GET /conserjeria/encomiendas`
- `GET /conserjeria/residentes-lista`
- `GET /conserjeria/couriers`
- `POST /encomiendas`
- `POST /otp/validar-otp`
- `POST /encomiendas/confirmar-retiro`

### Residente
- `GET /residente/pendientes`
- `GET /residente/historial`
- `POST /residente/regenerar-otp`
- `GET /residente/notificaciones`
- `POST /residente/notificaciones/marcar-como-leida`

<details>
<summary>Payloads principales</summary>

```json
// Login
{ "email": "user@dominio.com", "password": "******" }
```
```json
// Recover password
{ "email": "user@dominio.com" }
```
```json
// Registrar encomienda
{
  "id_residente": 12,
  "id_courier": 3,
  "tracking": "ABC123",
  "tipo_paquete": "Documento",
  "tamanio": "S",
  "descripcion": "Caja pequena",
  "fecha_recepcion": "2026-01-18",
  "hora_recepcion": "10:45",
  "timezone_offset": -180
}
```
```json
// Validar OTP
{ "otp": "123456" }
```
```json
// Confirmar retiro
{ "id_encomienda": 45, "observacion": "Retiro sin novedad" }
```
```json
// Regenerar OTP
{ "id_encomienda": 45 }
```
```json
// Marcar notificacion como leida
{ "id_notificacion": 7 }
```
```json
// Crear/Editar usuario
{
  "nombre": "Juan Perez",
  "rut": "12.345.678-9",
  "telefono": "+56 912345678",
  "email": "juan@dominio.com",
  "rol": "RESIDENTE",
  "id_departamento": 101
}
```
```json
// Actualizar perfil
{
  "email": "nuevo@dominio.com",
  "telefono": "+56 912345678",
  "password_nueva": "NuevaPass1",
  "password_confirmacion": "NuevaPass1"
}
```
```json
// Estructura edificio/departamentos
{
  "edificio": {
    "nombre": "Edificio A",
    "direccion": "Calle 123",
    "comuna": "Santiago",
    "ciudad": "Santiago"
  },
  "departamentos": [
    { "id_departamento": 1, "numero": "101", "piso": "1" },
    { "numero": "102", "piso": "1" }
  ]
}
```
</details>

## Modelos usados por la UI
> Nota: estos son los campos consumidos por el frontend, no el schema completo.

- Usuario (listado admin): `id_usuario`, `nombre`, `rut`, `telefono`, `email`, `rol`, `departamento`, `activo`.
- Usuario (resumen): `usuario`, `rol`, `telefono`, `correo`.
- Encomienda (listado conserjeria): `otp`, `tracking`, `courier`, `residente`, `departamento`, `fecha_recepcion`, `fecha_retiro`, `estado`.
- Encomienda (detalle retiro): `id_encomienda`, `tracking`, `courier`, `residente`, `departamento`, `fecha_recepcion`, `estado`.
- Residente (lista conserjeria): `id_residente`, `nombre`, `rut`, `departamento`.
- Notificacion: `id_notificacion`, `mensaje`, `fecha_hora`, `leida`, `id_encomienda`.

## UI y componentes
- Estilos base en `assets/css/base.css` (variables y layout global).
- Estilos por modulo:
  - `assets/css/admin*.css`
  - `assets/css/conserjeria.css`
  - `assets/css/residente.css`
  - `assets/css/notificaciones.css`
  - `assets/css/perfil.css`
- Componentes frecuentes:
  - Cards y grids para datos
  - Tabs (residente)
  - Modales (admin usuarios, residente OTP)
  - Badges/estados (auditoria, conserjeria)
  - Paginacion local (admin usuarios, auditoria)

## Manejo de errores
- `fetchJson` centraliza headers y parseo de JSON.
- En rutas protegidas, 401/403 fuerza logout y redireccion.
- Mensajes de error se muestran en cajas de alerta o estados vacios.

## Convenciones
- Cada pagina tiene un IIFE en `js/pages/...` para encapsular logica.
- `displayValue` y `formatDateTime` normalizan datos en varias vistas.
- Fechas se formatean con `toLocaleString("es-CL")`.
- Validaciones de RUT y telefono en admin.
- Roles se mantienen en mayusculas: `ADMIN`, `CONSERJERIA`, `RESIDENTE`.

## Troubleshooting
- "No autorizado": verifica `token` y `user` en `localStorage`.
- La UI no carga datos: valida `SECUREPAQ_API_URL` y CORS.
- RUT invalido: debe cumplir formato `12.345.678-9` y DV valido.
- Telefono invalido: usa `+56 9XXXXXXXX`.
- OTP invalido/expirado: reintenta o regenera OTP.

## Checklist de onboarding
- [ ] Configurar `SECUREPAQ_API_URL`.
- [ ] Probar login con los 3 roles.
- [ ] Revisar permisos por pagina (guard).
- [ ] Ejecutar flujo de registro y retiro de encomienda.
- [ ] Revisar gestion de usuarios y estructura.
- [ ] Validar notificaciones y badge de pendientes.

