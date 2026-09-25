from sqlalchemy.orm import (
    declarative_base,
    sessionmaker,
)

from config import settings
from database.url import create_database_engine


engine = create_database_engine(
    settings.database_url,
    pool_pre_ping=True,
)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
)

Base = declarative_base()


def get_db():
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()
