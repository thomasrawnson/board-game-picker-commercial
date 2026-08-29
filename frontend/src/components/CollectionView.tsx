import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react"

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


function CollectionView() {
  const [games, setGames] =
    useState<Game[]>([])

  const [
    collectionStats,
    setCollectionStats,
  ] =
    useState<
      CollectionGameStats[]
    >([])

  const [search, setSearch] =
    useState("")

  const [sort, setSort] =
    useState<SortOption>("name")

  const [
    playFilter,
    setPlayFilter,
  ] =
    useState<PlayFilter>("all")

  const [
    selectedGame,
    setSelectedGame,
  ] =
    useState<Game | null>(null)

  const [
    gameHistory,
    setGameHistory,
  ] =
    useState<GameHistory | null>(
      null,
    )

  const [
    historyLoading,
    setHistoryLoading,
  ] =
    useState(false)

  const [loading, setLoading] =
    useState(true)

  const [error, setError] =
    useState("")

  const savedScrollPosition =
    useRef(0)


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
            (game) => game.owned,
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


  useEffect(() => {
    if (selectedGame !== null) {
      return
    }

    requestAnimationFrame(() => {
      window.scrollTo({
        top:
          savedScrollPosition.current,
        behavior: "instant",
      })
    })
  }, [selectedGame])


  async function refreshHistory(
    game: Game,
  ) {
    setHistoryLoading(true)

    try {
      const history =
        await getGameHistory(
          game.bgg_id,
        )

      setGameHistory(history)

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
                stats.bgg_id ===
                game.bgg_id,
            )

          if (!exists) {
            return [
              ...current,
              updated,
            ]
          }

          return current.map(
            (stats) =>
              stats.bgg_id ===
              game.bgg_id
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
      setGameHistory(null)
      return
    }

    refreshHistory(
      selectedGame,
    )
  }, [selectedGame])


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
      [collectionStats],
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
              stats?.play_count ??
              0

            if (
              playFilter ===
                "played" &&
              playCount === 0
            ) {
              return false
            }

            if (
              playFilter ===
                "never" &&
              playCount > 0
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
              .includes(query)
          },
        )

      return [
        ...results,
      ].sort((a, b) => {
        const aStats =
          statsByGame.get(
            a.bgg_id,
          )

        const bStats =
          statsByGame.get(
            b.bgg_id,
          )

        if (sort === "recent") {
          const aDate =
            aStats?.last_played_at
              ? new Date(
                  aStats.last_played_at,
                ).getTime()
              : 0

          const bDate =
            bStats?.last_played_at
              ? new Date(
                  bStats.last_played_at,
                ).getTime()
              : 0

          return bDate - aDate
        }

        if (
          sort === "most-played"
        ) {
          return (
            (bStats?.play_count ??
              0) -
            (aStats?.play_count ??
              0)
          )
        }

        if (sort === "rating") {
          return (
            (b.rating ?? -1) -
            (a.rating ?? -1)
          )
        }

        if (
          sort === "complexity"
        ) {
          return (
            (b.complexity ??
              -1) -
            (a.complexity ??
              -1)
          )
        }

        return (
          a.name.localeCompare(
            b.name,
          )
        )
      })
    }, [
      games,
      search,
      sort,
      playFilter,
      statsByGame,
    ])


  function openGame(
    game: Game,
  ) {
    savedScrollPosition.current =
      window.scrollY

    setSelectedGame(game)
  }


  function closeGame() {
    setSelectedGame(null)
    setGameHistory(null)
  }


  async function removeGame() {
    if (!selectedGame) {
      return
    }

    const confirmed =
      window.confirm(
        `Remove ${selectedGame.name} from your collection?`,
      )

    if (!confirmed) {
      return
    }

    try {
      await removeFromCollection(
        selectedGame.bgg_id,
      )

      setGames(
        (current) =>
          current.filter(
            (game) =>
              game.bgg_id !==
              selectedGame.bgg_id,
          ),
      )

      setCollectionStats(
        (current) =>
          current.filter(
            (stats) =>
              stats.bgg_id !==
              selectedGame.bgg_id,
          ),
      )

      closeGame()
    } catch (err) {
      console.error(err)

      window.alert(
        "Couldn't remove this game from your collection.",
      )
    }
  }


  if (loading) {
    return (
      <section className="screen collection-screen">
        <p className="eyebrow">
          Your collection
        </p>

        <h1>
          Opening the cupboard...
        </h1>
      </section>
    )
  }


  if (error) {
    return (
      <section className="screen collection-screen">
        <p className="eyebrow">
          Your collection
        </p>

        <h1>Your games</h1>

        <p className="error-message">
          {error}
        </p>
      </section>
    )
  }


  if (selectedGame) {
    return (
      <GameDetail
        game={selectedGame}
        history={gameHistory}
        historyLoading={
          historyLoading
        }
        onBack={closeGame}
        onPlaySaved={() =>
          refreshHistory(
            selectedGame,
          )
        }
        onRemove={
          removeGame
        }
      />
    )
  }


  return (
    <section className="screen collection-screen">
      <header>
        <p className="eyebrow">
          Your collection
        </p>

        <h1>Your games</h1>

        <p className="subtitle">
          {games.length} games on
          your shelf.
        </p>
      </header>

      <CollectionFilters
        search={search}
        sort={sort}
        playFilter={
          playFilter
        }
        resultCount={
          filteredGames.length
        }
        onSearchChange={
          setSearch
        }
        onSortChange={
          setSort
        }
        onPlayFilterChange={
          setPlayFilter
        }
      />

      <CollectionGameList
        games={filteredGames}
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