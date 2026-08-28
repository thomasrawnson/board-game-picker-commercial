import os
import time

import httpx
from dotenv import load_dotenv


load_dotenv()


class BGGClient:
    BASE_URL = "https://boardgamegeek.com/xmlapi2"

    def __init__(
        self,
        timeout: float = 30.0,
        retry_delay: float = 5.0,
        max_retries: int = 10,
    ):
        self.timeout = timeout
        self.retry_delay = retry_delay
        self.max_retries = max_retries

        self.api_token = os.getenv(
            "BGG_API_TOKEN"
        )

        self.headers = {}

        if self.api_token:
            self.headers[
                "Authorization"
            ] = f"Bearer {self.api_token}"

    def get_collection(
        self,
        username: str,
    ) -> str:
        url = f"{self.BASE_URL}/collection"

        params = {
            "username": username,
            "own": 1,
        }

        return self._get(
            url,
            params,
            "BGG collection request",
        )

    def get_game(
        self,
        bgg_id: int,
    ) -> str:
        url = f"{self.BASE_URL}/thing"

        params = {
            "id": bgg_id,
            "stats": 1,
        }

        return self._get(
            url,
            params,
            "BGG game request",
        )

    def _get(
        self,
        url: str,
        params: dict,
        description: str,
    ) -> str:
        for attempt in range(
            self.max_retries
        ):
            response = httpx.get(
                url,
                params=params,
                headers=self.headers,
                timeout=self.timeout,
            )

            if response.status_code == 202:
                if (
                    attempt
                    == self.max_retries - 1
                ):
                    raise RuntimeError(
                        f"{description} remained "
                        "queued after maximum "
                        "retries"
                    )

                time.sleep(
                    self.retry_delay
                )
                continue

            if response.status_code == 429:
                if (
                    attempt
                    == self.max_retries - 1
                ):
                    raise RuntimeError(
                        "BGG rate limit exceeded "
                        "after maximum retries"
                    )

                retry_after = (
                    response.headers.get(
                        "Retry-After"
                    )
                )

                if retry_after:
                    wait_seconds = float(
                        retry_after
                    )
                else:
                    wait_seconds = (
                        10 * (attempt + 1)
                    )

                print(
                    "BGG rate limit reached. "
                    f"Waiting "
                    f"{wait_seconds:.0f}s..."
                )

                time.sleep(wait_seconds)
                continue

            response.raise_for_status()

            return response.text

        raise RuntimeError(
            f"Unable to complete "
            f"{description}"
        )