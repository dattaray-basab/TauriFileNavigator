import {
  Play as PlayIcon,
  StopCircle as StopIcon,
  X as XIcon,
} from "lucide-react";
import { useTheme } from "@/components/common";
import { SearchOptions } from "./SearchOptions";

interface SearchActionButtonsProps {
  query: string;
  loading: boolean;
  hasResults: boolean;
  onSearch: () => void;
  onCancel: () => void;
  onClear: () => void;
}

export function SearchActionButtons({
  query,
  loading,
  hasResults,
  onSearch,
  onCancel,
  onClear,
}: SearchActionButtonsProps) {
  const { theme } = useTheme();

  const getButtonStyles = (isDisabled: boolean, isActive: boolean = true) => `
    flex items-center text-xs px-2 py-1 rounded min-w-[80px] justify-center
    ${
      isDisabled
        ? "border border-gray-300 cursor-not-allowed"
        : "border border-blue-400 hover:border-2 hover:border-blue-500 hover:font-semibold"
    }
    focus:ring focus:ring-blue-300 transition-all duration-200
    ${
      isActive
        ? `${theme.bg.lo} ${theme.fg.hi} hover:${theme.bg.med}`
        : `${theme.bg.lo} ${theme.fg.lo}`
    }
  `;

  return (
    <div className='flex flex-col' role='toolbar' aria-label='Search actions'>
      <SearchOptions />

      <div className='flex items-center justify-center space-x-2 mb-1'>
        {!loading ? (
          <button
            onClick={onSearch}
            disabled={!query.trim()}
            className={getButtonStyles(!query.trim())}
            aria-label='Start search'
            type='button'>
            <PlayIcon className='h-3 w-3 mr-1' aria-hidden='true' />
            Start Search
          </button>
        ) : (
          <button
            onClick={onCancel}
            disabled={!hasResults}
            className={getButtonStyles(!hasResults)}
            aria-label='Cancel search'
            type='button'>
            <StopIcon className='h-3 w-3 mr-1' aria-hidden='true' />
            Cancel Search
          </button>
        )}

        <button
          onClick={onClear}
          disabled={!query.trim()}
          className={getButtonStyles(!query.trim())}
          aria-label='Clear search'
          type='button'>
          <XIcon className='h-3 w-3 mr-1' aria-hidden='true' />
          Reset Search
        </button>
      </div>
    </div>
  );
}
