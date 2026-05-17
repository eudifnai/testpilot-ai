# Demo Data

Use the following inputs when you want a quick walkthrough of the product during demos, smoke checks, or onboarding.

## Requirement Analysis / Testcase Generator

```text
User login requirement:

Users can log in with a mobile number and password.
The mobile number must contain exactly 11 digits.
The password length must be between 6 and 20 characters.
After 5 consecutive failed password attempts, the account is locked for 30 minutes.
If the mobile number is not registered, the system should still show "Invalid account or password".
After successful login, the API returns token, user ID, username, and role information.
```

## API Test Generator

```text
POST /api/login
Request body:
- mobile: string, required, 11 digits
- password: string, required, 6-20 chars

Response 200:
- token: string
- user_id: string
- user_name: string
- role: string

Response 401:
- message: invalid account or password
```

## Bug Analyzer

```text
Title: Login returns 500 after valid credentials
Steps:
1. Open the login page
2. Enter a valid mobile number and password
3. Click login

Actual Result:
The API returns HTTP 500 and the page stays on login.

Expected Result:
The user logs in successfully and is redirected to the dashboard.

Logs:
NullPointerException in auth service

Environment:
staging / Chrome latest / build 0.4.0
```

## Test Report

- Project Name: `TestPilot AI`
- Version: `0.4.0`
- Test Scope: `Requirement analysis, testcase generation, API test generation, bug analysis, and history replay flows`
- Test Result: `Core workflows pass smoke validation and export works as expected`
- Bug Summary: `1 medium-priority UX issue remains open`
- Risk Notes: `Prompt tuning and broader regression coverage are still in progress`
- Test Environment: `Local Windows environment with FastAPI and Vite dev servers`
