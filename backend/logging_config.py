import logging
import sys

from config import settings


def configure_logging() -> None:
    level = (
        logging.INFO
        if settings.environment
        == "production"
        else logging.DEBUG
    )

    logging.basicConfig(
        level=level,
        format=(
            "%(asctime)s "
            "%(levelname)s "
            "%(name)s "
            "%(message)s"
        ),
        handlers=[
            logging.StreamHandler(
                sys.stdout
            )
        ],
        force=True,
    )