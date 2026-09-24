from collections import Counter
from dataclasses import replace

from bgg.client import BGGClient
from bgg.game_parser import parse_games_metadata
from repositories.game_repository import GameRepository
from repositories.play_repository import PlayRepository
from services.discover_sources import DiscoverCandidate, DiscoverCandidateProvider
from services.picker_service import PickerCriteria, PickerService


DISCOVER_MODES = {"hot", "top100", "for_you"}
TOP_RANKED_POSITION = 100


class DiscoverService:
    def __init__(
        self,
        repository: GameRepository,
        play_repository: PlayRepository,
        bgg_client: BGGClient,
        candidate_provider: DiscoverCandidateProvider,
        user_id: int,
    ):
        self.repository = repository
        self.play_repository = play_repository
        self.bgg_client = bgg_client
        self.candidate_provider = candidate_provider
        self.user_id = user_id

    def get_recommendations(self, mode: str = "hot", limit: int = 10) -> list[dict]:
        if mode not in DISCOVER_MODES:
            raise ValueError("Unknown Discover mode")

        owned_games = self.repository.get_owned_by_user(self.user_id)
        owned_bgg_ids = {game.bgg_id for game in owned_games}
        source_names = {
            "hot": {"hot"},
            "top100": {"ranked"},
            "for_you": {"hot", "ranked"},
        }[mode]
        source_candidates = self.candidate_provider.get_candidates(
            owned_bgg_ids,
            source_names=source_names,
            max_ranked_position=(
                TOP_RANKED_POSITION
                if mode == "top100"
                else None
            ),
        )[:30]
        candidates = self._load_metadata(source_candidates)
        wishlisted_ids = self.repository.get_wishlisted_bgg_ids(self.user_id)

        if mode != "for_you":
            return self._source_recommendations(
                candidates, source_candidates, wishlisted_ids, mode, limit
            )

        return self._personalized_recommendations(
            candidates,
            source_candidates,
            owned_games,
            wishlisted_ids,
            limit,
        )

    def _load_metadata(
        self,
        source_candidates: list[DiscoverCandidate],
    ) -> list:
        candidate_ids = [candidate.bgg_id for candidate in source_candidates]
        games = []

        for index in range(0, len(candidate_ids), 20):
            batch = candidate_ids[index:index + 20]
            if batch:
                games.extend(parse_games_metadata(self.bgg_client.get_games(batch)))

        game_by_id = {game.bgg_id: game for game in games}
        return [
            game_by_id[candidate.bgg_id]
            for candidate in source_candidates
            if candidate.bgg_id in game_by_id
        ]

    @staticmethod
    def _source_recommendations(
        games,
        source_candidates: list[DiscoverCandidate],
        wishlisted_ids: set[int],
        mode: str,
        limit: int,
    ) -> list[dict]:
        source_by_id = {candidate.bgg_id: candidate for candidate in source_candidates}
        results = []

        for game in games[:limit]:
            source = source_by_id[game.bgg_id]
            results.append({
                "game": game,
                "score": 0,
                "reasons": [
                    "Currently hot on BoardGameGeek"
                    if mode == "hot"
                    else "Highly ranked on BoardGameGeek"
                ],
                "wishlisted": game.bgg_id in wishlisted_ids,
                "source_rank": source.ranked_position,
                "section": None,
            })

        return results

    def _personalized_recommendations(
        self,
        games,
        source_candidates: list[DiscoverCandidate],
        owned_games,
        wishlisted_ids: set[int],
        limit: int,
    ) -> list[dict]:
        play_stats = self.play_repository.get_game_play_stats()
        profile = self.play_repository.get_discover_profile()
        typical_players = profile["typical_player_count"]
        typical_time = profile["typical_play_time"]
        source_by_id = {candidate.bgg_id: candidate for candidate in source_candidates}

        category_weights: Counter[str] = Counter()
        mechanic_weights: Counter[str] = Counter()
        for game in owned_games:
            history_weight = max(
                1,
                play_stats.get(game.bgg_id).play_count
                if game.bgg_id in play_stats
                else 1,
            )
            category_weights.update({category: history_weight for category in game.categories})
            mechanic_weights.update({mechanic: history_weight for mechanic in game.mechanics})

        if typical_players is not None:
            eligible_ids = {
                game.bgg_id
                for game in PickerService().find_matches(
                    [replace(game, owned=True) for game in games],
                    PickerCriteria(players=typical_players),
                )
            }
            games = [game for game in games if game.bgg_id in eligible_ids]

        recommendations = []
        for game in games:
            score = (game.rating or 0) / 2
            reasons: list[str] = []
            section = "Popular starting points"
            source = source_by_id[game.bgg_id]

            category_matches = [category for category in game.categories if category in category_weights]
            mechanic_matches = [mechanic for mechanic in game.mechanics if mechanic in mechanic_weights]
            if category_matches:
                best = max(category_matches, key=category_weights.get)
                score += category_weights[best]
                reasons.append(f"Matches {best} games on your shelf")
                section = "Matches your collection"
            if mechanic_matches:
                best = max(mechanic_matches, key=mechanic_weights.get)
                score += mechanic_weights[best] * 1.5
                reasons.append(f"Includes {best} from games on your shelf")
                section = "Matches your collection"

            if typical_time is not None and game.max_play_time is not None:
                if game.max_play_time <= typical_time:
                    score += 1.5
                    reasons.append(f"Fits your usual {typical_time}-minute session")
                    section = "Fits your usual session"

            if typical_players is not None:
                if typical_players in game.best_player_counts:
                    score += 4
                    reasons.append(f"Great at {typical_players} players")
                    section = "Great at your usual player count"
                elif typical_players in game.recommended_player_counts:
                    score += 2
                    reasons.append(f"Recommended at {typical_players} players")
                    section = "Great at your usual player count"

            if source.sources == {"hot", "ranked"}:
                score += 0.5
                reasons.append(
                    "Both currently hot and highly ranked on BoardGameGeek"
                )
            elif "hot" in source.sources:
                score += 0.3
                reasons.append("Currently hot on BoardGameGeek")
            elif "ranked" in source.sources:
                score += 0.2
                reasons.append("Highly ranked on BoardGameGeek")

            if not reasons:
                reasons.append("Popular on BoardGameGeek")

            recommendations.append({
                "game": game,
                "score": round(score, 2),
                "reasons": reasons,
                "wishlisted": game.bgg_id in wishlisted_ids,
                "source_rank": source.ranked_position,
                "section": section,
            })

        recommendations.sort(key=lambda item: (-item["score"], item["game"].name))
        return recommendations[:limit]
