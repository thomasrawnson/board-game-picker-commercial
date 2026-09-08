from models.ai_picker import (
    AiPickerCandidate,
    AiPickerRecommendation,
    AiPickerResult,
)


class AiPickerService:
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

        #
        # External AI provider will be
        # plugged in here next.
        #
        return self._fallback(
            candidates,
            fallback_reason=(
                "AI provider not configured."
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