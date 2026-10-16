import { lookup as dnsLookup } from 'node:dns/promises';
import { isIP } from 'node:net';

function isPublicIPv4(address) {
  const octets = address.split('.').map(Number);
  if (octets.length !== 4 || octets.some((n) => !Number.isInteger(n) || n < 0 || n > 255)) return false;
  const [a, b, c] = octets;
  if (a === 0 || a === 10 || a === 127 || a >= 224) return false;
  if (a === 100 && b >= 64 && b <= 127) return false;
  if (a === 169 && b === 254) return false;
  if (a === 172 && b >= 16 && b <= 31) return false;
  if (a === 192 && (b === 168 || (b === 0 && c === 0) || (b === 88 && c === 99))) return false;
  if (a === 198 && (b === 18 || b === 19 || (b === 51 && c === 100))) return false;
  if (a === 203 && b === 0 && c === 113) return false;
  return true;
}

function isPublicIPv6(address) {
  const value = address.toLowerCase();
  if (value === '::' || value === '::1' || value.startsWith('fc') || value.startsWith('fd') ||
      /^fe[89ab]/.test(value) || value.startsWith('ff') || value.startsWith('2001:db8:') ||
      value.startsWith('2001:10:') || value.startsWith('2002:')) return false;
  const mapped = value.match(/::ffff:(\d+\.\d+\.\d+\.\d+)$/);
  if (mapped) return isPublicIPv4(mapped[1]);
  // IPv4-mapped addresses may use hexadecimal notation; reject them unless they are normalized upstream.
  if (value.startsWith('::ffff:')) return false;
  // Permit only global-unicast 2000::/3 addresses.
  return /^[23]/.test(value);
}

export function isPublicAddress(address) {
  const version = isIP(address);
  if (version === 4) return isPublicIPv4(address);
  if (version === 6) return isPublicIPv6(address);
  return false;
}

/**
 * Validates a URL before the server fetches it or forwards it to a scraping provider.
 * Every DNS answer must be globally routable; redirects are separately disabled by callers.
 * A caller can inject a resolver for deterministic tests.
 */
export async function validatePublicHttpUrl(input, resolveHost = dnsLookup) {
  let url;
  try {
    url = new URL(input);
  } catch {
    throw new Error('URL inválida.');
  }
  if (!['http:', 'https:'].includes(url.protocol)) throw new Error('Solo se permiten URLs HTTP/HTTPS.');
  if (url.username || url.password) throw new Error('No se permiten credenciales dentro de la URL.');
  if (url.hash) throw new Error('No se permiten fragmentos en la URL.');
  if (url.port && !((url.protocol === 'http:' && url.port === '80') || (url.protocol === 'https:' && url.port === '443'))) {
    throw new Error('Puerto no permitido.');
  }
  const hostname = url.hostname.replace(/^\[|\]$/g, '').toLowerCase();
  if (!hostname || hostname === 'localhost' || hostname.endsWith('.localhost') ||
      hostname.endsWith('.local') || hostname.endsWith('.internal') || hostname.endsWith('.localhost.localdomain')) {
    throw new Error('El destino local o interno no está permitido.');
  }
  if (isIP(hostname)) {
    if (!isPublicAddress(hostname)) throw new Error('La URL apunta a una dirección IP no pública.');
    return url;
  }
  let addresses;
  try {
    addresses = await resolveHost(hostname, { all: true, verbatim: true });
  } catch {
    throw new Error('No se pudo resolver el host de la URL.');
  }
  if (!Array.isArray(addresses) || addresses.length === 0 ||
      addresses.some((entry) => !entry || !isPublicAddress(entry.address))) {
    throw new Error('El host debe resolver exclusivamente a direcciones IP públicas.');
  }
  return url;
}

export async function readTextLimited(response, maxBytes = 2_000_000) {
  const declared = Number(response.headers.get('content-length') || 0);
  if (declared > maxBytes) {
    await response.body?.cancel();
    throw new Error('La respuesta supera el tamaño máximo permitido.');
  }
  if (!response.body) return '';
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let bytes = 0;
  let output = '';
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      bytes += value.byteLength;
      if (bytes > maxBytes) {
        await reader.cancel();
        throw new Error('La respuesta supera el tamaño máximo permitido.');
      }
      output += decoder.decode(value, { stream: true });
    }
    return output + decoder.decode();
  } finally {
    reader.releaseLock();
  }
}
