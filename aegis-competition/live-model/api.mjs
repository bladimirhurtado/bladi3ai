function isLoopback(hostname) {
  const host = String(hostname).toLowerCase();
  return host === 'localhost' || host === '127.0.0.1' || host === '[::1]' || host === '::1';
}

export function normalizeBaseUrl(baseUrl) {
  const raw = String(baseUrl ?? '').trim();
  let url;
  try {
    url = new URL(raw);
  } catch {
    throw new TypeError('La URL base del proveedor no es válida.');
  }

  if (!['https:', 'http:'].includes(url.protocol)) {
    throw new TypeError('La URL base debe usar HTTPS; HTTP solo se permite para pruebas en loopback.');
  }
  if (url.protocol === 'http:' && !isLoopback(url.hostname)) {
    throw new TypeError('Se rechaza HTTP fuera de localhost/loopback para evitar enviar credenciales sin cifrar.');
  }
  if (url.username || url.password) {
    throw new TypeError('La URL base no puede incluir credenciales; usa una variable de entorno/secret.');
  }
  if (url.search || url.hash) {
    throw new TypeError('La URL base no puede incluir parámetros de consulta ni fragmentos.');
  }

  return url.toString().replace(/\/$/, '');
}

export function completionEndpoint(baseUrl) {
  const normalized = normalizeBaseUrl(baseUrl);
  if (normalized.endsWith('/v1') || normalized.endsWith('/v1beta/openai')) {
    return normalized + '/chat/completions';
  }
  return normalized + '/v1/chat/completions';
}
