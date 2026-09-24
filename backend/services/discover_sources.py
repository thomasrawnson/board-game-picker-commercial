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
DISCOVER_CACHE_TTL_SECONDS = 24 * 60 * 60
DISCOVER_UNAVAILABLE_COOLDOWN_SECONDS = 60 * 60
RANKED_CACHE_TTL_SECONDS = DISCOVER_CACHE_TTL_SECONDS
RANKED_UNAVAILABLE_COOLDOWN_SECONDS = DISCOVER_UNAVAILABLE_COOLDOWN_SECONDS


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
        self._unavailable_status_code: int | None = None
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

    def get_stale(self) -> list[int] | None:
        with self._lock:
            if self._game_ids is None:
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
            self._unavailable_status_code = None

    def is_unavailable(self) -> bool:
        with self._lock:
            return (
                self.clock()
                < self._unavailable_until
            )

    def unavailable_status_code(self) -> int | None:
        with self._lock:
            if self.clock() >= self._unavailable_until:
                return None

            return self._unavailable_status_code

    def mark_unavailable(
        self,
        status_code: int,
    ) -> None:
        with self._lock:
            self._unavailable_until = (
                self.clock()
                + self.unavailable_cooldown_seconds
            )
            self._unavailable_status_code = status_code

    def clear(self) -> None:
        with self._lock:
            self._game_ids = None
            self._expires_at = 0.0
            self._unavailable_until = 0.0
            self._unavailable_status_code = None


ranked_candidate_cache = RankedCandidateCache()
hot_candidate_cache = RankedCandidateCache()


class HotDiscoverSource:
    name = "hot"

    def __init__(
        self,
        bgg_client: BGGClient,
        cache: RankedCandidateCache = (
            hot_candidate_cache
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
                stale_ids = self.cache.get_stale()

                if stale_ids is not None:
                    game_ids = stale_ids
                else:
                    raise BGGSourceUnavailableError(
                        source=self.name,
                        status_code=(
                            self.cache
                            .unavailable_status_code()
                            or 503
                        ),
                        cooldown_active=True,
                    )
            else:
                try:
                    fresh_game_ids = parse_hot_game_ids(
                        self.bgg_client.get_hot_games()
                    )
                except BGGSourceUnavailableError as exc:
                    self.cache.mark_unavailable(
                        exc.status_code
                    )
                    stale_ids = self.cache.get_stale()

                    if stale_ids is None:
                        raise

                    game_ids = stale_ids
                else:
                    if not fresh_game_ids:
                        raise ValueError(
                            "BGG hot list was empty"
                        )

                    self.cache.set(fresh_game_ids)
                    game_ids = fresh_game_ids

        return [
            DiscoverCandidate(
                bgg_id=bgg_id,
                sources={self.name},
            )
            for bgg_id in game_ids
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
                stale_ids = self.cache.get_stale()

                if stale_ids is not None:
                    game_ids = stale_ids
                else:
                    raise BGGSourceUnavailableError(
                        source=self.name,
                        status_code=(
                            self.cache
                            .unavailable_status_code()
                            or 503
                        ),
                        cooldown_active=True,
                    )

        if game_ids is None:
            fresh_game_ids = []

            try:
                for page in range(
                    1,
                    RANKED_PAGE_COUNT + 1,
                ):
                    html = (
                        self.bgg_client
                        .get_ranked_games_page(page)
                    )
                    fresh_game_ids.extend(
                        parse_ranked_game_ids(html)
                    )
            except BGGSourceUnavailableError as exc:
                self.cache.mark_unavailable(
                    exc.status_code
                )
                stale_ids = self.cache.get_stale()

                if stale_ids is None:
                    raise

                game_ids = stale_ids

            if game_ids is None:
                game_ids = list(
                    dict.fromkeys(fresh_game_ids)
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
        source_names: set[str] | None = None,
        max_ranked_position: int | None = None,
    ) -> list[DiscoverCandidate]:
        source_results = []
        unavailable_errors: list[
            BGGSourceUnavailableError
        ] = []
        source_errors: list[Exception] = []

        for source in self.sources:
            if source_names is not None and source.name not in source_names:
                continue

            try:
                source_results.append(
                    source.get_candidates()
                )
            except BGGSourceUnavailableError as exc:
                unavailable_errors.append(exc)
                if not exc.cooldown_active:
                    logger.warning(
                        "discover_source_unavailable "
                        "source=%s status=%s "
                        "fallback=continuing_with_"
                        "available_sources",
                        exc.source,
                        exc.status_code,
                    )
            except Exception as exc:
                source_errors.append(exc)
                logger.exception(
                    "discover_source_failed source=%s",
                    source.name,
                )

        if not source_results and unavailable_errors:
            raise unavailable_errors[0]

        if not source_results and source_errors:
            raise source_errors[0]

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

                if max_ranked_position is not None:
                    ranked_position = (
                        candidate.ranked_position
                    )

                    if (
                        type(ranked_position) is not int
                        or not 1
                        <= ranked_position
                        <= max_ranked_position
                    ):
                        continue

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
