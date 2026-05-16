# Prompt Notes

## Requirement Analysis

- Structured JSON output
- Grounded in requirement text only
- Must surface ambiguity in `questions`

## Testcase Generation

- Structured JSON testcase array
- Coverage for requested testcase types
- Verifiable expected result and executable steps

## Fallback Mode

When no OpenAI-compatible credentials are configured, the backend returns deterministic local output so the MVP remains runnable in local development.

## Extended Modules

- API testcase generation prompt
- Bug analysis prompt
- Markdown test report prompt

Each prompt is paired with a deterministic fallback implementation so the UI remains usable even without model credentials.
