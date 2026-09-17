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
  onSearchChange: (
    value: string,
  ) => void
  onSortChange: (
    value: SortOption,
  ) => void
  onPlayFilterChange: (
    value: PlayFilter,
  ) => void
}


function CollectionFilters({
  search,
  sort,
  playFilter,
  onSearchChange,
  onSortChange,
  onPlayFilterChange,
}: Props) {
  return (
    <div className="collection-tools">
      <div
        className="collection-filter-tabs"
        aria-label="Filter collection"
      >
        <button
          type="button"
          className={
            playFilter === "all"
              ? "active"
              : ""
          }
          aria-pressed={
            playFilter === "all"
          }
          onClick={() =>
            onPlayFilterChange(
              "all"
            )
          }
        >
          All
        </button>

        <button
          type="button"
          className={
            playFilter === "played"
              ? "active"
              : ""
          }
          aria-pressed={
            playFilter === "played"
          }
          onClick={() =>
            onPlayFilterChange(
              "played"
            )
          }
        >
          Played
        </button>

        <button
          type="button"
          className={
            playFilter === "never"
              ? "active"
              : ""
          }
          aria-pressed={
            playFilter === "never"
          }
          onClick={() =>
            onPlayFilterChange(
              "never"
            )
          }
        >
          Never played
        </button>
      </div>


      <label className="collection-search-wrap">
        <span className="sr-only">
          Search your games
        </span>

        <input
          className="collection-search"
          type="search"
          value={search}
          placeholder="Search your games..."
          onChange={(event) =>
            onSearchChange(
              event.target.value
            )
          }
        />
      </label>


      <div className="collection-toolbar-row">
        <label className="collection-sort-wrap">
          <span className="sr-only">
            Sort games
          </span>

          <select
            className="collection-sort"
            value={sort}
            aria-label="Sort games"
            onChange={(event) =>
              onSortChange(
                event.target
                  .value as SortOption
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
        </label>
      </div>
    </div>
  )
}


export default CollectionFilters