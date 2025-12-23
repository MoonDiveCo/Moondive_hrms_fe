export default function SlugSearchInput({
  query,
  setQuery,
  suggestions,
  onSelect,
}) {
  return (
    <div className="relative mb-4">
      <input
        className="w-full border p-2 rounded"
        placeholder="Search existing inventory by specs..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      {suggestions.length > 0 && (
        <div className="absolute z-20 w-full bg-white border rounded mt-1 shadow-lg max-h-60 overflow-auto">
          {suggestions.map((s) => (
            <div
              key={s.id}
              className="px-3 py-2 cursor-pointer hover:bg-gray-100 text-sm"
              onClick={() => onSelect(s)}
            >
              {s.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
