# Drive Workbench — cliente independiente local

Cliente local para buscar, listar y consultar archivos de Google Drive sin depender del conector de Drive de ChatGPT. Usa Google Drive API v3 y OAuth 2.0 oficial.

## Funciones
- OAuth con Google.
- Listado y búsqueda por nombre de archivos (hasta 50 resultados por página; interfaz aún no implementa paginación).
- Metadatos básicos y enlace oficial para abrir el archivo.
- Vista previa de texto de Google Docs exportado como texto plano y de archivos accesibles como texto, con límite de 1 MB.
- Desconexión y tokens en memoria; sin escritura ni borrado de archivos.

## Requisitos y arranque
- Node.js 20 o superior; no necesita dependencias npm.
- En Google Cloud, habilita Google Drive API y crea credenciales OAuth tipo aplicación web.
- Añade la URI exacta `http://127.0.0.1:8788/oauth2callback` a los redirect URIs autorizados. Puede usarse el mismo OAuth client del Gmail Workbench si se añaden ambas URI.
- Añade tu cuenta como usuario de prueba si la pantalla de consentimiento está en modo de pruebas.
- Scope solicitado: `https://www.googleapis.com/auth/drive.readonly`; puede requerir revisión/verificación según el modo de publicación y las políticas de Google.

macOS/Linux:
```bash
GOOGLE_CLIENT_ID="tu-client-id" GOOGLE_CLIENT_SECRET="tu-client-secret" node server.mjs
```
PowerShell:
```powershell
$env:GOOGLE_CLIENT_ID="tu-client-id"
$env:GOOGLE_CLIENT_SECRET="tu-client-secret"
node server.mjs
```
Abre `http://127.0.0.1:8788` en el mismo equipo.

## Seguridad y límites
- El servidor escucha solo en loopback de forma predeterminada.
- Tokens guardados solo en memoria del proceso, nunca en disco o logs.
- Solo lectura: no solicita permisos de creación, actualización ni eliminación.
- No es un servicio público y no debe exponerse a internet tal cual.
- La vista previa de contenido no convierte todos los formatos en texto. Binarios, formatos propietarios, archivos grandes y ciertos tipos de Google Workspace pueden no ser compatibles.
- El cliente local no concede acceso directo a ChatGPT. Una integración directa necesitaría un endpoint autorizado desplegado, protección de secretos, autenticación y una interfaz de herramientas/MCP permitida por el entorno.
- No se ha realizado una prueba real contra la cuenta del usuario hasta completar OAuth y verificar el resultado.

## Pruebas
Desde este directorio: `node --check server.mjs`, `node --check app.js`. Se deben añadir pruebas de integración una vez pueda probarse con credenciales de prueba propias; no utilizar correos o archivos privados como fixtures.
