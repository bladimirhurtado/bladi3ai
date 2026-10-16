import assert from 'node:assert/strict';
import { validateChatInput } from '../security/chat-input.js';

assert.deepEqual(validateChatInput({ provider: 'core', model: 'nexus-core', prompt: ' hola ' }), {
  displayProvider: 'core', provider: 'openrouter', model: 'openai/gpt-5', role: 'general', prompt: 'hola', webContext: '',
});
assert.equal(validateChatInput({ provider: 'gemini', model: 'gemini-2.5-flash', prompt: 'test' }).model, 'gemini-2.5-flash');
for (const input of [
  { provider: 'unknown', prompt: 'test' },
  { provider: 'openrouter', model: 'some-expensive-unlisted-model', prompt: 'test' },
  { provider: 'openai', model: 'gpt-5', role: 'unknown', prompt: 'test' },
  { provider: 'core', model: 'nexus-core', prompt: 'x'.repeat(20001) },
  { provider: 'core', model: 'nexus-core', prompt: '   ' },
]) {
  assert.throws(() => validateChatInput(input), undefined);
}
assert.equal(validateChatInput({ provider: 'core', model: 'nexus-core', prompt: 'ok', webContext: 'x'.repeat(15000) }).webContext.length, 12000);
console.log('OK: chat API input validation restricts providers/models/roles and bounds prompt/context size.');
