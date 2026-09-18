import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type Dispatch,
  type RefObject,
  type SetStateAction,
} from "react"

import AddGameSearch
  from "./collection/AddGameSearch"

import {
  getCollectionStats,
  getGameHistory,
  getGames,
  removeFromCollection,
  type CollectionGameStats,
  type Game,
  type GameHistory,
} from "../api/client"

import CollectionFilters, {
  type PlayFilter,
  type SortOption,
} from "./collection/CollectionFilters"

import CollectionGameList
  from "./collection/CollectionGameList"

import GameDetail
  from "./collection/GameDetail"

import WishlistView
  from "./WishlistView"

import SegmentedControl
  from "./ui/SegmentedControl"

export type CollectionSection =
  | "owned"
  | "wishlist"

export type CollectionScrollPositions =
  Record<CollectionSection, number>

export type CollectionUiState = {
  section: CollectionSection
  search: string
  sort: SortOption
  playFilter: PlayFilter
}

type Props = {
  uiState: CollectionUiState
  onUiStateChange: Dispatch<
    SetStateAction<CollectionUiState>
  >
  scrollContainerRef:
    RefObject<HTMLElement | null>
  scrollPositionsRef:
    RefObject<CollectionScrollPositions>
  gameBggId:
    number | null
  wishlistGameBggId:
    number | null
  onOpenGame: (
    bggId: number,
  ) => void
  onCloseGame:
    () => void
  onGameUnavailable:
    () => void
  onOpenWishlistGame: (
    bggId: number,
  ) => void
  onCloseWishlistGame:
    () => void
  onWishlistGameUnavailable:
    () => void
  onWishlistGameConverted: (
    bggId: number,
  ) => void
  onSectionChange: (
    section: CollectionSection,
  ) => void
}


function CollectionView({
  uiState,
  onUiStateChange,
  scrollContainerRef,
  scrollPositionsRef,
  gameBggId,
  wishlistGameBggId,
  onOpenGame,
  onCloseGame,
  onGameUnavailable,
  onOpenWishlistGame,
  onCloseWishlistGame,
  onWishlistGameUnavailable,
  onWishlistGameConverted,
  onSectionChange,
}: Props) {
  const {
    section,
    search,
    sort,
    playFilter,
  } = uiState

  const [
    games,
    setGames,
  ] = useState<Game[]>([])

  const [
    collectionStats,
    setCollectionStats,
  ] = useState<
    CollectionGameStats[]
  >([])

  const [
    gameHistory,
    setGameHistory,
  ] = useState<
    GameHistory | null
  >(null)

  const [
    historyLoading,
    setHistoryLoading,
  ] = useState(true)

  const [
    loading,
    setLoading,
  ] = useState(true)

  const [
    error,
    setError,
  ] = useState("")

  const [
    addingGame,
    setAddingGame,
  ] = useState(false)

  const pendingScrollRestore =
    useRef(true)

  const previousSection =
    useRef(section)

  const previousGameBggId =
    useRef(gameBggId)

  const previousWishlistGameBggId =
    useRef(wishlistGameBggId)

  const selectedGame =
    gameBggId === null
      ? null
      : games.find(
          (game) =>
            game.bgg_id
            === gameBggId,
        ) ?? null

  const selectedGameHistory =
    selectedGame
    && gameHistory?.bgg_id
      === selectedGame.bgg_id
      ? gameHistory
      : null

  const selectedGameHistoryLoading =
    historyLoading
    || (
      gameHistory !== null
      && selectedGameHistory === null
    )


  useLayoutEffect(() => {
    if (
      previousSection.current
      === section
    ) {
      return
    }

    previousSection.current = section
    pendingScrollRestore.current = true
  }, [section])


  useLayoutEffect(() => {
    if (
      previousGameBggId.current
      !== null
      && gameBggId === null
    ) {
      pendingScrollRestore.current = true
    }

    previousGameBggId.current =
      gameBggId
  }, [gameBggId])

  useLayoutEffect(() => {
    if (
      previousWishlistGameBggId.current
      !== null
      && wishlistGameBggId === null
    ) {
      pendingScrollRestore.current = true
    }

    previousWishlistGameBggId.current =
      wishlistGameBggId
  }, [wishlistGameBggId])

  const saveScrollPosition =
    useCallback(() => {
      const scrollContainer =
        scrollContainerRef.current

      if (scrollContainer) {
        scrollPositionsRef.current[
          section
        ] = scrollContainer.scrollTop
      }
    }, [
      scrollContainerRef,
      scrollPositionsRef,
      section,
    ])

  const restoreScrollPosition =
    useCallback((
      targetSection: CollectionSection,
    ) => {
      if (
        !pendingScrollRestore.current
        || section !== targetSection
      ) {
        return
      }

      const scrollContainer =
        scrollContainerRef.current

      if (!scrollContainer) {
        return
      }

      scrollContainer.scrollTo({
        top:
          scrollPositionsRef.current[
            targetSection
          ],
        behavior: "instant",
      })

      pendingScrollRestore.current =
        false
    }, [
      scrollContainerRef,
      scrollPositionsRef,
      section,
    ])

  function changeSection(
    nextSection: CollectionSection,
  ) {
    if (nextSection === section) {
      return
    }

    saveScrollPosition()
    pendingScrollRestore.current = true

    onUiStateChange(
      (current) => ({
        ...current,
        section: nextSection,
      }),
    )

    onSectionChange(nextSection)
  }

  const sectionTabs = (
    <SegmentedControl
      value={section}
      ariaLabel="Collection section"
      className="collection-section-tabs"
      options={[
        { value: "owned", label: "Owned" },
        { value: "wishlist", label: "Want to Play" },
      ]}
      onChange={
        changeSection
      }
    />
  )


  useEffect(() => {
    async function loadGames() {
      try {
        const [
          gamesResult,
          statsResult,
        ] = await Promise.all([
          getGames(),
          getCollectionStats(),
        ])

        setGames(
          gamesResult.filter(
            (game) =>
              game.owned,
          ),
        )

        setCollectionStats(
          statsResult,
        )
      } catch (err) {
        console.error(err)

        setError(
          "Couldn't load your collection.",
        )
      } finally {
        setLoading(false)
      }
    }

    loadGames()
  }, [])


  useLayoutEffect(() => {
    if (
      selectedGame
      || wishlistGameBggId !== null
    ) {
      return
    }

    const scrollContainer =
      scrollContainerRef.current

    if (!scrollContainer) {
      return
    }

    scrollContainer.addEventListener(
      "scroll",
      saveScrollPosition,
      { passive: true },
    )

    return () => {
      scrollContainer.removeEventListener(
        "scroll",
        saveScrollPosition,
      )
    }
  }, [
    saveScrollPosition,
    scrollContainerRef,
    selectedGame,
    wishlistGameBggId,
  ])


  useLayoutEffect(() => {
    if (
      !selectedGame
      && wishlistGameBggId === null
    ) {
      return
    }

    scrollContainerRef.current?.scrollTo({
      top: 0,
      behavior: "instant",
    })
  }, [
    scrollContainerRef,
    selectedGame,
    wishlistGameBggId,
  ])


  useEffect(() => {
    if (
      gameBggId === null
      || loading
      || selectedGame
    ) {
      return
    }

    onGameUnavailable()
  }, [
    gameBggId,
    loading,
    onGameUnavailable,
    selectedGame,
  ])


  async function refreshHistory(
    game: Game,
  ) {
    try {
      const history =
        await getGameHistory(
          game.bgg_id,
        )

      setGameHistory(
        history,
      )

      setCollectionStats(
        (current) => {
          const updated = {
            bgg_id:
              game.bgg_id,
            play_count:
              history.play_count,
            last_played_at:
              history.last_played_at,
          }

          const exists =
            current.some(
              (stats) =>
                stats.bgg_id
                === game.bgg_id,
            )

          if (!exists) {
            return [
              ...current,
              updated,
            ]
          }

          return current.map(
            (stats) =>
              stats.bgg_id
              === game.bgg_id
                ? updated
                : stats,
          )
        },
      )
    } catch (err) {
      console.error(err)

      setGameHistory(null)
    } finally {
      setHistoryLoading(false)
    }
  }


  useEffect(() => {
    if (!selectedGame) {
      return
    }

    let active = true

    getGameHistory(
      selectedGame.bgg_id,
    )
      .then((history) => {
        if (!active) {
          return
        }

        setGameHistory(history)

        setCollectionStats(
          (current) => {
            const updated = {
              bgg_id:
                selectedGame.bgg_id,
              play_count:
                history.play_count,
              last_played_at:
                history.last_played_at,
            }

            const exists =
              current.some(
                (stats) =>
                  stats.bgg_id
                  === selectedGame.bgg_id,
              )

            if (!exists) {
              return [
                ...current,
                updated,
              ]
            }

            return current.map(
              (stats) =>
                stats.bgg_id
                === selectedGame.bgg_id
                  ? updated
                  : stats,
            )
          },
        )
      })
      .catch((err) => {
        if (!active) {
          return
        }

        console.error(err)
        setGameHistory(null)
      })
      .finally(() => {
        if (active) {
          setHistoryLoading(false)
        }
      })

    return () => {
      active = false
    }
  }, [
    selectedGame,
  ])


  const statsByGame =
    useMemo(
      () =>
        new Map(
          collectionStats.map(
            (stats) => [
              stats.bgg_id,
              stats,
            ],
          ),
        ),
      [
        collectionStats,
      ],
    )


  const filteredGames =
    useMemo(() => {
      const query =
        search
          .trim()
          .toLowerCase()

      const results =
        games.filter(
          (game) => {
            const stats =
              statsByGame.get(
                game.bgg_id,
              )

            const playCount =
              stats?.play_count
              ?? 0

            if (
              playFilter
                === "played"
              && playCount
                === 0
            ) {
              return false
            }

            if (
              playFilter
                === "never"
              && playCount
                > 0
            ) {
              return false
            }

            if (!query) {
              return true
            }

            return [
              game.name,
              ...game.categories,
              ...game.mechanics,
            ]
              .join(" ")
              .toLowerCase()
              .includes(
                query,
              )
          },
        )

      return [
        ...results,
      ].sort(
        (a, b) => {
          const aStats =
            statsByGame.get(
              a.bgg_id,
            )

          const bStats =
            statsByGame.get(
              b.bgg_id,
            )

          if (
            sort
            === "recent"
          ) {
            const aDate =
              aStats
                ?.last_played_at
                ? new Date(
                    aStats
                      .last_played_at,
                  ).getTime()
                : 0

            const bDate =
              bStats
                ?.last_played_at
                ? new Date(
                    bStats
                      .last_played_at,
                  ).getTime()
                : 0

            return (
              bDate - aDate
            )
          }

          if (
            sort
            === "most-played"
          ) {
            return (
              (
                bStats
                  ?.play_count
                ?? 0
              )
              -
              (
                aStats
                  ?.play_count
                ?? 0
              )
            )
          }

          if (
            sort
            === "rating"
          ) {
            return (
              (
                b.rating
                ?? -1
              )
              -
              (
                a.rating
                ?? -1
              )
            )
          }

          if (
            sort
            === "complexity"
          ) {
            return (
              (
                b.complexity
                ?? -1
              )
              -
              (
                a.complexity
                ?? -1
              )
            )
          }

          return (
            a.name
              .localeCompare(
                b.name,
              )
          )
        },
      )
    }, [
      games,
      search,
      sort,
      playFilter,
      statsByGame,
    ])


  useLayoutEffect(() => {
    if (
      section === "owned"
      && !loading
      && !selectedGame
    ) {
      restoreScrollPosition(
        "owned",
      )
    }
  }, [
    filteredGames.length,
    loading,
    restoreScrollPosition,
    section,
    selectedGame,
  ])


  function openGame(
    game: Game,
  ) {
    saveScrollPosition()
    setHistoryLoading(true)

    onOpenGame(
      game.bgg_id,
    )
  }


  function closeGame() {
    onCloseGame()
  }


  async function removeGame() {
    if (!selectedGame) {
      return
    }

    await removeFromCollection(
      selectedGame.bgg_id,
    )

    setGames(
      (current) =>
        current.filter(
          (game) =>
            game.bgg_id
            !== selectedGame
              .bgg_id,
        ),
    )

    setCollectionStats(
      (current) =>
        current.filter(
          (stats) =>
            stats.bgg_id
            !== selectedGame
              .bgg_id,
        ),
    )

    closeGame()
  }


  if (section === "wishlist") {
    return (
      <section className="screen collection-screen">
        <header>
          <h1>Want to Play</h1>
          <p className="subtitle">
            Games you have saved for later.
          </p>
        </header>

        {sectionTabs}
        <WishlistView
          gameBggId={wishlistGameBggId}
          onOpenGame={(bggId) => {
            saveScrollPosition()
            onOpenWishlistGame(bggId)
          }}
          onCloseGame={onCloseWishlistGame}
          onGameUnavailable={
            onWishlistGameUnavailable
          }
          onGameConverted={(game) => {
            setGames((current) => (
              current.some(
                (item) =>
                  item.bgg_id === game.bgg_id,
              )
                ? current
                : [...current, game]
            ))
            onWishlistGameConverted(game.bgg_id)
          }}
          onContentReady={() =>
            restoreScrollPosition(
              "wishlist",
            )
          }
        />
      </section>
    )
  }


  if (loading) {
    return (
      <section className="screen collection-screen">
        <h1>
          Opening the cupboard...
        </h1>
      </section>
    )
  }


  if (error) {
    return (
      <section className="screen collection-screen">
        <h1>
          Your games
        </h1>

        <p className="error-message">
          {error}
        </p>
      </section>
    )
  }


  if (selectedGame) {
    return (
      <GameDetail
        game={
          selectedGame
        }
        history={
          selectedGameHistory
        }
        historyLoading={
          selectedGameHistoryLoading
        }
        onBack={
          closeGame
        }
        onPlaySaved={() => {
          setHistoryLoading(true)

          return refreshHistory(
            selectedGame,
          )
        }}
        onRemove={
          removeGame
        }
      />
    )
  }


  return (
    <section className="screen collection-screen">
      <div className="collection-heading-row">
        <header>
          <h1>
            Your games
          </h1>

          <p className="subtitle">
            {games.length} games on your shelf
          </p>
        </header>

        <button
          type="button"
          className="collection-add-icon"
          aria-label={
            addingGame
              ? "Close add game"
              : "Add game"
          }
          onClick={() =>
            setAddingGame(
              (current) => !current
            )
          }
        >
          {addingGame ? "×" : "+"}
        </button>
      </div>

      {sectionTabs}


      {addingGame && (
        <AddGameSearch
          onClose={() =>
            setAddingGame(
              false
            )
          }
          onGameAdded={(
            game,
          ) => {
            setGames(
              (current) => {
                if (
                  current.some(
                    (existing) =>
                      existing.bgg_id
                      === game.bgg_id
                  )
                ) {
                  return current
                }

                return [
                  ...current,
                  game,
                ]
              }
            )
          }}
        />
      )}
      <CollectionFilters
        search={
          search
        }
        sort={
          sort
        }
        playFilter={
          playFilter
        }
        onSearchChange={
          (value) =>
            onUiStateChange(
              (current) => ({
                ...current,
                search: value,
              }),
            )
        }
        onSortChange={
          (value) =>
            onUiStateChange(
              (current) => ({
                ...current,
                sort: value,
              }),
            )
        }
        onPlayFilterChange={
          (value) =>
            onUiStateChange(
              (current) => ({
                ...current,
                playFilter: value,
              }),
            )
        }
      />


      <CollectionGameList
        games={
          filteredGames
        }
        statsByGame={
          statsByGame
        }
        onOpenGame={
          openGame
        }
      />
    </section>
  )
}


export default CollectionView
