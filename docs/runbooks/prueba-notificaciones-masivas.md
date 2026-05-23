# Prueba rapida: Notificaciones masivas segmentadas (Backoffice)

## 1) Precondiciones

- Backend arriba en `http://localhost:8082`
- Usuario admin seed:
  - Email: `admin@mundial26.com`
  - Password: `Admin2026!`

## 2) Login y token JWT (PowerShell)

```powershell
$base='http://localhost:8082'
$loginBody=@{ email='admin@mundial26.com'; password='Admin2026!' } | ConvertTo-Json
$loginResp=Invoke-RestMethod -Method Post -Uri "$base/api/v1/auth/login" -ContentType 'application/json' -Body $loginBody
$token=$loginResp.data.token
$headers=@{ Authorization = "Bearer $token" }
```

## 3) Envio segmentado por PARTIDO

```powershell
$reqPartido=@{
  titulo='QA PARTIDO'
  mensaje='Prueba PARTIDO APP+PUSH'
  segmento='PARTIDO'
  segmentoValor='1'
  canales=@('APP','PUSH')
} | ConvertTo-Json

$sendPartido=Invoke-RestMethod -Method Post -Uri "$base/api/v1/backoffice/comunicados" -Headers $headers -ContentType 'application/json' -Body $reqPartido
$progPartido=Invoke-RestMethod -Method Get -Uri "$base/api/v1/backoffice/comunicados/$($sendPartido.data.id)" -Headers $headers
$progPartido.data
```

## 4) Envio segmentado por ESTADIO

```powershell
$reqEstadio=@{
  titulo='QA ESTADIO'
  mensaje='Prueba ESTADIO APP+PUSH'
  segmento='ESTADIO'
  segmentoValor='Estadio Azteca'
  canales=@('APP','PUSH')
} | ConvertTo-Json

$sendEstadio=Invoke-RestMethod -Method Post -Uri "$base/api/v1/backoffice/comunicados" -Headers $headers -ContentType 'application/json' -Body $reqEstadio
$progEstadio=Invoke-RestMethod -Method Get -Uri "$base/api/v1/backoffice/comunicados/$($sendEstadio.data.id)" -Headers $headers
$progEstadio.data
```

## 5) Prueba de carga real con TODOS

```powershell
$reqTodos=@{
  titulo='QA TODOS'
  mensaje='Prueba masiva todos APP'
  segmento='TODOS'
  canales=@('APP')
} | ConvertTo-Json

$sendTodos=Invoke-RestMethod -Method Post -Uri "$base/api/v1/backoffice/comunicados" -Headers $headers -ContentType 'application/json' -Body $reqTodos
$progTodos=Invoke-RestMethod -Method Get -Uri "$base/api/v1/backoffice/comunicados/$($sendTodos.data.id)" -Headers $headers
$progTodos.data
```

## 6) Resultado esperado

- `estado`: `COMPLETADO`
- `totalDestinatarios`: mayor a `0` para `TODOS`
- `enviados`: igual a `totalDestinatarios` en canal `APP`
- En `PUSH`, el envio depende de que los usuarios tengan token FCM activo.

## 7) Nota FCM

Si quieres validar push real en navegador, activa en backend:

- `FIREBASE_ENABLED=true`
- `FIREBASE_SERVICE_ACCOUNT_FILE=<ruta-json-service-account>`

Y en frontend registra el token del navegador con el flujo de notificaciones del usuario.
