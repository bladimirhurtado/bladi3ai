import test from 'node:test';
import assert from 'node:assert/strict';
import { completionEndpoint } from './api.mjs';

test('OpenRouter OpenAI-compatible base URL', () => {
  assert.equal(completionEndpoint('https://openrouter.ai/api/v1'), 'https://openrouter.ai/api/v1/chat/completions');
});

test('OpenAI official base URL', () => {
  assert.equal(completionEndpoint('https://api.openai.com/v1'), 'https://api.openai.com/v1/chat/completions');
});

test('Gemini OpenAI-compatible base URL', () => {
  assert.equal(completionEndpoint('https://generativelanguage.googleapis.com/v1beta/openai'), 'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions');
});

test('Meta Model API base URL', () => {
  assert.equal(completionEndpoint('https://api.meta.ai/v1/'), 'https://api.meta.ai/v1/chat/completions');
});

test('custom root base URL', () => {
  assert.equal(completionEndpoint('https://model.example'), 'https://model.example/v1/chat/completions');
});

test('rechaza HTTP remoto para no enviar credenciales sin cifrar', () => {
  assert.throws(() => completionEndpoint('http://api.example.com/v1'), /HTTP fuera de localhost/);
});

test('permite HTTP solo en loopback para pruebas locales', () => {
  assert.equal(completionEndpoint('http://127.0.0.1:4312'), 'http://127.0.0.1:4312/v1/chat/completions');
  assert.equal(completionEndpoint('http://localhost:4312/v1'), 'http://localhost:4312/v1/chat/completions');
});

test('rechaza protocolos no HTTP(S)', () => {
  assert.throws(() => completionEndpoint('file:///etc/passwd'), /debe usar HTTPS/);
});

test('rechaza credenciales embebidas en la URL', () => {
  assert.throws(() => completionEndpoint('https://user:pass@example.com/v1'), /no puede incluir credenciales/);
});

test('rechaza query y fragmento en URL base', () => {
  assert.throws(() => completionEndpoint('https://api.example.com/v1?token=secret'), /no puede incluir parámetros/);
  assert.throws(() => completionEndpoint('https://api.example.com/v1#fragment'), /no puede incluir parámetros/);
});

test('rechaza URL base mal formada', () => {
  assert.throws(() => completionEndpoint('not a url'), /no es válida/);
});
