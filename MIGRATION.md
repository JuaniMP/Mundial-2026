# Migración a la nueva estructura — One-time cleanup

Este archivo es **temporal**: sigue los pasos manuales y bórralo cuando termines.

Como las herramientas de archivo no pueden eliminar archivos en tu disco, hay tres acciones manuales que necesitas ejecutar para que el repo quede limpio.

---

## ✅ Lo que ya quedó hecho automáticamente

- Estructura `apps/`, `packages/`, `docs/`, `.github/` creada y poblada.
- `README.md`, `CONTRIBUTING.md`, `LICENSE`, `.gitignore`, `.editorconfig`, `.gitattributes`, `.nvmrc`, `package.json` raíz.
- Toda la doc en `docs/` (5 ADRs, ARCHITECTURE, DESIGN, tokens, runbooks, etc.).
- Scaffold de `apps/web` con Vite + React + TS + Tailwind, rutas, mock data, tipos, test inicial, ESLint, Prettier.
- `apps/api` y `packages/shared-types` con READMEs explicando estructura prevista.
- CI de GitHub Actions.

---

## 🔧 Lo que falta hacer a mano (en este orden)

### 1) Eliminar la carpeta antigua `frontend/FrontIng/`

**Importante:** todo lo útil ya se copió a su nueva ubicación. La carpeta vieja contiene `.opencode/node_modules/` (cientos de archivos) y un `.zip` que no deben ir al repo.

En PowerShell o CMD desde `C:\Users\juame\Mundial-2026`:

```powershell
# CUIDADO: esto borra de forma permanente
Remove-Item -Recurse -Force .\frontend
```

> ¿Quieres conservar los mockups HTML del Stitch? Antes de borrar, muévelos:
>
> ```powershell
> Move-Item .\frontend\FrontIng\design-source\stitch_un_mundial_para_todos_experience\* `
>           .\docs\design-source\stitch_un_mundial_para_todos_experience\
> ```
>
> Y solo entonces borra `frontend\`.

### 2) Verificar que no queden archivos huérfanos

```powershell
# Lista todo lo que NO debería estar en el repo
Get-ChildItem -Recurse -Force | Where-Object {
  $_.FullName -match '\\node_modules\\' -or
  $_.Extension -eq '.zip' -or
  $_.FullName -match '\\.opencode\\'
} | Select-Object FullName
```

Si algo aparece, bórralo (`Remove-Item`).

### 3) Inicializar git e instalar dependencias

```powershell
# Si no es repo git todavía
git init
git add .
git commit -m "chore(repo): initial monorepo structure with docs and web scaffold"

# Instalar dependencias del workspace
nvm use      # Node 20 (lee .nvmrc)
npm install  # instala todo: root + apps/web

# Verifica que arranque
npm run dev
# → http://localhost:5173
```

### 4) (Opcional) Conectar a remoto

```powershell
git remote add origin <tu-url-de-github>
git branch -M main
git push -u origin main
```

---

## 🗑️ Cuando todo lo de arriba esté hecho

Borra este archivo:

```powershell
Remove-Item .\MIGRATION.md
git commit -am "docs(repo): remove migration notes"
```

---

## ❓ Si algo sale mal

- **`npm install` falla con "workspace not found"** → asegúrate de estar en `C:\Users\juame\Mundial-2026` (raíz), no dentro de `apps/web`.
- **`npm run dev` da error de Tailwind** → revisa que `apps/web/tailwind.config.ts` y `postcss.config.js` existan.
- **Vite no encuentra el alias `@/`** → revisa que `tsconfig.json` y `vite.config.ts` tengan el `paths` / `alias` apuntando a `./src`.

Cualquier cosa más rara, ábreme un follow-up con el error y le entramos.
