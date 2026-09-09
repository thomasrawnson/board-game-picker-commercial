from models.ai_picker import (
    AiPickerCandidate,
)
from services.ai_picker_service import (
    AiPickerService,
)


def make_candidate(
    bgg_id: int,
    name: str,
    score: int,
) -> AiPickerCandidate:
    return AiPickerCandidate(
        bgg_id=bgg_id,
        name=name,
        deterministic_score=score,
        min_players=2,
        max_players=4,
        min_play_time=30,
        max_play_time=60,
        complexity=2.5,
        categories=[
            "Strategy",
        ],
        mechanics=[
            "Hand Management",
        ],
        deterministic_reasons=[
            "Best at 2 players",
        ],
    )


def test_fallback_returns_top_three():
    service = AiPickerService()

    candidates = [
        make_candidate(
            1,
            "Game One",
            95,
        ),
        make_candidate(
            2,
            "Game Two",
            90,
        ),
        make_candidate(
            3,
            "Game Three",
            85,
        ),
        make_candidate(
            4,
            "Game Four",
            80,
        ),
    ]

    result = service.rerank(
        candidates,
        mood=None,
    )

    assert result.used_ai is False

    assert [
        recommendation.bgg_id
        for recommendation
        in result.recommendations
    ] == [
        1,
        2,
        3,
    ]


def test_mood_without_provider_falls_back():
    service = AiPickerService()

    candidates = [
        make_candidate(
            1,
            "Game One",
            95,
        ),
    ]

    result = service.rerank(
        candidates,
        mood=(
            "Something interactive "
            "but not too heavy"
        ),
    )

    assert result.used_ai is False

    assert (
        result.fallback_reason
        == "AI provider not configured."
    )


def test_empty_candidates_return_empty_result():
    service = AiPickerService()

    result = service.rerank(
        [],
        mood="Something fun",
    )

    assert result.recommendations == []

    assert result.used_ai is False

def test_provider_can_rerank_candidates():
    class FakeProvider:
        def rerank(
            self,
            candidates,
            mood,
        ):
            from models.ai_picker import (
                AiPickerRecommendation,
            )

            return [
                AiPickerRecommendation(
                    bgg_id=2,
                    ai_rank=1,
                    explanation=(
                        "Best fit for "
                        "the requested mood."
                    ),
                )
            ]

    service = AiPickerService(
        provider=FakeProvider()
    )

    candidates = [
        make_candidate(
            1,
            "Game One",
            95,
        ),
        make_candidate(
            2,
            "Game Two",
            90,
        ),
    ]

    result = service.rerank(
        candidates,
        mood="Something relaxed",
    )

    assert result.used_ai is True

    assert (
        result.recommendations[
            0
        ].bgg_id
        == 2
    )


def test_provider_failure_uses_fallback():
    class BrokenProvider:
        def rerank(
            self,
            candidates,
            mood,
        ):
            raise RuntimeError(
                "Provider failed"
            )

    service = AiPickerService(
        provider=BrokenProvider()
    )

    candidates = [
        make_candidate(
            1,
            "Game One",
            95,
        )
    ]

    result = service.rerank(
        candidates,
        mood="Something relaxed",
    )

    assert result.used_ai is False

    assert (
        result.recommendations[
            0
        ].bgg_id
        == 1
    )