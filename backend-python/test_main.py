"""
Resora Python Backend Test Suite
=================================
Tests cover the exact failure modes that allowed bugs to reach production:

1. detect_profession_from_text() returning wrong value for empty/edge-case input
2. parse_resume_fields() returning a dict with correct keys even for minimal input
3. /api/parse-resume endpoint returning profession='general' for empty-ish content
4. /api/parse-resume endpoint basic schema validation

Run with:
    pytest test_main.py -v
"""

import io
from unittest.mock import MagicMock, patch

import pytest
from fastapi.testclient import TestClient

# Patch the Supabase client to None before importing the app so all rate limit
# tests use the in-memory fallback path (no real Supabase connection needed).
with patch.dict("os.environ", {"SUPABASE_SERVICE_ROLE_KEY": ""}):
    import main as _main_module

    # Force the module-level client to None so tests always use in-memory
    _main_module._supabase_client = None

from main import (
    PARSED_PDF_CACHE,
    RATE_LIMIT_STORE,
    app,
    detect_profession_from_text,
    parse_resume_fields,
)

client = TestClient(app)


@pytest.fixture(autouse=True)
def reset_in_memory_state():
    """Reset the rate limiter and parse cache between every test so tests don't bleed state."""
    RATE_LIMIT_STORE.clear()
    PARSED_PDF_CACHE.clear()
    yield
    RATE_LIMIT_STORE.clear()
    PARSED_PDF_CACHE.clear()


# ── Health Check ──────────────────────────────────────────────────────────────

def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "online"
    assert "service" in data


# ── detect_profession_from_text ───────────────────────────────────────────────

def test_detect_profession_empty_string_returns_general():
    """Empty input must return 'general', never a specific profession like 'it'."""
    assert detect_profession_from_text("") == "general"


def test_detect_profession_whitespace_only_returns_general():
    assert detect_profession_from_text("   \n\t  ") == "general"


def test_detect_profession_no_keywords_returns_general():
    assert detect_profession_from_text("John Doe, 1234 Main Street") == "general"


def test_detect_profession_it_keywords():
    text = "Software Developer with experience in React, Node.js, and Python"
    result = detect_profession_from_text(text)
    assert result == "it"


def test_detect_profession_healthcare_keywords():
    text = "Registered Nurse with 5 years of clinical experience in hospital settings"
    result = detect_profession_from_text(text)
    assert result == "healthcare"


def test_detect_profession_education_keywords():
    text = "Teacher with curriculum development experience in classroom environments"
    result = detect_profession_from_text(text)
    assert result == "education"


def test_detect_profession_data_keywords():
    text = "Data Scientist specializing in machine learning and power bi dashboards"
    result = detect_profession_from_text(text)
    assert result == "data"


def test_detect_profession_business_keywords():
    text = "CPA and financial analyst with 8 years in accounting and auditing"
    result = detect_profession_from_text(text)
    assert result == "business"


# ── parse_resume_fields ───────────────────────────────────────────────────────

def test_parse_resume_fields_returns_expected_schema():
    """parse_resume_fields must always return a dict with 'resume' and 'profession' keys."""
    text = "John Smith\nSoftware Engineer at Acme Corp\nSkills: Python, React"
    result = parse_resume_fields(text)

    assert isinstance(result, dict), "Should return a dict"
    assert "resume" in result, "Must contain 'resume' key"
    assert "profession" in result, "Must contain 'profession' key"


def test_parse_resume_fields_empty_text_returns_general():
    """Empty text must produce profession='general', not 'it'."""
    result = parse_resume_fields("")
    assert result.get("profession") == "general"


def test_parse_resume_fields_empty_text_resume_is_dict():
    result = parse_resume_fields("")
    assert isinstance(result.get("resume"), dict)


def test_parse_resume_fields_has_correct_resume_subkeys():
    """The resume object should have personal section at minimum."""
    text = "Maria Santos\nRN, Clinical Nurse Specialist\nmaria@email.com\n09171234567"
    result = parse_resume_fields(text)
    resume = result.get("resume", {})
    # Must have a personal section
    assert "personal" in resume or resume == {}, \
        "resume must have 'personal' key or be empty dict"


# ── /api/parse-resume endpoint ────────────────────────────────────────────────

SAMPLE_TEXT_RESUME = b"""Daniel Kane Mapano
Software Developer
daniel@mapano.dev | 09171234567 | Manila, Philippines
github.com/mapano-daniel

SUMMARY
Full-stack developer with 3 years of experience building React and Node.js applications.

EXPERIENCE
Software Engineer | Acme Corp | Jun 2022 - Present
- Developed React frontend serving 50,000 daily active users
- Built REST APIs using Node.js and Express
- Reduced page load time by 40% through optimization

EDUCATION
BS Information Technology | Polytechnic University of the Philippines | 2022

SKILLS
JavaScript, React, Node.js, Python, PostgreSQL, Docker, AWS
"""


def test_parse_resume_endpoint_returns_200_with_text_file():
    """POST a plain text resume and assert 200 response with basic schema."""
    response = client.post(
        "/api/parse-resume",
        files={"file": ("resume.txt", io.BytesIO(SAMPLE_TEXT_RESUME), "text/plain")},
    )
    assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"


def test_parse_resume_endpoint_returns_success_true():
    response = client.post(
        "/api/parse-resume",
        files={"file": ("resume.txt", io.BytesIO(SAMPLE_TEXT_RESUME), "text/plain")},
    )
    data = response.json()
    assert data.get("success") is True


def test_parse_resume_endpoint_returns_resume_key():
    """The response must always include a 'resume' key — even if AI parsing fails."""
    response = client.post(
        "/api/parse-resume",
        files={"file": ("resume.txt", io.BytesIO(SAMPLE_TEXT_RESUME), "text/plain")},
    )
    data = response.json()
    assert "resume" in data, f"Missing 'resume' key in response: {list(data.keys())}"


def test_parse_resume_endpoint_returns_profession_key():
    """The response must always include a 'profession' key."""
    response = client.post(
        "/api/parse-resume",
        files={"file": ("resume.txt", io.BytesIO(SAMPLE_TEXT_RESUME), "text/plain")},
    )
    data = response.json()
    assert "profession" in data, f"Missing 'profession' key in response: {list(data.keys())}"


def test_parse_resume_endpoint_profession_is_valid_value():
    """profession must be one of the known values, never None or empty string."""
    VALID_PROFESSIONS = {
        "it", "healthcare", "education", "management", "engineering",
        "safety", "customs", "business", "designer", "data", "sales",
        "hr", "general"
    }
    response = client.post(
        "/api/parse-resume",
        files={"file": ("resume.txt", io.BytesIO(SAMPLE_TEXT_RESUME), "text/plain")},
    )
    data = response.json()
    profession = data.get("profession")
    assert profession in VALID_PROFESSIONS, \
        f"Got unexpected profession value: '{profession}'"


def test_parse_resume_endpoint_empty_content_returns_general():
    """
    Critical regression test:
    Uploading a file with no meaningful resume content must return profession='general',
    NOT 'it' or any other specific profession.
    This was the bug: empty parse results defaulted to 'it'.
    """
    empty_content = b"   \n   \n   "
    response = client.post(
        "/api/parse-resume",
        files={"file": ("empty.txt", io.BytesIO(empty_content), "text/plain")},
    )
    # Empty file should either error (400) or return general
    if response.status_code == 200:
        data = response.json()
        profession = data.get("profession")
        assert profession == "general", \
            f"Empty content should yield 'general' profession, got '{profession}'"
    else:
        # 400 is also acceptable for empty content
        assert response.status_code == 400


def test_parse_resume_endpoint_rejects_oversized_file():
    """Files over 5MB must return 400."""
    large_content = b"x" * (5 * 1024 * 1024 + 1)
    response = client.post(
        "/api/parse-resume",
        files={"file": ("big.txt", io.BytesIO(large_content), "text/plain")},
    )
    assert response.status_code == 400


def test_parse_resume_endpoint_rate_limit_daily():
    """After 3 uploads from the same IP within the rate limit window, should get 429."""
    for _ in range(3):
        client.post(
            "/api/parse-resume",
            files={"file": ("resume.txt", io.BytesIO(SAMPLE_TEXT_RESUME), "text/plain")},
        )
    # 4th request from the same IP should be rate-limited
    response = client.post(
        "/api/parse-resume",
        files={"file": ("resume.txt", io.BytesIO(SAMPLE_TEXT_RESUME), "text/plain")},
    )
    assert response.status_code == 429
    assert "Maximum 3 resume uploads per week" in response.json().get("detail", "")


def test_parse_resume_endpoint_rate_limit_x_forwarded_for():
    """Different client IPs via X-Forwarded-For header should have separate limits."""
    headers_a = {"x-forwarded-for": "203.0.113.195, 10.0.0.1"}
    headers_b = {"x-forwarded-for": "198.51.100.42"}

    # Use up IP A's 3 weekly uploads
    for _ in range(3):
        res = client.post(
            "/api/parse-resume",
            files={"file": ("resume.txt", io.BytesIO(SAMPLE_TEXT_RESUME), "text/plain")},
            headers=headers_a,
        )
        assert res.status_code == 200

    # 4th for IP A should be blocked
    res_a_4 = client.post(
        "/api/parse-resume",
        files={"file": ("resume.txt", io.BytesIO(SAMPLE_TEXT_RESUME), "text/plain")},
        headers=headers_a,
    )
    assert res_a_4.status_code == 429

    # IP B should still be allowed
    res_b_1 = client.post(
        "/api/parse-resume",
        files={"file": ("resume.txt", io.BytesIO(SAMPLE_TEXT_RESUME), "text/plain")},
        headers=headers_b,
    )
    assert res_b_1.status_code == 200


def test_parse_achievements_unwraps_multiline_bullets():
    """Verify that multi-line wrapped bullet points in achievements are merged properly without creating phantom items."""
    sample_text = """DANIEL KANE MAPANO
IT Consultant | Project Manager
daniel@example.com | +63 9292232800 | Cebu, Philippines

ACHIEVEMENTS
Student Adviser                                     Aug 2025 - Aug 2026
Philippine Society of Information Technology Students
• Served as the strategic catalyst for organizational growth, mentoring student leaders in redefining their operational culture and
establishing a scalable framework for future leadership terms.

Project Manager — 3rd Place                          Apr 2026
UC ICT Congress - Lightning Pitch Competition
• Architected the strategic framework for Project Copra, transforming coconut waste into alternative energy and shifting the
standard for high-impact competition pitches.
"""
    result = parse_resume_fields(sample_text)
    resume = result.get("resume", {})
    achievements = resume.get("achievements", [])

    assert len(achievements) == 2, f"Expected exactly 2 achievements, got {len(achievements)}"
    
    first_ach = achievements[0]
    assert "Student Adviser" in first_ach.get("title", "")
    assert len(first_ach.get("bullets", [])) == 1
    # Check that the wrapped line was merged into the single bullet point
    assert "establishing a scalable framework for future leadership terms." in first_ach["bullets"][0]

    second_ach = achievements[1]
    assert "Project Manager" in second_ach.get("title", "")
    assert len(second_ach.get("bullets", [])) == 1
    assert "standard for high-impact competition pitches." in second_ach["bullets"][0]


def test_rate_limit_status_endpoint():
    """Verify rate-limit-status returns correct quota and rate limited flag."""
    ip_headers = {"x-forwarded-for": "192.0.2.77"}
    res = client.get("/api/rate-limit-status", headers=ip_headers)
    assert res.status_code == 200
    data = res.json()
    assert data["maxUploads"] == 3
    assert data["remainingUploads"] == 3
    assert data["isRateLimited"] is False
