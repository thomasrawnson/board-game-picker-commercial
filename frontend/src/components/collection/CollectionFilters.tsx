import FilterTabs
  from "../ui/FilterTabs"

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
      <FilterTabs
        value={playFilter}
        ariaLabel="Filter collection"
        options={[
          { value: "all", label: "All" },
          { value: "played", label: "Played" },
          { value: "never", label: "Never played" },
        ]}
        onChange={
          onPlayFilterChange
        }
      />


      <div className="collection-search-sort-row">
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
              Recent
            </option>

            <option value="most-played">
              Most played
            </option>

            <option value="rating">
              Rating
            </option>

            <option value="complexity">
              Complexity
            </option>
          </select>
        </label>
      </div>
    </div>
  )
}


export default CollectionFilters