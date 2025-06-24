tengo una estructura mínima pero funcional para implementar login con Google OAuth2 usando:
-Backend: FastAPI + SQLAlchemy para ORM
-Frontend: React con Next.js
-Funcionalidad: Login, logout, y dashboard con datos del usuario autenticado

caracteristicas:

- TypeScript y Tailwind CSS
- Página /auth/login que redirige al login de Google o al dashboard si ya está autenticado
- Dashboard con información del usuario
- Internacionalización con next-i18next en español e inglés
- Sidebar con secciones: Resumen, Perfil, Accesos, Logout.
- Uso de layout persistente (Layout con Navbar, Footer, Sidebar).
- Frontend en Next.js con hooks de auth (useAuth), y API centralizada (apiFetch)
- Backend en FastAPI, con cookies HTTPOnly (jwt_token)
- Login local y Google OAuth funcionando.
- Protección de rutas frontend (withAuth)
- Logout borrando cookies correctamente.
- Login records (histórico de logins).

caracteristicas logica
- config.py para centralizar credenciales y URIs.
- get_db() como dependencia que maneja la sesión de SQLAlchemy.
- get_current_user (dependencia) para extraer y validar el usuario desde las cookies.
- RBAC con RoleChecker o comprobación manual if user.role != "admin".
- Modelo LoginHistory para guardar cada acceso con la IP y timestamp, registrándolo en /auth/callback.
- Hook useAuth en el frontend para almacenar globalmente usuario y reducir fetch duplicados.
- Protección de rutas en Next.js con getServerSideProps (por ejemplo, página /admin.tsx).
- Sidebar con sus secciones (“Resumen”, “Perfil”, “Accesos”, “Logout”) ya mostrando el histórico de accesos.
- Locales completos en inglés y español para cada texto nuevo.
- Autenticación
- Contexto global de usuario
- Protección de rutas por roles
- HOCs sencillos y centralizados


Aquí tienes un **resumen completo** de tu aplicación, su arquitectura, flujos y lógica, de modo que puedas retomarla sin perder nada:

---

## 📦 Stack tecnológico

* **Backend**

  * **FastAPI** (Python) sobre Uvicorn/Starlette
  * **SQLAlchemy 2.0** + SQLite (o la `DATABASE_URL` que definas)
  * **Pydantic Settings** para configuración (`config.py` + `.env`)
  * **Passlib (bcrypt)** para hash de contraseñas
  * **PyJWT** para generar/validar tokens JWT
  * **httpx** para OAuth2 con Google
  * **Alembic** (opcional) para migraciones
  * **Dependencias FastAPI** (`Depends`) para proteger rutas

* **Frontend**

  * **Next.js** (React + SSR)
  * **TypeScript** (hooks y componentes tipados)
  * **Tailwind CSS** para estilos
  * **Next‑i18next** para internacionalización
  * **Context API** + custom **`useAuth` hook** para estado global de usuario
  * **`apiFetch` wrapper** para todas las llamadas HTTP, con manejo automático de 401 + silent refresh
  * **Next.js API Routes** en `/api/auth/refresh` y `/api/auth/logout` para puentear cookies entre cliente y FastAPI

---

## 🔐 Autenticación y autorización

1. **Login local** (`/auth/login`)

   * `POST /auth/login` en FastAPI: valida email+password, actualiza `last_login`, guarda en `LoginHistory`, genera **Access** + **Refresh** tokens, los envía en cookies `jwt_token` (15 min de validez) y `refresh_token` (7 días de validez).

2. **Login con Google OAuth2** (`/auth/login` ↔ `/auth/callback`)

   * Redirige a Google, recibe `code` en `/callback`, obtiene usuario, lo crea/actualiza en BD, graba en `LoginHistory`, genera y setea tokens idénticos al login local.

3. **Registro** (`/auth/register`)

   * `POST /auth/register`: crea usuario, hashea contraseña, lo persiste, luego **automáticamente** genera sus tokens y los envía en cookies (login inmediato).

4. **Protección de rutas**

   * **Backend**:

     * `GET /auth/user`: lee `jwt_token` de cookies, lo decodifica y devuelve el payload — si está caducado o inválido, responde 401.
     * Rutas seguras (por ejemplo `GET /user/access-history`) usan `Depends(get_current_user)` que parsea y valida el JWT, exponiendo un objeto `UserInJWT`.
   * **Frontend**:

     * `useAuth` carga al inicio y cada 5 min el endpoint `/auth/user`, mantiene `user` en contexto o `null` si 401.
     * `withAuth` HOC bloquea páginas privadas y roles con redirección según `user.role`.

5. **Silent Refresh**

   * **`apiFetch`**: cada petición comprueba `res.status === 401`.

     * Llama a `/api/auth/refresh` (Next.js route) para propagar cookies al backend, recibe nuevos `jwt_token` y `refresh_token`.
     * Si el refresh triunfa, reintenta la petición original con la nueva cookie.
     * Si falla, redirige al login.

6. **Logout**

   * Borrado de cookies `jwt_token` y `refresh_token` via Next.js API Route `/api/auth/logout`.
   * `useAuth.logout()` limpia el contexto y envía al usuario a `/auth/login` o `/`.


## 🗂️ Estructura de ficheros (puntos clave)

```text
/backend
  ├─ main.py            # configuración FastAPI, CORS, startup inicial
  ├─ config.py          # Settings pydantic
  ├─ utils.py           # hash, verify, token helpers, set_auth_cookies
  ├─ routers/auth.py    # endpoints /auth/*
  ├─ routers/user.py    # endpoint /user/access-history
  ├─ dependencies.py    # get_current_user para rutas protegidas
  └─ db.py, models.py   # SQLAlchemy, relaciones, sesión

/frontend
  ├─ pages
  │   ├─ _app.tsx       # AuthProvider envuelve Layout + Component
  │   ├─ auth
  │   │   ├─ login.tsx
  │   │   ├─ register.tsx
  │   │   └─ logout.tsx
  │   └─ dashboard.tsx  # Protected con withAuth
  ├─ pages/api
  │   ├─ auth
  │   │   ├─ refresh.ts
  │   │   └─ logout.ts
  ├─ hooks
  │   ├─ useAuth.tsx    # contexto global, carga user, refresh periódico
  │   └─ useLogin.tsx   # lógica login/register via apiFetch
  ├─ utils
  │   ├─ api.ts         # apiFetch + tryRefresh
  │   └─ withAuth.tsx   # HOC protección de páginas
  └─ components
      └─ AccessHistory.tsx  # usa useFetchHistory → apiFetch("/user/access-history")

y aqui tienes todos los archivos y la estructua completa

├── LICENSE
├── README.md
├── backend
│   ├── app.db
│   ├── config.py
│   ├── db.py
│   ├── dependencies.py
│   ├── main.copy
│   ├── main.py
│   ├── migrations
│   ├── models
│   │   └── models.py
│   ├── package-lock.json
│   ├── requirements.txt
│   ├── routers
│   │   ├── admin.py
│   │   ├── auth.py
│   │   └── user.py
│   ├── run.sh
│   ├── schemas
│   │   └── schemas.py
│   ├── tests
│   └── utils.py
├── backlog
├── frontend
│   ├── components
│   │   ├── AccessHistory.tsx
│   │   ├── ErrorBoundary.tsx
│   │   ├── Footer.tsx
│   │   ├── Layout.tsx
│   │   ├── Navbar.tsx
│   │   ├── Sidebar.tsx
│   │   └── Spinner.tsx
│   ├── contexts
│   │   └── ErrorContext.tsx
│   ├── hooks
│   │   ├── useAuth.tsx
│   │   ├── userFetchHistory.tsx
│   │   └── userLogin.tsx
│   ├── next-env.d.ts
│   ├── next-i18next.config.js
│   ├── next.config.js
│   ├── package-lock.json
│   ├── package.json
│   ├── pages
│   │   ├── 403.tsx
│   │   ├── ____admin.tsx
│   │   ├── _app.tsx
│   │   ├── about.tsx
│   │   ├── admin.tsx
│   │   ├── api
│   │   │   └── auth
│   │   │       ├── logout.ts
│   │   │       └── refresh.ts
│   │   ├── auth
│   │   │   ├── login.copy
│   │   │   ├── login.tsx
│   │   │   ├── logout.tsx
│   │   │   └── register.tsx
│   │   ├── contact.tsx
│   │   ├── dashboard.tsx
│   │   ├── features.tsx
│   │   ├── index.tsx
│   │   ├── privacy.tsx
│   │   └── terms.tsx
│   ├── postcss.config.js
│   ├── public
│   │   ├── favicon.ico
│   │   └── locales
│   │       ├── en
│   │       │   └── common.json
│   │       └── es
│   │           └── common.json
│   ├── styles
│   │   └── globals.css
│   ├── tailwind.config.js
│   ├── tailwind.config.ts
│   ├── tsconfig.json
│   └── utils
│       ├── api.ts
│       └── withAuth.tsx



## 🔄 Flujo de solicitudes y tokens

1. **User abre app** → `_app.tsx` monta `AuthProvider`, llama `loadUser()` → `/auth/user`:

   * Si status 200 → guarda `user` en contexto.
   * Si 401 → `user = null`.
2. **Usuario navega a página protegida** → `withAuth` redirige si `!user`.
3. **Petición a datos protegidos** (ej. historial) → `apiFetch("/user/access-history")`:

   * Si 200 → datos.
   * Si 401 → `apiFetch` dispara `tryRefresh()` → llama `/api/auth/refresh`:

     * **Next.js** propaga cookies a FastAPI.
     * FastAPI valida `refresh_token`, emite nuevas cookies.
     * Next.js las reenvía al navegador.
   * Luego `apiFetch` reintenta la URL original.
4. **Logout** → borra cookies, limpia contexto, redirige.

---

## ⚙️ Configuración de tiempos

* **Access token (`jwt_token`)**: validez corta (por ejemplo, **15 min** en producción; 1 min para testing).
* **Refresh token (`refresh_token`)**: validez más larga (por ejemplo, **7 días**).
* **Intervalo de refresh en frontend**: opcionalmente cada 5 min vía `setInterval(loadUser, …)`.


Lógica paso a paso:

✅ Carga estado global del usuario desde el useAuth() context.
✅ Mientras loading es true (aún no sabemos si el usuario está logueado o no), muestra un spinner de carga.
✅ Si user es null, redirige automáticamente al login.
✅ Si hay roles definidos (roles.length > 0) y el user.role no está incluido, redirige a página de error /403 (acceso denegado).
✅ Si pasa las validaciones, renderiza el componente original (Component) con sus props.

🧩 Resumen ultra rápido
Módulo	Función clave
useAuth	Estado global de sesión (user, loading, refresh, logout)
apiFetch	Fetch centralizado + silent refresh
tryRefresh	Petición a /api/auth/refresh para renovar tokens
withAuth	Protección de rutas según login y roles

🚩 Puntos fuertes del sistema
🔒 Completamente transparente para el usuario: no necesita loguearse de nuevo si el token expira (siempre que el refresh siga siendo válido).
🔒 Centralización de la lógica de permisos: las páginas se protegen simplemente con withAuth().
🔒 Centralización de errores y sesión: al capturar el 401 en apiFetch y en el useAuth(), puedes centralizar la redirección al login o mostrar mensajes.
🔄 Compatibilidad con SSR de Next.js: como apiFetch está separado, podrías extenderlo en el futuro para llamadas desde el servidor en getServerSideProps.

🔑 Vista general del flujo frontend completo
1️⃣ Formulario login → useLogin() → apiFetch("/auth/login") → FastAPI → cookies httpOnly.
2️⃣ useAuth() → carga inicial de usuario vía apiFetch("/auth/user").
3️⃣ Si el token expira → apiFetch() detecta 401 → llama a tryRefresh() → vuelve a intentar la request.
4️⃣ AuthProvider mantiene el estado global de usuario accesible en toda la app.
5️⃣ withAuth() protege rutas privadas y controla acceso por rol.
6️⃣ Logout borra cookies y limpia AuthContext.

🚀 Puntos destacados
✅ Stateful global centralizado: el AuthContext hace el código mucho más mantenible.
✅ Silent refresh automático: el usuario rara vez verá un login expirado.
✅ Backend agnóstico: el frontend sólo depende del API proxy de Next.js.





Refactorización:
- Separación de responsabilidades (configuración, DB, dependencias, rutas).
- Validación y tipos con Pydantic (UserInJWT, enums de roles).
- Protección de rutas en backend (FastAPI) y frontend (Next.js).
- Historial de accesos con modelo dedicado y endpoint /user/access-history.
- Hook global de autenticación y protección de páginas Next.js según rol.

Reglas

- UX ultra fluida
- Seguridad sólida
- Código centralizado y profesional
- Mantención simple





✔️ Accesibilidad y usabilidad:

- Etiquetas label correctamente asociadas con inputs por htmlFor.
- Mensajes de error con role="alert" para lectores de pantalla.
- Botón con aria-busy cuando está cargando.
-noValidate en el formulario para control personalizado.


Asegurar que el contexto useAuth funcione correctamente 
Cumplir con accesibilidad, usabilidad y buenas prácticas SEO.


Futuro:
Protección server-side (SSR, SSG, ISR).
Middleware seguro.
Validación de tokens en el edge.
no es buena práctica guardar objetos grandes en cookies como user_info. Mejor a largo plazo sería:
-- Solo enviar jwt_token + refresh_token.
-- Extraer el user del jwt_token en el backend.

| Ampliación                        | Descripción                                                                                                                                              |
| --------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Global error handler**          | Añadir un `ErrorBoundary` o hook de error centralizado para capturar `Unauthorized` y forzar logout global.                                              |
| **Auto-refresh proactivo**        | Implementar un `setInterval` en `useAuth` para hacer `apiFetch('/auth/user')` cada 5 min y evitar expiraciones de token mientras el usuario está activo. |
| **Interfaz de roles/permissions** | Pasar de `roles: string[]` a un sistema de permisos o claims más granular.                                                                               |
| **Notificaciones de expiración**  | Mostrar alerta cuando el refresh token esté próximo a expirar.                                                                                           |
| **Mejor manejo de loading state** | Gestionar estados de carga más bonitos y animaciones al entrar/salir.                                                                                    |
| **CSR + SSR híbrido**             | Permitir que páginas públicas usen SSR y privadas sigan usando `withAuth` en cliente.                                                                    |
