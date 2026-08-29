export type SortOption =
  | "name"
  | "recent"
  | "most-played"
  | "rating"
  | "complexity"

export type PlayFilter =
  | "all"
  | "played"
  | "never"

type Props = {
  search: string
  sort: SortOption
  playFilter: PlayFilter
  resultCount: number
  onSearchChange: (value: string) => void
  onSortChange: (value: SortOption) => void
  onPlayFilterChange: (value: PlayFilter) => void
}

function CollectionFilters({
  search,
  sort,
  playFilter,
  resultCount,
  onSearchChange,
  onSortChange,
  onPlayFilterChange,
}: Props) {
  return (
    <>
      <div className="collection-tools">
        <input
          className="collection-search"
          type="search"
          value={search}
          placeholder="Search games, themes or mechanics"
          onChange={(event) =>
            onSearchChange(
              event.target.value,
            )
          }
        />

        <div className="collection-filter-tabs">
          <button
            className={
              playFilter === "all"
                ? "active"
                : ""
            }
            onClick={() =>
              onPlayFilterChange("all")
            }
          >
            All
          </button>

          <button
            className={
              playFilter === "played"
                ? "active"
                : ""
            }
            onClick={() =>
              onPlayFilterChange(
                "played",
              )
            }
          >
            Played
          </button>

          <button
            className={
              playFilter === "never"
                ? "active"
                : ""
            }
            onClick={() =>
              onPlayFilterChange(
                "never",
              )
            }
          >
            Never played
          </button>
        </div>

        <select
          className="collection-sort"
          value={sort}
          onChange={(event) =>
            onSortChange(
              event.target
                .value as SortOption,
            )
          }
        >
          <option value="name">
            A–Z
          </option>

          <option value="recent">
            Recently played
          </option>

          <option value="most-played">
            Most played
          </option>

          <option value="rating">
            Highest rated
          </option>

          <option value="complexity">
            Heaviest
          </option>
        </select>
      </div>

      <p className="collection-count">
        {resultCount}{" "}
        {resultCount === 1
          ? "game"
          : "games"}
      </p>
    </>
  )
}

export default CollectionFilters