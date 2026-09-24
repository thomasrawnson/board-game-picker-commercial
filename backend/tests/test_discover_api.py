from types import SimpleNamespace

from fastapi.testclient import TestClient

from api.current_user import get_current_user
from api.dependencies import get_discover_service
from api.main import app
from bgg.client import BGGSourceUnavailableError


client = TestClient(app)


class FakeDiscoverService:
    def __init__(self):
        self.calls = []

    def get_recommendations(self, mode="hot", limit=10):
        self.calls.append((mode, limit))
        return []


def test_free_user_sees_for_you_as_locked_by_central_entitlement():
    service = FakeDiscoverService()
    app.dependency_overrides[get_current_user] = lambda: SimpleNamespace(tier="FREE")
    app.dependency_overrides[get_discover_service] = lambda: service

    try:
        response = client.get("/discover", params={"mode": "for_you"})
    finally:
        app.dependency_overrides.clear()

    assert response.status_code == 403
    assert service.calls == []


def test_pro_user_can_load_personalized_discover():
    service = FakeDiscoverService()
    app.dependency_overrides[get_current_user] = lambda: SimpleNamespace(tier="PRO")
    app.dependency_overrides[get_discover_service] = lambda: service

    try:
        response = client.get("/discover", params={"mode": "for_you"})
    finally:
        app.dependency_overrides.clear()

    assert response.status_code == 200
    assert service.calls == [("for_you", 10)]


def test_unavailable_discover_source_is_not_an_empty_success():
    class UnavailableDiscoverService:
        def get_recommendations(self, mode="hot", limit=10):
            raise BGGSourceUnavailableError(
                source="hot",
                status_code=502,
            )

    app.dependency_overrides[get_current_user] = lambda: SimpleNamespace(tier="FREE")
    app.dependency_overrides[get_discover_service] = UnavailableDiscoverService

    try:
        response = client.get("/discover", params={"mode": "hot"})
    finally:
        app.dependency_overrides.clear()

    assert response.status_code == 502
    assert response.json() == {
        "detail": "Recommendations are temporarily unavailable. Please try again."
    }
