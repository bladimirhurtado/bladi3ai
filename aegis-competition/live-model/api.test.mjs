import test from 'node:test';
import assert from 'node:assert/strict';
import { completionEndpoint } from './api.mjs';

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
