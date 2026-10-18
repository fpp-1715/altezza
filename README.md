# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend enabling type-aware lint rules by installing `oxlint-tsgolint` and editing `.oxlintrc.json`:

```json
{
  "$schema": "./node_modules/oxlint/configuration_schema.json",
  "plugins": ["react", "typescript", "oxc"],
  "options": {
    "typeAware": true
  },
  "rules": {
    "react/rules-of-hooks": "error",
    "react/only-export-components": ["warn", { "allowConstantExport": true }]
  }
}
```

See the [Oxlint rules documentation](https://oxc.rs/docs/guide/usage/linter/rules) for the full list of rules and categories.

## Administración de cuentas del panel

La pantalla **Usuarios** permite a cualquier persona con una sesión válida en el panel listar, crear y eliminar otras cuentas, y cambiar sus correos y contraseñas. Las cuentas nuevas quedan confirmadas para que puedan iniciar sesión de inmediato. No se permite eliminar la cuenta que está usando la sesión actual.

La gestión utiliza la Edge Function `admin-users`; nunca expongas `SUPABASE_SERVICE_ROLE_KEY` en variables `VITE_*` ni en el frontend. Configura ese valor como secreto del proyecto Supabase y publica la función:

```powershell
npx supabase secrets set SUPABASE_SERVICE_ROLE_KEY=<service_role_del_proyecto>
npx supabase functions deploy admin-users
```

La función usa `SUPABASE_URL` y `SUPABASE_ANON_KEY` del entorno de Supabase. La verificación JWT del gateway está deshabilitada para que el preflight CORS `OPTIONS` llegue a la función; la propia función valida la sesión autenticada con Supabase antes de realizar cualquier operación administrativa.
