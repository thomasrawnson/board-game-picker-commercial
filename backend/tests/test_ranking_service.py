from unittest.mock import Mock

import pytest

from services.ranking_service import RankingService


def test_choose_records_two_different_games():
    repository = Mock()
    repository.record_comparison.return_value = {
        "winner": {"bgg_id": 1},
        "loser": {"bgg_id": 2},
    }
    service = RankingService(repository)

    result = service.choose(1, 2)

    assert result["winner"]["bgg_id"] == 1
    repository.record_comparison.assert_called_once_with(
        1,
        2,
    )


def test_played_only_filter_is_forwarded():
    repository = Mock()
    repository.get_matchup.return_value = []
    repository.get_rankings.return_value = {
        "rankings": [],
        "unplayed": [],
    }
    service = RankingService(repository)

    service.get_matchup([1], played_only=False)
    service.get_rankings(
        played_only=False,
        summary_limit=50,
    )

    repository.get_matchup.assert_called_once_with(
        [1],
        False,
    )
    repository.get_rankings.assert_called_once_with(
        False,
        50,
    )


def test_choose_rejects_same_game():
    service = RankingService(Mock())

    with pytest.raises(
        ValueError,
        match="two different games",
    ):
        service.choose(1, 1)


def test_choose_rejects_ineligible_game():
    repository = Mock()
    repository.record_comparison.return_value = None
    service = RankingService(repository)

    with pytest.raises(
        ValueError,
        match="eligible owned games",
    ):
        service.choose(1, 2)
