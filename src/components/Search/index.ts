// Core types
export interface SearchFileResult {
  path: string;
  matches: {
    line: number;
    content: string;
    matchRanges: [number, number][];
  }[];
}

export interface SearchOptions {
  query: string;
  regex: boolean;
  caseSensitive: boolean;
  wholeWord: boolean;
  timeout?: number;
  path: string;
}

// Highlighting types
export interface HighlightInfo {
  isHighlighted: boolean;
  matchCount: number;
  expanded?: boolean;
  style?: {
    color?: string;
    backgroundColor?: string;
  };
}

export interface HighlightedPath {
  path: string;
  matchCount: number;
  expanded: boolean;
}

// Event types
export type SearchEventType =
  | "SEARCH_STARTED"
  | "SEARCH_COMPLETED"
  | "SEARCH_CANCELLED"
  | "SEARCH_ERROR"
  | "RESULTS_UPDATED";

export interface SearchEventPayloads {
  SEARCH_STARTED: { query: string; path: string };
  SEARCH_COMPLETED: { results: SearchFileResult[] };
  SEARCH_CANCELLED: { reason?: "timeout" | "user" | "aborted" };
  SEARCH_ERROR: { error: Error };
  RESULTS_UPDATED: { results: SearchFileResult[] };
}

// Hook exports
export { useSearchEvents } from "./common/events/searchEvents";
export { useSearchCoordinator } from "./common/hooks/useSearchCoordinator";
export { useHighlighting } from "./common/hooks/useHighlighting";

// Component exports
export { TextHighlighter } from "./SearchResults/TextHighlighter";
export { Search } from "./Search";
