import json
import os
from typing import Protocol

import httpx

from models.ai_picker import (
    AiPickerCandidate,
    AiPickerRecommendation,
)


class AiPickerProvider(Protocol):
    def rerank(
        self,
        candidates: list[
            AiPickerCandidate
        ],
        mood: str,
    ) -> list[
        AiPickerRecommendation
    ]:
        ...


class OllamaAiPickerProvider:
    def __init__(
        self,
        base_url: str,
        model: str,
    ):
        self.base_url = (
            base_url.rstrip("/")
        )
        self.model = model


    def rerank(
        self,
        candidates: list[
            AiPickerCandidate
        ],
        mood: str,
    ) -> list[
        AiPickerRecommendation
    ]:
        allowed_ids = {
            candidate.bgg_id
            for candidate
            in candidates
        }

        candidate_data = [
            {
                "bgg_id":
                    candidate.bgg_id,
                "name":
                    candidate.name,
                "score":
                    candidate
                    .deterministic_score,
                "players": [
                    candidate.min_players,
                    candidate.max_players,
                ],
                "play_time": [
                    candidate.min_play_time,
                    candidate.max_play_time,
                ],
                "complexity":
                    candidate.complexity,
                "categories":
                    candidate.categories,
                "mechanics":
                    candidate.mechanics,
                "reasons":
                    candidate
                    .deterministic_reasons,
            }
            for candidate
            in candidates
        ]

        prompt = (
            "You are reranking board games "
            "that have already passed strict "
            "deterministic filters.\n\n"
            "User mood:\n"
            f"{mood}\n\n"
            "Candidates:\n"
            f"{json.dumps(candidate_data)}\n\n"
            "Choose the best 3 candidates "
            "for the user's mood. "
            "Never invent another game. "
            "Only return bgg_id values "
            "from the candidates provided. "
            "Give one concise explanation "
            "for each choice.\n\n"
            "Return JSON only in this form:\n"
            "{"
            "\"recommendations\": ["
            "{"
            "\"bgg_id\": 123,"
            "\"explanation\": \"Reason\""
            "}"
            "]"
            "}"
        )

        response = httpx.post(
            (
                f"{self.base_url}"
                "/api/chat"
            ),
            json={
                "model": self.model,
                "stream": False,
                "format": "json",
                "messages": [
                    {
                        "role": "user",
                        "content": prompt,
                    }
                ],
            },
            timeout=float(
                os.getenv(
                    "AI_PICKER_TIMEOUT_SECONDS",
                    "180",
                )
            ),
        )

        response.raise_for_status()

        payload = response.json()

        content = (
            payload["message"][
                "content"
            ]
        )

        parsed = json.loads(
            content
        )

        recommendations = []

        seen_ids: set[int] = set()

        for item in (
            parsed.get(
                "recommendations",
                []
            )
        ):
            try:
                bgg_id = int(
                    item["bgg_id"]
                )
            except (
                KeyError,
                TypeError,
                ValueError,
            ):
                continue

            if (
                bgg_id
                not in allowed_ids
                or bgg_id
                in seen_ids
            ):
                continue

            explanation = str(
                item.get(
                    "explanation",
                    "",
                )
            ).strip()

            if not explanation:
                continue

            seen_ids.add(
                bgg_id
            )

            recommendations.append(
                AiPickerRecommendation(
                    bgg_id=bgg_id,
                    ai_rank=(
                        len(
                            recommendations
                        )
                        + 1
                    ),
                    explanation=(
                        explanation
                    ),
                )
            )

            if (
                len(recommendations)
                == 3
            ):
                break

        if not recommendations:
            raise ValueError(
                "AI provider returned "
                "no valid recommendations."
            )

        return recommendations


def build_ai_picker_provider(
) -> AiPickerProvider | None:
    provider = (
        os.getenv(
            "AI_PICKER_PROVIDER",
            "",
        )
        .strip()
        .lower()
    )

    if provider != "ollama":
        return None

    return OllamaAiPickerProvider(
        base_url=os.getenv(
            "OLLAMA_BASE_URL",
            "http://127.0.0.1:11434",
        ),
        model=os.getenv(
            "OLLAMA_MODEL",
            "llama3.2:3b",
        ),
    )