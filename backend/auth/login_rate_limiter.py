from collections import (
    defaultdict,
    deque,
)
from threading import Lock
import time


MAX_LOGIN_ATTEMPTS = 5
LOGIN_WINDOW_SECONDS = 15 * 60
MAX_AUTH_REQUESTS = 5
AUTH_REQUEST_WINDOW_SECONDS = 15 * 60


class LoginRateLimiter:
    def __init__(self):
        self._attempts: dict[
            str,
            deque[float],
        ] = defaultdict(deque)

        self._lock = Lock()


    def is_limited(
        self,
        key: str,
    ) -> bool:
        with self._lock:
            attempts = self._attempts[
                key
            ]

            self._prune(
                attempts
            )

            return (
                len(attempts)
                >= MAX_LOGIN_ATTEMPTS
            )


    def record_failure(
        self,
        key: str,
    ) -> None:
        with self._lock:
            attempts = self._attempts[
                key
            ]

            self._prune(
                attempts
            )

            attempts.append(
                time.monotonic()
            )


    def reset(
        self,
        key: str,
    ) -> None:
        with self._lock:
            self._attempts.pop(
                key,
                None,
            )


    def clear(
        self,
    ) -> None:
        with self._lock:
            self._attempts.clear()


    @staticmethod
    def _prune(
        attempts: deque[float],
    ) -> None:
        cutoff = (
            time.monotonic()
            - LOGIN_WINDOW_SECONDS
        )

        while (
            attempts
            and attempts[0]
            <= cutoff
        ):
            attempts.popleft()


login_rate_limiter = (
    LoginRateLimiter()
)


class AuthRequestRateLimiter:
    def __init__(self):
        self._requests: dict[
            str,
            deque[float],
        ] = defaultdict(deque)

        self._lock = Lock()


    def is_limited(
        self,
        key: str,
    ) -> bool:
        with self._lock:
            requests = self._requests[
                key
            ]

            self._prune(
                requests
            )

            return (
                len(requests)
                >= MAX_AUTH_REQUESTS
            )


    def record_request(
        self,
        key: str,
    ) -> None:
        with self._lock:
            requests = self._requests[
                key
            ]

            self._prune(
                requests
            )

            requests.append(
                time.monotonic()
            )


    def clear(
        self,
    ) -> None:
        with self._lock:
            self._requests.clear()


    @staticmethod
    def _prune(
        requests: deque[float],
    ) -> None:
        cutoff = (
            time.monotonic()
            - AUTH_REQUEST_WINDOW_SECONDS
        )

        while (
            requests
            and requests[0]
            <= cutoff
        ):
            requests.popleft()


verification_request_rate_limiter = (
    AuthRequestRateLimiter()
)

password_reset_request_rate_limiter = (
    AuthRequestRateLimiter()
)
