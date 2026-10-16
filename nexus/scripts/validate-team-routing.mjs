import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = (path) => readFileSync(new URL(path, import.meta.url), 'utf8');
const vercel = read('../api/index.ts');
const netlify = read('../netlify/functions/api.ts');
const app = read('../src/App.tsx');

const roles = [
  ['NEXUS_TEAM_ARCHITECT_MODEL', '~anthropic/claude-sonnet-latest'],
  ['NEXUS_TEAM_RESEARCHER_MODEL', '~google/gemini-flash-latest'],
  ['NEXUS_TEAM_CODER_MODEL', 'openai/gpt-5.3-codex'],
  ['NEXUS_TEAM_CRITIC_MODEL', '~deepseek/deepseek-flash-latest'],
  ['NEXUS_TEAM_SYNTHESIS_MODEL', '~openai/gpt-latest'],
];

for (const source of [vercel, netlify]) {
  for (const [envName, model] of roles) {
    assert.ok(source.includes(envName), `Missing team model setting: ${envName}`);
    assert.ok(source.includes(model), `Missing documented default model: ${model}`);
  }
  assert.ok(source.includes("p==='/team'") || source.includes("p==='/api/team'"),
    'Missing team endpoint');
  assert.ok(source.includes('statuses:'), 'Team endpoint must report collaborator status');
  assert.ok(source.includes('warnings'), 'Team endpoint must report partial failures');
  assert.ok(source.includes('validateChatInput(b)'), 'Chat endpoint must validate provider/model/role and input sizes');
}

assert.ok(vercel.includes("provider==='openrouter'?'OPENROUTER_API_KEY'"),
  'Vercel backend must use the OpenRouter server-side key');
assert.ok(app.includes('Estado de colaboradores'), 'UI must show team status');
assert.ok(app.includes('d.models?.architect'), 'UI must attribute model names');
assert.ok(app.includes('d.models?.coder'), 'UI must attribute the Codex coding role');

assert.ok(vercel.includes('validatePublicHttpUrl(input)'), 'Vercel scrape must validate public URL targets');
assert.ok(vercel.includes("env('NEXUS_ALLOWED_ORIGINS')"), 'Vercel API must use a configurable CORS origin allowlist');
assert.ok(!vercel.includes("setHeader('Access-Control-Allow-Origin','*')"), 'Vercel API must not use wildcard CORS');
assert.ok(netlify.includes('validatePublicHttpUrl(input)'), 'Netlify scrape must validate public URL targets');
assert.ok(vercel.includes("redirect:'error'"), 'Vercel scrape must not follow unvalidated redirects');
assert.ok(vercel.includes('AbortSignal.timeout(10000)'), 'Vercel scrape must have a request timeout');
assert.ok(vercel.includes('readTextLimited(r)'), 'Vercel scrape must enforce a response-size limit');
assert.ok(netlify.includes("redirect:'error'"), 'Netlify scrape must not follow unvalidated redirects');
assert.ok(netlify.includes('AbortSignal.timeout(10000)'), 'Netlify scrape must have a request timeout');
assert.ok(netlify.includes('readTextLimited(r)'), 'Netlify scrape must enforce a response-size limit');
assert.ok(netlify.includes("firecrawl:!!env('FIRECRAWL_API_KEY')"), 'Netlify status must not claim Firecrawl is active without a key');
console.log('OK: Vercel and Netlify team/chat contracts and scrape security guards are aligned.');
console.log('Note: this is a static contract check; it does not make paid API calls.');
