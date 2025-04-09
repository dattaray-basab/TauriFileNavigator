import { Search as SearchIcon, X as XIcon } from "lucide-react";
import { useTheme } from "@/components/common";
import { useEffect, useRef } from "react";

interface SearchTextCaptureProps {
  query: string;
  onQueryChange: (query: string) => void;
  onSearch: () => void;
  onClear: () => void;
  isSearching?: boolean;
}

export function SearchTextCapture({
  query,
  onQueryChange,
  onSearch,
  onClear,
  isSearching = false,
}: SearchTextCaptureProps) {
  const { theme } = useTheme();
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus the input and position cursor at the start when component mounts
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
      // Position cursor at the start
      inputRef.current.setSelectionRange(0, 0);
    }
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !isSearching) {
      e.preventDefault();
      onSearch();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onQueryChange(e.target.value);
  };

  return (
    <div
      role='search'
      className={`flex items-center px-2 py-1.5 rounded-md border border-blue-400 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 ${theme.bg.hi}`}>
      <SearchIcon
        className={`h-5 w-5 ${theme.fg.med} mr-2 flex-shrink-0 ${
          isSearching ? "animate-pulse" : ""
        }`}
        aria-hidden='true'
      />
      <input
        ref={inputRef}
        type='text'
        value={query}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder='enter search text...'
        className={`flex-grow bg-transparent ${theme.fg.hi} outline-none text-sm disabled:opacity-50 disabled:cursor-not-allowed`}
        id='search-input'
        disabled={isSearching}
        aria-label='Search input'
        autoCapitalize='off'
        autoCorrect='off'
        autoComplete='off'
        spellCheck='false'
      />
      {query && !isSearching && (
        <button
          onClick={onClear}
          className='focus:outline-none p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors'
          aria-label='clear search input'
          type='button'>
          <XIcon
            className={`h-5 w-5 ${theme.fg.med} hover:${theme.fg.hi} flex-shrink-0`}
            aria-hidden='true'
          />
        </button>
      )}
    </div>
  );
}
