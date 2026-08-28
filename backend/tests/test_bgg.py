import httpx

from bgg.client import BGGClient


def test_bgg_client_can_be_created():
    client = BGGClient()

    assert client.timeout == 30.0
    assert client.max_retries == 10


def test_get_game_requests_correct_bgg_endpoint(
    monkeypatch,
):
    requested = {}

    def mock_get(
        url,
        params,
        headers,
        timeout,
    ):
        requested["url"] = url
        requested["params"] = params
        requested["headers"] = headers
        requested["timeout"] = timeout

        request = httpx.Request(
            "GET",
            url,
        )

        return httpx.Response(
            200,
            request=request,
            text=(
                "<items>"
                "<item id='174430'/>"
                "</items>"
            ),
        )

    monkeypatch.setattr(
        httpx,
        "get",
        mock_get,
    )

    client = BGGClient()

    xml = client.get_game(174430)

    assert xml == (
        "<items>"
        "<item id='174430'/>"
        "</items>"
    )

    assert requested["url"] == (
        "https://boardgamegeek.com/"
        "xmlapi2/thing"
    )

    assert requested["params"] == {
        "id": 174430,
        "stats": 1,
    }

    assert requested["timeout"] == 30.0

    assert isinstance(
        requested["headers"],
        dict,
    )


def test_get_game_retries_when_bgg_returns_202(
    monkeypatch,
):
    calls = []

    def mock_get(
        url,
        params,
        headers,
        timeout,
    ):
        calls.append(url)

        request = httpx.Request(
            "GET",
            url,
        )

        if len(calls) == 1:
            return httpx.Response(
                202,
                request=request,
            )

        return httpx.Response(
            200,
            request=request,
            text=(
                "<items>"
                "<item id='174430'/>"
                "</items>"
            ),
        )

    monkeypatch.setattr(
        httpx,
        "get",
        mock_get,
    )

    client = BGGClient(
        retry_delay=0,
        max_retries=3,
    )

    xml = client.get_game(174430)

    assert xml == (
        "<items>"
        "<item id='174430'/>"
        "</items>"
    )

    assert len(calls) == 2


def test_get_game_retries_when_rate_limited(
    monkeypatch,
):
    calls = []

    def mock_get(
        url,
        params,
        headers,
        timeout,
    ):
        calls.append(url)

        request = httpx.Request(
            "GET",
            url,
        )

        if len(calls) == 1:
            return httpx.Response(
                429,
                request=request,
            )

        return httpx.Response(
            200,
            request=request,
            text=(
                "<items>"
                "<item id='174430'/>"
                "</items>"
            ),
        )

    monkeypatch.setattr(
        httpx,
        "get",
        mock_get,
    )

    client = BGGClient(
        retry_delay=0,
        max_retries=3,
    )

    monkeypatch.setattr(
        "bgg.client.time.sleep",
        lambda _: None,
    )

    xml = client.get_game(174430)

    assert xml == (
        "<items>"
        "<item id='174430'/>"
        "</items>"
    )

    assert len(calls) == 2