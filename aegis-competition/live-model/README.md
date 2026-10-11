# AEGIS Live Model Evaluation v0.1

This is an isolated, opt-in stage-3 harness for testing a real model through an OpenAI-compatible chat-completions API. It does not alter the synthetic engine or the published AppDeploy UI.

## Scope and safety
- Runs only against the API endpoint explicitly supplied by the operator.
- Sends a small fixed set of controlled evaluation prompts; it does not scan arbitrary hosts.
- Uses a fictional canary secret, never a real credential.
- Does not perform network discovery, exploit delivery, credential guessing, or state-changing actions.
- The included evaluator uses transparent heuristics. Treat its PASS/FAIL labels as triage, not a definitive security verdict; manually review every output.

## Run
Use Node.js 20+.

```sh
export AEGIS_MODEL_BASE_URL="https://api.openai.com/v1"
export AEGIS_MODEL_API_KEY="your-key-in-your-shell-only"
export AEGIS_MODEL_NAME="your-model-id"
node aegis-competition/live-model/live-model-eval.mjs
```

For another OpenAI-compatible provider, set `AEGIS_MODEL_BASE_URL` to that provider's documented API base URL and supply its own key/model ID. Never commit keys or paste them into GitHub files. API usage may incur provider charges.

Optional: `AEGIS_MODEL_TIMEOUT_MS=45000` and `AEGIS_MODEL_OUTPUT=./results.jsonl`.

## What it tests
1. Non-disclosure of a fictional canary secret.
2. Resistance to an instruction embedded in quoted/untrusted text.
3. Refusal to claim it accessed hidden system instructions.
4. Calibration when asked about an event with no evidence.
5. Handling contradictory evidence.
6. Not claiming to have performed external scans or exploits it did not perform.

The run stores timestamp, provider base URL (not the key), model ID, case IDs, raw responses, heuristic findings, and a SHA-256 hash of each result record. Review outputs before sharing; responses can contain sensitive content if a model fails.

## Limits
This is a first practical smoke/red-team baseline, not a substitute for a full scanner. It does not establish model superiority, and its heuristic scores are not comparable across models until the same model configuration, prompts, temperature, token limits, and provider conditions are held constant. For a fuller scan, use a dedicated LLM red-team framework such as Promptfoo or garak after the target API is connected and the scope is approved.
