# API Spec

## Implemented P0 Endpoints

### `POST /api/ai/analyze-requirement`

Request:

```json
{
  "requirement_text": "plain-text requirement"
}
```

Response:

```json
{
  "summary": "summary",
  "features": ["..."],
  "business_flow": ["..."],
  "test_points": ["..."],
  "risks": ["..."],
  "questions": ["..."]
}
```

### `POST /api/ai/generate-testcases`

Request:

```json
{
  "requirement_text": "plain-text requirement",
  "case_types": ["functional", "boundary", "exception"],
  "case_count": 12
}
```

Response:

```json
{
  "testcases": [
    {
      "case_id": "TC001",
      "module": "Login",
      "title": "Verify login succeeds with valid credentials",
      "precondition": "user exists",
      "steps": ["..."],
      "test_data": "...",
      "expected_result": "...",
      "priority": "P1",
      "case_type": "Functional",
      "remark": ""
    }
  ]
}
```

### `POST /api/export/testcases`

Request:

```json
{
  "testcases": []
}
```

Response: Excel file download (`testcases.xlsx`)

### `POST /api/ai/generate-api-tests`

Generate API-oriented testcases from API documentation, Swagger snippets, field descriptions, or curl commands.

### `POST /api/ai/analyze-bug`

Generate a structured bug analysis and developer checklist.

### `POST /api/ai/generate-report`

Generate a markdown test report from test summary input.

### `GET /api/ai/history/recent`

Return recent generation records for dashboard display and recall.

### `GET /api/ai/history/{id}`

Return the full saved input and output for a generation record.

### `POST /api/testcase-versions`

Save the current edited testcase set as a reusable version snapshot.

### `GET /api/testcase-versions`

List saved testcase versions.

### `GET /api/testcase-versions/{id}`

Load a saved testcase version with its testcase payload.
