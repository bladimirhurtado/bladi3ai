export function completionEndpoint(baseUrl) {
  const normalized = String(baseUrl).replace(/\/$/, '');
  if (normalized.endsWith('/v1') || normalized.endsWith('/v1beta/openai')) {
    return normalized + '/chat/completions';
  }
  return normalized + '/v1/chat/completions';
}
