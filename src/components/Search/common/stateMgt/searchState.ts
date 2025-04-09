import { atom } from "jotai";
import type {
  SearchFileResult,
  SearchPerformance,
  HighlightedPath,
} from "./types";

// Search state atoms
export const searchState = {
  // Search input configuration
  query: atom<string>(""),
  regex: atom<boolean>(false),
  caseSensitive: atom<boolean>(true),
  wholeWord: atom<boolean>(true),

  // Search status
  loading: atom<boolean>(false),
  active: atom<boolean>(false),

  // Search results
  results: atom<SearchFileResult[]>([]),

  // Tree expansion state
  expandMode: atom<"all" | "matches" | "none">("none"),
  highlightedPaths: atom<HighlightedPath[]>([]),
  expandingInProgress: atom<boolean>(false),
  expandedLevel: atom<number>(0),

  // Performance monitoring
  performance: atom<SearchPerformance | null>(null),
};
