import json
import re
from typing import Any

from openai import OpenAI

from app.core.config import Settings
from app.schemas.api_test import APITestGenerationResponse, APITestcase
from app.schemas.bug import BugAnalysisResponse
from app.schemas.report import TestReportResponse
from app.schemas.requirement import RequirementAnalysisResponse
from app.schemas.testcase import Testcase, TestcaseGenerationResponse
from app.services.prompt_library import (
    API_TEST_GENERATION_PROMPT,
    BUG_ANALYSIS_PROMPT,
    REQUIREMENT_ANALYSIS_PROMPT,
    TESTCASE_GENERATION_PROMPT,
    TEST_REPORT_PROMPT,
)


CASE_TYPE_LABELS = {
    "functional": "Functional",
    "boundary": "Boundary",
    "exception": "Exception",
    "security": "Security",
    "permission": "Permission",
    "compatibility": "Compatibility",
}


class AIService:
    def __init__(self, settings: Settings) -> None:
        self.settings = settings
        self.client = None
        if settings.openai_api_key:
            self.client = OpenAI(
                api_key=settings.openai_api_key,
                base_url=settings.openai_base_url or None,
            )

    def analyze_requirement(self, requirement_text: str) -> RequirementAnalysisResponse:
        if self.client is None:
            return self._fallback_requirement_analysis(requirement_text)
        payload = self._chat_json(prompt=REQUIREMENT_ANALYSIS_PROMPT, user_input=requirement_text)
        try:
            return RequirementAnalysisResponse.model_validate(payload)
        except Exception:
            return self._fallback_requirement_analysis(requirement_text)

    def generate_testcases(
        self,
        requirement_text: str,
        case_types: list[str],
        case_count: int,
    ) -> TestcaseGenerationResponse:
        if self.client is None:
            return self._fallback_testcases(requirement_text, case_types, case_count)
        payload = self._chat_json(
            prompt=TESTCASE_GENERATION_PROMPT,
            user_input=json.dumps(
                {
                    "requirement_text": requirement_text,
                    "case_types": case_types,
                    "case_count": case_count,
                },
                ensure_ascii=False,
            ),
        )
        try:
            result = TestcaseGenerationResponse.model_validate(payload)
            if result.testcases:
                return result
        except Exception:
            pass
        return self._fallback_testcases(requirement_text, case_types, case_count)

    def generate_api_tests(self, api_doc: str) -> APITestGenerationResponse:
        if self.client is None:
            return self._fallback_api_tests(api_doc)
        payload = self._chat_json(prompt=API_TEST_GENERATION_PROMPT, user_input=api_doc)
        try:
            result = APITestGenerationResponse.model_validate(payload)
            if result.testcases:
                return result
        except Exception:
            pass
        return self._fallback_api_tests(api_doc)

    def analyze_bug(self, bug_payload: dict[str, str]) -> BugAnalysisResponse:
        if self.client is None:
            return self._fallback_bug_analysis(bug_payload)
        payload = self._chat_json(
            prompt=BUG_ANALYSIS_PROMPT,
            user_input=json.dumps(bug_payload, ensure_ascii=False),
        )
        try:
            return BugAnalysisResponse.model_validate(payload)
        except Exception:
            return self._fallback_bug_analysis(bug_payload)

    def generate_report(self, report_payload: dict[str, str]) -> TestReportResponse:
        if self.client is None:
            return self._fallback_test_report(report_payload)
        payload = self._chat_json(
            prompt=TEST_REPORT_PROMPT,
            user_input=json.dumps(report_payload, ensure_ascii=False),
        )
        try:
            return TestReportResponse.model_validate(payload)
        except Exception:
            return self._fallback_test_report(report_payload)

    def _chat_json(self, prompt: str, user_input: str) -> dict[str, Any]:
        assert self.client is not None
        completion = self.client.chat.completions.create(
            model=self.settings.model_name,
            temperature=0.2,
            response_format={"type": "json_object"},
            messages=[
                {"role": "system", "content": prompt},
                {"role": "user", "content": user_input},
            ],
        )
        content = completion.choices[0].message.content or "{}"
        return json.loads(content)

    def _fallback_requirement_analysis(self, requirement_text: str) -> RequirementAnalysisResponse:
        cleaned = self._normalize_text(requirement_text)
        sentences = self._split_sentences(cleaned)
        features = self._extract_features(sentences)
        return RequirementAnalysisResponse(
            summary=sentences[0] if sentences else "Requirement text received for analysis.",
            features=features or ["Core business capability identified from requirement input"],
            business_flow=self._build_business_flow(features),
            test_points=self._build_test_points(features),
            risks=self._build_risks(cleaned),
            questions=self._build_questions(cleaned),
        )

    def _fallback_testcases(
        self,
        requirement_text: str,
        case_types: list[str],
        case_count: int,
    ) -> TestcaseGenerationResponse:
        analysis = self._fallback_requirement_analysis(requirement_text)
        features = analysis.features or ["Primary workflow"]
        labels = [CASE_TYPE_LABELS.get(case_type, case_type.title()) for case_type in case_types]
        testcases: list[Testcase] = []
        feature_index = 0

        while len(testcases) < case_count:
            feature = features[feature_index % len(features)]
            case_type = labels[len(testcases) % len(labels)]
            testcases.append(
                Testcase(
                    case_id=f"TC{len(testcases) + 1:03d}",
                    module=self._guess_module_name(feature),
                    title=self._build_case_title(feature, case_type, len(testcases)),
                    precondition="User can access the target function and prerequisite data is ready.",
                    steps=self._build_case_steps(feature, case_type),
                    test_data=self._build_test_data(feature, case_type),
                    expected_result=self._build_expected_result(feature, case_type),
                    priority="P1" if case_type in {"Functional", "Boundary"} else "P2",
                    case_type=case_type,
                    remark="Generated by local fallback mode",
                )
            )
            feature_index += 1

        return TestcaseGenerationResponse(testcases=testcases)

    def _fallback_api_tests(self, api_doc: str) -> APITestGenerationResponse:
        cleaned = self._normalize_text(api_doc)
        method_match = re.search(r"\b(GET|POST|PUT|DELETE|PATCH)\b", cleaned, re.IGNORECASE)
        path_match = re.search(r"(/[-A-Za-z0-9_/{}/]+)", cleaned)
        method = (method_match.group(1).upper() if method_match else "POST")
        path = path_match.group(1) if path_match else "/api/endpoint"
        name = self._guess_api_name(cleaned)
        testcases = [
            APITestcase(
                case_id="API_TC001",
                title=f"Verify {name} succeeds with valid request",
                request_data={"sample": "valid"},
                expected_status=200,
                expected_result="Returns successful response body with expected business fields.",
                case_type="Normal",
            ),
            APITestcase(
                case_id="API_TC002",
                title=f"Verify {name} rejects missing required parameters",
                request_data={},
                expected_status=400,
                expected_result="Returns validation failure with clear missing-field information.",
                case_type="Missing Parameter",
            ),
            APITestcase(
                case_id="API_TC003",
                title=f"Verify {name} rejects invalid parameter types",
                request_data={"sample": 12345},
                expected_status=400,
                expected_result="Returns parameter type validation error without processing the request.",
                case_type="Invalid Type",
            ),
            APITestcase(
                case_id="API_TC004",
                title=f"Verify {name} enforces authorization checks",
                request_data={"sample": "restricted"},
                expected_status=401,
                expected_result="Returns unauthorized or forbidden response when credentials are missing or invalid.",
                case_type="Permission",
            ),
        ]
        return APITestGenerationResponse(
            api_name=name,
            method=method,
            path=path,
            testcases=testcases,
            script_suggestion=(
                f"def test_{self._slugify(name)}(client):\n"
                f"    response = client.{method.lower()}('{path}', json={{'sample': 'valid'}})\n"
                "    assert response.status_code == 200"
            ),
            missing_info=[
                "Request schema details may need confirmation.",
                "Expected response fields and auth mode should be confirmed for automation.",
            ],
        )

    def _fallback_bug_analysis(self, bug_payload: dict[str, str]) -> BugAnalysisResponse:
        title = bug_payload.get("title", "Bug")
        actual_result = bug_payload.get("actual_result", "")
        expected_result = bug_payload.get("expected_result", "")
        environment = bug_payload.get("environment", "Unknown environment")
        severity = "High" if any(k in title.lower() for k in ["login", "pay", "crash", "data"]) else "Medium"
        priority = "P1" if severity == "High" else "P2"
        return BugAnalysisResponse(
            standard_bug_report=(
                f"Title: {title}\n"
                f"Environment: {environment}\n"
                f"Steps: {bug_payload.get('steps', '')}\n"
                f"Actual Result: {actual_result}\n"
                f"Expected Result: {expected_result}"
            ),
            possible_causes=[
                "Business validation logic may be incomplete or inconsistent with requirement rules.",
                "State transition or downstream dependency may not be handled correctly.",
                "Client and server validation rules may be misaligned.",
            ],
            severity=severity,
            priority=priority,
            impact_scope="Likely affects the primary user workflow tied to the reported scenario.",
            developer_checklist=[
                "Reproduce with the same environment and input data.",
                "Inspect validation and error-handling branches around the failing step.",
                "Check related service logs, API responses, and recent code changes.",
            ],
            suggested_additional_info=[
                "Attach exact timestamp and user/account identifier if available.",
                "Provide full request/response payload or console/network trace.",
            ],
        )

    def _fallback_test_report(self, report_payload: dict[str, str]) -> TestReportResponse:
        project_name = report_payload.get("project_name", "Project")
        version = report_payload.get("version", "N/A")
        test_scope = report_payload.get("test_scope", "")
        test_result = report_payload.get("test_result", "")
        bug_summary = report_payload.get("bug_summary", "")
        risk_notes = report_payload.get("risk_notes", "No extra risks provided.")
        environment = report_payload.get("test_environment", "Not specified")
        recommendation = "Recommend conditional release with known risks tracked." if risk_notes else "Recommend release after standard regression confirmation."
        markdown = (
            f"# Test Report\n\n"
            f"## Project Overview\n"
            f"- Project: {project_name}\n"
            f"- Version: {version}\n"
            f"- Test Environment: {environment}\n\n"
            f"## Test Scope\n{test_scope}\n\n"
            f"## Test Result Summary\n{test_result}\n\n"
            f"## Defect Summary\n{bug_summary}\n\n"
            f"## Risk Notes\n{risk_notes}\n\n"
            f"## Release Recommendation\n{recommendation}\n"
        )
        return TestReportResponse(report_markdown=markdown)

    def _normalize_text(self, text: str) -> str:
        return re.sub(r"\s+", " ", text).strip()

    def _split_sentences(self, text: str) -> list[str]:
        parts = re.split(r"(?<=[.!?。！？；;])\s*", text)
        return [part.strip() for part in parts if part.strip()]

    def _extract_features(self, sentences: list[str]) -> list[str]:
        features: list[str] = []
        for sentence in sentences[:8]:
            snippet = sentence[:80].strip(" .。")
            if snippet:
                features.append(snippet)
        return features[:6]

    def _build_business_flow(self, features: list[str]) -> list[str]:
        if not features:
            return ["Review requirement", "Execute primary workflow", "Validate response and edge behavior"]
        flow = ["Input business data", "Perform target action", "Verify outcome and follow-up behavior"]
        for feature in features[:2]:
            flow.append(f"Validate flow branch: {feature}")
        return flow[:5]

    def _build_test_points(self, features: list[str]) -> list[str]:
        points = [
            "Happy path validation",
            "Boundary input validation",
            "Error handling and user feedback",
            "Permission and security controls",
        ]
        for feature in features[:3]:
            points.append(f"Scenario coverage for: {feature}")
        return points[:8]

    def _build_risks(self, text: str) -> list[str]:
        risks = [
            "Requirement text may omit error-handling details.",
            "Business rules and state transitions may need confirmation.",
        ]
        if any(keyword in text.lower() for keyword in ["login", "payment", "token", "password", "auth"]):
            risks.append("Sensitive flows require stronger security and lockout coverage.")
        return risks

    def _build_questions(self, text: str) -> list[str]:
        questions = [
            "Are there role-based access differences for this feature?",
            "What are the exact validation and error-message rules?",
        ]
        if len(text) < 60:
            questions.append("Can you provide more business context or example scenarios?")
        return questions

    def _guess_module_name(self, feature: str) -> str:
        tokens = re.split(r"[,，:：\\- ]", feature)
        return tokens[0][:24] if tokens and tokens[0] else "Core Module"

    def _guess_api_name(self, api_doc: str) -> str:
        line = self._split_sentences(api_doc)[0] if self._split_sentences(api_doc) else api_doc[:40]
        return line[:40] if line else "API Endpoint"

    def _build_case_title(self, feature: str, case_type: str, index: int) -> str:
        if case_type == "Functional":
            return f"Verify {feature} completes successfully"
        if case_type == "Boundary":
            return f"Verify {feature} handles boundary input"
        if case_type == "Exception":
            return f"Verify {feature} handles invalid or failed execution"
        if case_type == "Security":
            return f"Verify {feature} enforces security constraints"
        if case_type == "Permission":
            return f"Verify {feature} enforces permission rules"
        if case_type == "Compatibility":
            return f"Verify {feature} remains stable across supported environments"
        return f"Verify scenario {index + 1} for {feature}"

    def _build_case_steps(self, feature: str, case_type: str) -> list[str]:
        steps = [
            f"Open the workflow related to {feature}.",
            "Prepare the required input and preconditions.",
            "Execute the target action.",
        ]
        if case_type == "Boundary":
            steps.insert(2, "Use the minimum, maximum, or edge-case values.")
        elif case_type == "Exception":
            steps.insert(2, "Provide invalid, missing, or conflicting input.")
        elif case_type in {"Security", "Permission"}:
            steps.insert(1, "Use an account or token with restricted access context.")
        steps.append("Observe the system response and persisted outcome.")
        return steps

    def _build_test_data(self, feature: str, case_type: str) -> str:
        if case_type == "Boundary":
            return f"Boundary values related to {feature}"
        if case_type == "Exception":
            return f"Invalid or missing data related to {feature}"
        if case_type in {"Security", "Permission"}:
            return f"Restricted credential set for {feature}"
        return f"Valid business data for {feature}"

    def _build_expected_result(self, feature: str, case_type: str) -> str:
        if case_type == "Boundary":
            return f"The system clearly accepts or rejects boundary input for {feature} with correct feedback."
        if case_type == "Exception":
            return f"The system blocks invalid execution of {feature} and returns a clear, recoverable error."
        if case_type in {"Security", "Permission"}:
            return f"The system prevents unauthorized access to {feature} and logs the attempt if applicable."
        return f"The system completes {feature} successfully and shows the expected business result."

    def _slugify(self, value: str) -> str:
        return re.sub(r"[^a-z0-9]+", "_", value.lower()).strip("_") or "api_endpoint"
