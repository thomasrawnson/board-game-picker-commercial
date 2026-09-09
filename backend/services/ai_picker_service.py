from models.ai_picker import (
    AiPickerCandidate,
    AiPickerRecommendation,
    AiPickerResult,
)
from services.ai_picker_provider import (
    AiPickerProvider,
)


class AiPickerService:
    def __init__(
        self,
        provider:
            AiPickerProvider | None = None,
    ):
        self.provider = provider


    def rerank(
        self,
        candidates: list[
            AiPickerCandidate
        ],
        mood: str | None,
    ) -> AiPickerResult:
        if not candidates:
            return AiPickerResult(
                recommendations=[],
                used_ai=False,
                fallback_reason=(
                    "No candidates available."
                ),
            )

        if (
            mood is None
            or not mood.strip()
        ):
            return self._fallback(
                candidates
            )

        if self.provider is None:
            return self._fallback(
                candidates,
                fallback_reason=(
                    "AI provider not configured."
                ),
            )

        try:
            recommendations = (
                self.provider.rerank(
                    candidates,
                    mood.strip(),
                )
            )

            return AiPickerResult(
                recommendations=(
                    recommendations
                ),
                used_ai=True,
            )

        except Exception as exc:
            print(
                "AI picker error:",
                repr(exc),
            )

            return self._fallback(
                candidates,
                fallback_reason=(
                    "AI reranking unavailable."
                ),
            )


    @staticmethod
    def _fallback(
        candidates: list[
            AiPickerCandidate
        ],
        fallback_reason:
            str | None = None,
    ) -> AiPickerResult:
        recommendations = [
            AiPickerRecommendation(
                bgg_id=(
                    candidate.bgg_id
                ),
                ai_rank=index + 1,
                explanation=(
                    candidate
                    .deterministic_reasons[0]
                    if candidate
                    .deterministic_reasons
                    else (
                        "Strong match for "
                        "tonight's filters."
                    )
                ),
            )
            for index, candidate
            in enumerate(
                candidates[:3]
            )
        ]

        return AiPickerResult(
            recommendations=(
                recommendations
            ),
            used_ai=False,
            fallback_reason=(
                fallback_reason
            ),
        )