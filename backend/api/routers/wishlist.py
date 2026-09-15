import xml.etree.ElementTree as ET

import httpx
from fastapi import APIRouter, Depends, HTTPException

from api.dependencies import get_wishlist_service
from services.wishlist_service import (
    WishlistGameNotFoundError,
    WishlistService,
)


router = APIRouter(
    prefix="/wishlist",
    tags=["wishlist"],
)


@router.get("")
def list_wishlist(
    service: WishlistService = Depends(
        get_wishlist_service
    ),
):
    return service.list_games()


@router.post("/{bgg_id}")
def add_to_wishlist(
    bgg_id: int,
    service: WishlistService = Depends(
        get_wishlist_service
    ),
):
    try:
        return service.add_game(bgg_id)
    except ValueError as exc:
        raise HTTPException(
            status_code=400,
            detail=str(exc),
        ) from exc
    except httpx.TimeoutException as exc:
        raise HTTPException(
            status_code=504,
            detail=(
                "BoardGameGeek took too long "
                "to respond. Please try again."
            ),
        ) from exc
    except (
        httpx.HTTPStatusError,
        RuntimeError,
        ET.ParseError,
    ) as exc:
        raise HTTPException(
            status_code=502,
            detail=(
                "Couldn't add that game "
                "from BoardGameGeek."
            ),
        ) from exc


@router.get("/{bgg_id}")
def get_wishlist_game(
    bgg_id: int,
    service: WishlistService = Depends(
        get_wishlist_service
    ),
):
    try:
        return service.get_game(bgg_id)
    except WishlistGameNotFoundError as exc:
        raise HTTPException(
            status_code=404,
            detail="Wishlist game not found",
        ) from exc


@router.post("/{bgg_id}/move-to-collection")
def move_wishlist_game_to_collection(
    bgg_id: int,
    service: WishlistService = Depends(
        get_wishlist_service
    ),
):
    try:
        return service.move_to_collection(bgg_id)
    except WishlistGameNotFoundError as exc:
        raise HTTPException(
            status_code=404,
            detail="Wishlist game not found",
        ) from exc


@router.delete("/{bgg_id}")
def remove_from_wishlist(
    bgg_id: int,
    service: WishlistService = Depends(
        get_wishlist_service
    ),
):
    service.remove_game(bgg_id)

    return {
        "message": "Game removed from wishlist"
    }
