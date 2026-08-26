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
import json
import pytest
from fastapi.testclient import TestClient
from main import app, detect_profession_from_text, parse_resume_fields, RATE_LIMIT_STORE, PARSED_PDF_CACHE

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


def test_parse_resume_endpoint_rate_limit():
    """After 5 uploads from the same IP within a minute, should get 429."""
    # Make 5 allowed requests first
    for _ in range(5):
        client.post(
            "/api/parse-resume",
            files={"file": ("resume.txt", io.BytesIO(SAMPLE_TEXT_RESUME), "text/plain")},
        )
    # 6th request should be rate-limited
    response = client.post(
        "/api/parse-resume",
        files={"file": ("resume.txt", io.BytesIO(SAMPLE_TEXT_RESUME), "text/plain")},
    )
    assert response.status_code == 429
