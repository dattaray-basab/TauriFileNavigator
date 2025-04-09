import { useCallback, useEffect, useRef } from "react";
import { useSearchEvents } from "../events/searchEvents";
import { SearchFileResult } from "../stateMgt";
import { searchFiles, cancelSearch } from "../backendInterface/rustAccess";

interface SearchOptions {
  query: string;
  regex: boolean;
  caseSensitive: boolean;
  wholeWord: boolean;
  timeout?: number;
  path: string;
}

interface SearchResponse {
  results: SearchFileResult[];
  stats: {
    files_searched: number;
    total_matches: number;
    directories_searched: number;
    processing_time_ms: number;
  };
  curtailed: boolean;
  cancelled: boolean;
}

export function useSearchCoordinator() {
  const { emit } = useSearchEvents();
  const searchTimeoutRef = useRef<NodeJS.Timeout>();
  const abortControllerRef = useRef<AbortController>();

  // Cleanup function
  const cleanup = useCallback(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  const performSearch = useCallback(
    async (options: SearchOptions) => {
      const {
        query,
        regex,
        caseSensitive,
        wholeWord,
        timeout = 30000,
        path,
      } = options;

      // Clean up any existing search
      cleanup();

      // Don't search if query is empty
      if (!query.trim()) {
        emit("SEARCH_CANCELLED", { reason: "user" });
        return;
      }

      // Create new abort controller
      abortControllerRef.current = new AbortController();

      try {
        // Emit search started event
        emit("SEARCH_STARTED", { query, path });

        // Set up search timeout
        searchTimeoutRef.current = setTimeout(() => {
          if (abortControllerRef.current) {
            abortControllerRef.current.abort();
            emit("SEARCH_CANCELLED", { reason: "timeout" });
          }
        }, timeout);

        // Perform search
        const response: SearchResponse = await searchFiles(
          path,
          query,
          regex,
          caseSensitive,
          wholeWord,
          Math.floor(timeout / 1000) // Convert to seconds
        );

        // Clear timeout since search completed
        if (searchTimeoutRef.current) {
          clearTimeout(searchTimeoutRef.current);
        }

        if (response.cancelled) {
          emit("SEARCH_CANCELLED", { reason: "user" });
          return;
        }

        // Process and emit results
        const processedResults = processSearchResults(response.results);
        emit("SEARCH_COMPLETED", { results: processedResults });
      } catch (error) {
        // Handle search errors
        if (error instanceof Error) {
          if (error.name === "AbortError") {
            emit("SEARCH_CANCELLED", { reason: "aborted" });
          } else {
            emit("SEARCH_ERROR", { error });
          }
        }
      }
    },
    [emit, cleanup]
  );

  const cancelCurrentSearch = useCallback(async () => {
    cleanup();
    emit("SEARCH_CANCELLED", { reason: "user" });
    await cancelSearch();
  }, [cleanup, emit]);

  return {
    performSearch,
    cancelCurrentSearch,
  };
}

// Helper function to process search results
function processSearchResults(results: SearchFileResult[]): SearchFileResult[] {
  return results.map((result) => ({
    ...result,
    matches: result.matches.map((match) => ({
      ...match,
      // Ensure matchRanges are sorted and non-overlapping
      matchRanges: match.matchRanges
        .sort(([a], [b]) => a - b)
        .reduce((acc, curr) => {
          if (acc.length === 0) return [curr];
          const last = acc[acc.length - 1];
          if (curr[0] <= last[1]) {
            last[1] = Math.max(last[1], curr[1]);
            return acc;
          }
          return [...acc, curr];
        }, [] as [number, number][]),
    })),
  }));
}
