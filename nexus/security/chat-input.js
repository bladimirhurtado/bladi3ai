const MODELS = {
  core: ['nexus-core'],
  openrouter: ['openai/gpt-5', 'openai/gpt-5.4', 'anthropic/claude-sonnet-4', 'google/gemini-2.5-flash'],
  openai: ['gpt-5', 'gpt-4.1'],
  groq: ['openai/gpt-oss-120b', 'llama-3.3-70b-versatile'],
  mistral: ['mistral-large-latest', 'mistral-small-latest'],
  kimi: ['kimi-k2.5', 'kimi-k2-turbo-preview'],
  gemini: ['gemini-2.5-pro', 'gemini-2.5-flash'],
};
const ROLES = new Set(['general', 'architect', 'coder', 'analyst', 'critic']);

export function validateChatInput(body = {}) {
  const displayProvider = typeof body.provider === 'string' ? body.provider : 'openrouter';
  if (!Object.hasOwn(MODELS, displayProvider)) throw new Error('Proveedor no permitido.');
  const model = typeof body.model === 'string' && body.model ? body.model : MODELS[displayProvider][0];
  if (!MODELS[displayProvider].includes(model)) throw new Error('Modelo no permitido para este proveedor.');
  const prompt = typeof body.prompt === 'string' ? body.prompt.trim() : '';
  if (!prompt) throw new Error('prompt is required');
  if (prompt.length > 20000) throw new Error('El prompt supera el máximo de 20000 caracteres.');
  const role = typeof body.role === 'string' && body.role ? body.role : 'general';
  if (!ROLES.has(role)) throw new Error('Rol no permitido.');
  const webContext = typeof body.webContext === 'string' ? body.webContext.slice(0, 12000) : '';
  return {
    displayProvider,
    provider: displayProvider === 'core' ? 'openrouter' : displayProvider,
    model: displayProvider === 'core' ? 'openai/gpt-5' : model,
    role,
    prompt,
    webContext,
  };
}
