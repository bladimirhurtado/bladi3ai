# Google Workbench

Prototipos locales independientes para trabajar con Gmail y Google Drive mediante las APIs oficiales de Google, sin depender de los conectores nativos de ChatGPT.

## Inicio rápido

Requisitos: Node.js 20+ y credenciales OAuth de una aplicación web creadas en Google Cloud. No hay dependencias npm.

Configura estas URI de redirección en el mismo OAuth Client ID:
- `http://127.0.0.1:8787/oauth2callback`
- `http://127.0.0.1:8788/oauth2callback`

Habilita Gmail API y Google Drive API, y configura la pantalla de consentimiento. Si está en modo de pruebas, añade la cuenta que va a autorizar como usuario de prueba.

Define `GOOGLE_CLIENT_ID` y `GOOGLE_CLIENT_SECRET` como variables de entorno en tu terminal. **No pegues estos secretos en el chat ni los subas al repositorio.**

PowerShell:
```powershell
$env:GOOGLE_CLIENT_ID="tu-client-id"
$env:GOOGLE_CLIENT_SECRET="tu-client-secret"
node .\start.mjs
```

macOS/Linux:
```bash
export GOOGLE_CLIENT_ID="tu-client-id"
export GOOGLE_CLIENT_SECRET="tu-client-secret"
node ./start.mjs
```

Abre:
- Gmail: http://127.0.0.1:8787
- Drive: http://127.0.0.1:8788

Detén ambos procesos con Ctrl+C. Los tokens viven solo en memoria; al reiniciar tendrás que autorizar de nuevo.

## Importante
- Gmail permite leer y buscar mensajes y enviar solo tras confirmación explícita en la interfaz.
- Drive permite buscar, listar, ver metadatos y previsualizar contenido compatible; no escribe ni borra archivos.
- Esto no reactiva un conector de ChatGPT deshabilitado por administración y no proporciona por sí solo acceso directo al modelo. Una integración directa requiere un endpoint/MCP autorizado y soportado por el entorno, además de pruebas y protección de secretos.
- No expongas estos servidores a internet tal cual.
- Revisa también `gmail-client/README.md`, `drive-client/README.md` y `../../docs/google-workbench/README.md`.
