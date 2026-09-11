import {
  authors,
  readingStatusOptions,
  sortOptions,
  yearBounds,
  type Filters,
} from "@/lib/catalogue-filters";
import { categories } from "@/data/books";

const fieldClass =
  "w-full rounded-lg border border-parchment/15 bg-ink/40 px-3 py-2.5 font-sans text-sm text-parchment outline-none transition-colors focus:border-sand/50";
const labelClass =
  "mb-1.5 block font-mono text-[10px] uppercase tracking-[0.16em] text-parchment/45";

/** Reusable filter + sort controls, shared by the desktop sidebar and mobile drawer. */
export function BookFilters({
  filters,
  onChange,
  onClear,
  showClear,
}: {
  filters: Filters;
  onChange: (patch: Partial<Filters>) => void;
  onClear: () => void;
  showClear: boolean;
}) {
  return (
    <div className="space-y-4">
      <div>
        <label className={labelClass} htmlFor="filter-category">
          Category
        </label>
        <select
          id="filter-category"
          className={fieldClass}
          value={filters.category}
          onChange={(event) => onChange({ category: event.target.value })}
        >
          {categories.map((item) => (
            <option key={item} value={item}>
              {item === "All" ? "All categories" : item}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className={labelClass} htmlFor="filter-author">
          Author
        </label>
        <select
          id="filter-author"
          className={fieldClass}
          value={filters.author}
          onChange={(event) => onChange({ author: event.target.value })}
        >
          {authors.map((item) => (
            <option key={item} value={item}>
              {item === "All" ? "All authors" : item}
            </option>
          ))}
        </select>
      </div>

      <div>
        <span className={labelClass}>Publication year</span>
        <div className="flex items-center gap-2">
          <input
            type="number"
            inputMode="numeric"
            className={fieldClass}
            aria-label="Year from"
            placeholder={String(yearBounds.min)}
            value={filters.yearFrom}
            onChange={(event) => onChange({ yearFrom: event.target.value })}
          />
          <span className="font-sans text-xs text-parchment/40">to</span>
          <input
            type="number"
            inputMode="numeric"
            className={fieldClass}
            aria-label="Year to"
            placeholder={String(yearBounds.max)}
            value={filters.yearTo}
            onChange={(event) => onChange({ yearTo: event.target.value })}
          />
        </div>
      </div>

      <div>
        <span className={labelClass}>Reading status</span>
        <div className="flex flex-wrap gap-2">
          {readingStatusOptions.map((option) => {
            const active = filters.status === option.value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => onChange({ status: option.value })}
                aria-pressed={active}
                className={`rounded-full border px-3 py-2 font-sans text-xs transition-colors ${
                  active
                    ? "border-oxblood bg-oxblood text-parchment"
                    : "border-parchment/15 bg-parchment/5 text-parchment/70 hover:border-parchment/35"
                }`}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </div>

      <label className="flex items-center gap-2.5 font-sans text-sm text-parchment/75">
        <input
          type="checkbox"
          className="h-4 w-4 accent-oxblood"
          checked={filters.favoritesOnly}
          onChange={(event) => onChange({ favoritesOnly: event.target.checked })}
        />
        Favourites only
      </label>

      <div>
        <label className={labelClass} htmlFor="filter-sort">
          Sort by
        </label>
        <select
          id="filter-sort"
          className={fieldClass}
          value={filters.sort}
          onChange={(event) => onChange({ sort: event.target.value as Filters["sort"] })}
        >
          {sortOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {showClear ? (
        <button
          type="button"
          onClick={onClear}
          className="w-full rounded-full border border-sand/40 px-4 py-2.5 font-sans text-xs font-semibold uppercase tracking-[0.12em] text-sand transition-colors hover:bg-sand/10"
        >
          Clear Filters
        </button>
      ) : null}
    </div>
  );
}
