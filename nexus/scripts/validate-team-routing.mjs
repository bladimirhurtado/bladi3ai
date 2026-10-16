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
}

assert.ok(vercel.includes("provider==='openrouter'?'OPENROUTER_API_KEY'"),
  'Vercel backend must use the OpenRouter server-side key');
assert.ok(app.includes('Estado de colaboradores'), 'UI must show team status');
assert.ok(app.includes('d.models?.architect'), 'UI must attribute model names');
assert.ok(app.includes('d.models?.coder'), 'UI must attribute the Codex coding role');

console.log('OK: Vercel and Netlify team contracts, model attribution, and partial-failure reporting are aligned.');
console.log('Note: this is a static contract check; it does not make paid API calls.');
