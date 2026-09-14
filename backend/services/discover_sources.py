import logging
import time
from collections.abc import Callable
from dataclasses import dataclass, field
from threading import Lock
from typing import Protocol

from bgg.client import (
    BGGClient,
    BGGSourceUnavailableError,
)
from bgg.hot_parser import parse_hot_game_ids
from bgg.ranked_parser import parse_ranked_game_ids


logger = logging.getLogger(
    "boardgamepicker.discover"
)

RANKED_PAGE_COUNT = 5
RANKED_CACHE_TTL_SECONDS = 24 * 60 * 60
RANKED_UNAVAILABLE_COOLDOWN_SECONDS = 60 * 60


@dataclass
class DiscoverCandidate:
    bgg_id: int
    sources: set[str] = field(
        default_factory=set
    )
    ranked_position: int | None = None


class DiscoverCandidateSource(Protocol):
    name: str

    def get_candidates(
        self,
    ) -> list[DiscoverCandidate]:
        ...


class RankedCandidateCache:
    def __init__(
        self,
        ttl_seconds: float = (
            RANKED_CACHE_TTL_SECONDS
        ),
        unavailable_cooldown_seconds: float = (
            RANKED_UNAVAILABLE_COOLDOWN_SECONDS
        ),
        clock: Callable[[], float] = (
            time.monotonic
        ),
    ):
        self.ttl_seconds = ttl_seconds
        self.unavailable_cooldown_seconds = (
            unavailable_cooldown_seconds
        )
        self.clock = clock
        self._game_ids: list[int] | None = None
        self._expires_at = 0.0
        self._unavailable_until = 0.0
        self._lock = Lock()

    def get(self) -> list[int] | None:
        with self._lock:
            if (
                self._game_ids is None
                or self.clock()
                >= self._expires_at
            ):
                return None

            return list(self._game_ids)

    def set(self, game_ids: list[int]) -> None:
        with self._lock:
            self._game_ids = list(game_ids)
            self._expires_at = (
                self.clock()
                + self.ttl_seconds
            )
            self._unavailable_until = 0.0

    def is_unavailable(self) -> bool:
        with self._lock:
            return (
                self.clock()
                < self._unavailable_until
            )

    def mark_unavailable(self) -> None:
        with self._lock:
            self._unavailable_until = (
                self.clock()
                + self.unavailable_cooldown_seconds
            )

    def clear(self) -> None:
        with self._lock:
            self._game_ids = None
            self._expires_at = 0.0
            self._unavailable_until = 0.0


ranked_candidate_cache = RankedCandidateCache()


class HotDiscoverSource:
    name = "hot"

    def __init__(self, bgg_client: BGGClient):
        self.bgg_client = bgg_client

    def get_candidates(
        self,
    ) -> list[DiscoverCandidate]:
        return [
            DiscoverCandidate(
                bgg_id=bgg_id,
                sources={self.name},
            )
            for bgg_id in parse_hot_game_ids(
                self.bgg_client.get_hot_games()
            )
        ]


class RankedDiscoverSource:
    name = "ranked"

    def __init__(
        self,
        bgg_client: BGGClient,
        cache: RankedCandidateCache = (
            ranked_candidate_cache
        ),
    ):
        self.bgg_client = bgg_client
        self.cache = cache

    def get_candidates(
        self,
    ) -> list[DiscoverCandidate]:
        game_ids = self.cache.get()

        if game_ids is None:
            if self.cache.is_unavailable():
                return []

            game_ids = []

            try:
                for page in range(
                    1,
                    RANKED_PAGE_COUNT + 1,
                ):
                    html = (
                        self.bgg_client
                        .get_ranked_games_page(page)
                    )
                    game_ids.extend(
                        parse_ranked_game_ids(html)
                    )
            except BGGSourceUnavailableError:
                self.cache.mark_unavailable()
                raise

            game_ids = list(
                dict.fromkeys(game_ids)
            )[:500]

            if not game_ids:
                raise ValueError(
                    "BGG ranked list was empty"
                )

            self.cache.set(game_ids)

        return [
            DiscoverCandidate(
                bgg_id=bgg_id,
                sources={self.name},
                ranked_position=index,
            )
            for index, bgg_id in enumerate(
                game_ids,
                start=1,
            )
        ]


class DiscoverCandidateProvider:
    def __init__(
        self,
        sources: list[DiscoverCandidateSource],
    ):
        self.sources = sources

    def get_candidates(
        self,
        owned_bgg_ids: set[int],
    ) -> list[DiscoverCandidate]:
        source_results = []

        for source in self.sources:
            try:
                source_results.append(
                    source.get_candidates()
                )
            except BGGSourceUnavailableError as exc:
                logger.warning(
                    "discover_source_unavailable "
                    "source=%s status=%s "
                    "fallback=continuing_with_"
                    "available_sources",
                    exc.source,
                    exc.status_code,
                )
            except Exception:
                logger.exception(
                    "discover_source_failed source=%s",
                    source.name,
                )

        merged: dict[int, DiscoverCandidate] = {}
        ordered_ids: list[int] = []
        max_length = max(
            (
                len(result)
                for result in source_results
            ),
            default=0,
        )

        for index in range(max_length):
            for result in source_results:
                if index >= len(result):
                    continue

                candidate = result[index]

                if candidate.bgg_id in owned_bgg_ids:
                    continue

                existing = merged.get(
                    candidate.bgg_id
                )

                if existing is None:
                    merged[candidate.bgg_id] = (
                        DiscoverCandidate(
                            bgg_id=candidate.bgg_id,
                            sources=set(
                                candidate.sources
                            ),
                            ranked_position=(
                                candidate.ranked_position
                            ),
                        )
                    )
                    ordered_ids.append(
                        candidate.bgg_id
                    )
                    continue

                existing.sources.update(
                    candidate.sources
                )

                if candidate.ranked_position:
                    existing.ranked_position = (
                        candidate.ranked_position
                    )

        return [
            merged[bgg_id]
            for bgg_id in ordered_ids
        ]
