import { SearchActionButtons } from "./SearchInput/SearchActionButtons";
import { SearchTextCapture } from "./SearchInput/SearchTextCapture";
import { useState } from "react";

export function SearchInputControls() {
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);

  const handleQueryChange = (value: string) => setQuery(value);

  const handleSearch = () => {
    setLoading(true);
    // Simulating search - replace with actual search logic
    setSearchResults([
      /* search results */
    ]);
    setLoading(false);
  };

  const handleCancel = () => {
    setLoading(false);
  };

  const handleClear = () => {
    setSearchResults([]);
    setQuery("");
  };

  return (
    <>
      <SearchTextCapture
        query={query}
        onQueryChange={handleQueryChange}
        onSearch={handleSearch}
        onClear={handleClear}
        isSearching={loading}
      />
      <SearchActionButtons
        query={query}
        loading={loading}
        hasResults={searchResults.length > 0}
        onSearch={handleSearch}
        onCancel={handleCancel}
        onClear={handleClear}
      />
    </>
  );
}
