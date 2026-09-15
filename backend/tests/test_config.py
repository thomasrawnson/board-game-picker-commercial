import pytest

from config import get_settings


def production_environment(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    values = {
        "APP_ENV": "production",
        "DATABASE_URL": (
            "postgresql://user:password@db/app"
        ),
        "JWT_SECRET": "x" * 32,
        "CORS_ORIGINS": (
            "https://app.example.com/"
        ),
        "FRONTEND_URL": (
            "https://app.example.com/"
        ),
        "AI_PICKER_ENABLED": "false",
        "RESEND_API_KEY": "re_test_key",
        "EMAIL_FROM": (
            "BoardGamePicker "
            "<accounts@mail.example.com>"
        ),
    }

    for name, value in values.items():
        monkeypatch.setenv(name, value)


def test_production_settings_are_normalised(
    monkeypatch: pytest.MonkeyPatch,
):
    production_environment(monkeypatch)

    settings = get_settings()

    assert settings.frontend_url == (
        "https://app.example.com"
    )
    assert settings.cors_origins == [
        "https://app.example.com"
    ]


@pytest.mark.parametrize(
    ("name", "value", "message"),
    [
        (
            "JWT_SECRET",
            "too-short",
            "at least 32 characters",
        ),
        (
            "CORS_ORIGINS",
            "http://app.example.com",
            "must use HTTPS",
        ),
        (
            "FRONTEND_URL",
            "http://app.example.com",
            "must use HTTPS",
        ),
        (
            "AI_PICKER_ENABLED",
            "true",
            "must remain disabled",
        ),
        (
            "RESEND_API_KEY",
            "",
            "RESEND_API_KEY",
        ),
        (
            "EMAIL_FROM",
            "BoardGamePicker <onboarding@resend.dev>",
            "verified sending domain",
        ),
    ],
)
def test_invalid_production_settings_fail_fast(
    monkeypatch: pytest.MonkeyPatch,
    name: str,
    value: str,
    message: str,
):
    production_environment(monkeypatch)
    monkeypatch.setenv(name, value)

    with pytest.raises(
        RuntimeError,
        match=message,
    ):
        get_settings()
