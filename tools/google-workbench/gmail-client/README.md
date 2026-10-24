# Gmail Workbench — cliente independiente local

MVP local para trabajar con Gmail sin depender del conector de Gmail de ChatGPT. Usa la API oficial de Gmail y OAuth 2.0; no intenta habilitar ni eludir el conector administrativamente desactivado.

## Funciones incluidas
- Conexión OAuth con Google.
- Listado y búsqueda de mensajes con operadores de Gmail (por ejemplo, `from:`, `subject:`, `after:`).
- Lectura de mensajes en texto plano.
- Redacción y envío con confirmación explícita en la interfaz.
- Desconexión que elimina los tokens de la memoria del proceso.

## Requisitos
- Node.js 20 o superior (sin dependencias npm).
- Proyecto de Google Cloud con Gmail API habilitada y credenciales OAuth de tipo **aplicación web**.
- En la pantalla de consentimiento OAuth, configura el tipo de usuario y, si la app está en pruebas, añade tu cuenta como usuario de prueba.
- Registra exactamente esta URI de redirección autorizada: `http://127.0.0.1:8787/oauth2callback`.
- Scopes solicitados: `gmail.readonly` y `gmail.send`. Google puede exigir configuración adicional o verificación para publicar una app que solicita scopes sensibles/restringidos.

## Arranque
Desde este directorio:

```bash
GOOGLE_CLIENT_ID="tu-client-id" GOOGLE_CLIENT_SECRET="tu-client-secret" node server.mjs
```

En PowerShell:

```powershell
$env:GOOGLE_CLIENT_ID="tu-client-id"
$env:GOOGLE_CLIENT_SECRET="tu-client-secret"
node server.mjs
```

Abre `http://127.0.0.1:8787` en el mismo equipo y pulsa **Conectar cuenta Google**. No pegues secretos en el chat ni los guardes en el repositorio. Para otra URI/puerto, actualiza `GOOGLE_REDIRECT_URI` y la configuración OAuth para que coincidan exactamente.

## Modelo de seguridad y limitaciones
- Escucha por defecto solo en `127.0.0.1`; no es un servicio público ni un servidor para desplegar sin endurecimiento.
- Tokens en memoria únicamente: reiniciar el proceso obliga a volver a autorizar. No se escriben tokens, correos ni secretos en disco.
- Se valida `state` OAuth con expiración y uso único; se aplican límites de tamaño y cabeceras de seguridad.
- No se solicita permiso para borrar, modificar, archivar o marcar mensajes; la app solo lee y envía.
- El envío se ejecuta únicamente después de la confirmación de la interfaz.
- El cliente no expone un endpoint remoto ni integra aún un servidor MCP. Por tanto, este MVP no concede automáticamente a ChatGPT acceso directo a la cuenta: es una aplicación local independiente. La conexión directa con un asistente requiere una integración autorizada adicional y un entorno donde esté permitida.
- Gmail API, OAuth, cuotas, políticas de la organización y la configuración de Google Cloud pueden limitar el uso. No se afirma que esté conectado hasta completar el consentimiento y una prueba real.

## Pruebas
Ejecuta las pruebas con `node --test`. Son pruebas unitarias locales de utilidades y no requieren credenciales ni acceden a una cuenta real.
