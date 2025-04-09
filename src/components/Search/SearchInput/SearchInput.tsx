/**
 * MIT License
 *
 * Copyright (c) 2025 Basab Dattaray
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 *
 * The author would like to give special thanks to the contributors of https://github.com/Souvlaki42/file-manager.git
 * for providing inspiration for this project.
 */

// this is a collection of of controls for gathering user inpput for search query mangement as well as triggering the search
import { useCallback, useEffect, useState, Profiler } from "react";
import { useTheme } from "@/components/common";
import { useAtom } from "jotai";
import { jotaiPathStates } from "@/components/common/globalStateMgt/jotaiPathStates";
import { searchState } from "../common/stateMgt";

import { SearchPerformanceModal } from "../SearchPerformanceModal/SearchPerformanceModal";
import { SearchActionButtons } from "./SearchActionButtons";
import { TimeoutSlider } from "./TimeoutSlider";
import { SearchTextCapture } from "./SearchTextCapture";
import { searchHistoryManagerAtom } from "@/components/common/globalStateMgt/jotaiSearchStates";
import {
  searchFiles,
  cancelSearch,
  type SearchProgress,
  type SearchResponse,
} from "../common/backendInterface/rustAccess";
import { UnlistenFn } from "@tauri-apps/api/event";
import { event } from "@tauri-apps/api";
import { listen } from "@tauri-apps/api/event";
// import { FileText } from "lucide-react";
import { SearchHighlighter } from "../SearchResults/SearchHighlighter";
import { DetailedResultsModal } from "../SearchResults/DetailedResultsModal";
import { SearchHistory } from "../SearchHistory/SearchHistory";
import { useSearchPerformance } from "../common/hooks/useSearchPerformance";

interface SearchInputProps {
  searchTimeout: number;
}

export function SearchInput({
  searchTimeout: initialTimeout,
}: SearchInputProps) {
  const { theme } = useTheme();
  const [searchQuery, setSearchQuery] = useAtom(searchState.query);
  const [searchRegex] = useAtom(searchState.regex);
  const [searchCaseSensitive] = useAtom(searchState.caseSensitive);
  const [searchWholeWord] = useAtom(searchState.wholeWord);
  const [searchLoading, setSearchLoading] = useAtom(searchState.loading);
  const [, setSearchActive] = useAtom(searchState.active);
  const [searchResults, setSearchResults] = useAtom(searchState.results);
  const [, setHighlightedPaths] = useAtom(searchState.highlightedPaths);
  const [expandingInProgress] = useAtom(searchState.expandingInProgress);

  const [paths] = useAtom(jotaiPathStates.pathsState);
  const [pathIndex] = useAtom(jotaiPathStates.pathIndexState);

  // Get current path
  const currentPath = paths[pathIndex] || "";

  const [isPerformanceModalOpen, setIsPerformanceModalOpen] = useState(false);
  const {
    performance,
    isRendering,
    onRender,
    updateProcessingTime,
    resetPerformance,
  } = useSearchPerformance({
    searchLoading,
    expandingInProgress,
  });

  // Add state for real-time stats
  const [searchStats, setSearchStats] = useState({
    filesSearched: 0,
    directoriesSearched: 0,
    totalMatches: 0,
  });

  const [isCurtailed, setIsCurtailed] = useState(false);
  const [isCancelled, setIsCancelled] = useState(false);

  // Add timeout state
  const [searchTimeout, setSearchTimeout] = useState(initialTimeout);

  const [, setSearchHistoryManager] = useAtom(searchHistoryManagerAtom);

  const [isDetailedResultsModalOpen, setIsDetailedResultsModalOpen] =
    useState(false);

  const { processSearchResults, clearHighlights } = SearchHighlighter();

  // Load search history on component mount
  useEffect(() => {
    setSearchHistoryManager({ type: "LOAD" });
  }, [setSearchHistoryManager]);

  // Listen for search progress
  useEffect(() => {
    const unlisten = event.listen(
      "search-progress",
      (event: { payload: any }) => {
        const {
          files_searched,
          directories_searched,
          total_matches,
          processing_time_ms,
        } = event.payload;
        // Use the cumulative values from backend directly, ensure monotonic increase
        setSearchStats((prev) => ({
          filesSearched: Math.max(prev.filesSearched, files_searched || 0),
          directoriesSearched: Math.max(
            prev.directoriesSearched,
            directories_searched || 0
          ),
          totalMatches: Math.max(prev.totalMatches, total_matches || 0),
        }));
        // Use cumulative time from backend directly
        if (processing_time_ms) {
          updateProcessingTime(processing_time_ms);
        }
      }
    );

    return () => {
      unlisten.then((f: UnlistenFn) => f());
    };
  }, []);

  // Process search results and update highlighting
  useEffect(() => {
    if (searchResults.length > 0) {
      processSearchResults(searchResults);
    } else {
      clearHighlights();
    }
  }, [searchResults]);

  // Handle search execution
  const handleSearch = useCallback(
    async (query: string) => {
      if (!query.trim() || !currentPath) {
        setSearchResults([]);
        setSearchActive(false);
        setSearchLoading(false);
        return;
      }

      try {
        setIsCurtailed(false);
        setIsCancelled(false);
        setSearchStats({
          filesSearched: 0,
          directoriesSearched: 0,
          totalMatches: 0,
        });
        resetPerformance();

        const response = await searchFiles(
          currentPath,
          query,
          searchRegex,
          searchCaseSensitive,
          searchWholeWord,
          searchTimeout
        );

        if (isCancelled) {
          setIsPerformanceModalOpen(false);
          return;
        }

        setIsCurtailed(response.curtailed);
        setSearchResults(response.results);
        setSearchActive(true);

        if (response.stats.processing_time_ms) {
          updateProcessingTime(response.stats.processing_time_ms);
        }

        setSearchLoading(false);

        if (!response.curtailed) {
          setTimeout(() => {
            setIsPerformanceModalOpen(false);
          }, 1000);
        }

        setSearchHistoryManager({ type: "ADD", payload: query });
      } catch (error) {
        console.error("Search error:", error);
        setSearchResults([]);
        setIsPerformanceModalOpen(false);
        setSearchLoading(false);
      }
    },
    [
      currentPath,
      searchRegex,
      searchCaseSensitive,
      searchWholeWord,
      searchTimeout,
      setSearchLoading,
      setSearchActive,
      setSearchResults,
      setHighlightedPaths,
      updateProcessingTime,
      resetPerformance,
      setSearchHistoryManager,
    ]
  );

  // Replace the existing useEffect that auto-triggers search
  useEffect(() => {
    // Only clear results when query is empty
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setSearchActive(false);
      setSearchLoading(false);
    }
    // Don't auto-start search here
  }, [searchQuery, setSearchResults, setSearchActive, setSearchLoading]);

  // Clear search
  const handleClear = () => {
    setSearchQuery("");
    setSearchResults([]);
    clearHighlights();
    setSearchActive(false);
    setSearchLoading(false);
  };

  // Start search manually
  const startSearch = () => {
    if (searchQuery.trim() && currentPath) {
      setSearchLoading(true);
      setIsPerformanceModalOpen(true);
      handleSearch(searchQuery);
    }
  };

  // Update cancelSearch to use the new function
  const handleCancelSearch = async () => {
    try {
      // Immediately update UI state
      setSearchLoading(false);
      setIsCancelled(true);
      setIsPerformanceModalOpen(false); // Close the modal immediately

      // Clear existing results and highlights immediately
      setSearchResults([]);
      setSearchActive(false);
      setHighlightedPaths([]);

      // Finally, tell backend to cancel
      await cancelSearch();
    } catch (error) {
      console.error("Error canceling search:", error);
    }
  };

  // Clear search timer when search completes
  useEffect(() => {
    if (!searchLoading && !expandingInProgress) {
      // Only close when everything is complete
      setTimeout(() => {
        setIsPerformanceModalOpen(false);
      }, 1000);
    }
  }, [searchLoading, expandingInProgress]);

  // Add effect to handle modal state when expansion completes
  useEffect(() => {
    if (!expandingInProgress && !searchLoading) {
      // Add a small delay before closing to show the final state
      setTimeout(() => {
        setIsPerformanceModalOpen(false);
      }, 1000);
    }
  }, [expandingInProgress, searchLoading]);

  // Add cleanup for search results when component unmounts
  useEffect(() => {
    return () => {
      setSearchResults([]);
      setHighlightedPaths([]);
    };
  }, []);

  // Add event listeners for search progress and early results
  useEffect(() => {
    const unlisten1 = listen<SearchProgress>("search-progress", (event) => {
      handleSearchProgress(event.payload);
    });

    const unlisten2 = listen<SearchResponse>(
      "search-early-results",
      (event) => {
        handleEarlyResults(event.payload);
      }
    );

    return () => {
      unlisten1.then((fn) => fn());
      unlisten2.then((fn) => fn());
    };
  }, []);

  const handleSearchProgress = (progress: SearchProgress) => {
    setSearchStats((prevStats) => ({
      filesSearched: Math.max(
        prevStats.filesSearched || 0,
        progress.files_searched
      ),
      directoriesSearched: Math.max(
        prevStats.directoriesSearched || 0,
        progress.directories_searched
      ),
      totalMatches: Math.max(
        prevStats.totalMatches || 0,
        progress.total_matches
      ),
    }));

    if (progress.processing_time_ms) {
      updateProcessingTime(progress.processing_time_ms);
    }
  };

  const handleEarlyResults = (response: SearchResponse) => {
    setSearchStats((prevStats) => ({
      filesSearched: Math.max(
        prevStats.filesSearched || 0,
        response.stats.files_searched
      ),
      directoriesSearched: Math.max(
        prevStats.directoriesSearched || 0,
        response.stats.directories_searched
      ),
      totalMatches: Math.max(
        prevStats.totalMatches || 0,
        response.stats.total_matches
      ),
    }));

    if (response.stats.processing_time_ms) {
      updateProcessingTime(response.stats.processing_time_ms);
    }
  };

  return (
    <Profiler id='SearchInput' onRender={onRender}>
      <div
        className={`${theme.bg.hi} ${theme.fg.hi} p-4 rounded-lg flex flex-col h-full`}>
        {/* Fixed content at the top */}
        <div className='flex flex-col flex-shrink-0'>
          <SearchTextCapture
            query={searchQuery}
            onQueryChange={setSearchQuery}
            onSearch={startSearch}
            onClear={handleClear}
          />

          <div className='mt-2'>
            <SearchActionButtons
              query={searchQuery}
              loading={searchLoading}
              hasResults={searchResults.length > 0}
              onSearch={startSearch}
              onCancel={handleCancelSearch}
              onClear={handleClear}
            />
          </div>

          <div className='mt-4'>
            <TimeoutSlider
              initialTimeout={initialTimeout}
              onTimeoutChange={setSearchTimeout}
            />
          </div>

          {/* Detailed Results Button */}
          {!searchLoading && searchResults.length > 0 && (
            <div className='mt-4'>
              <button
                onClick={() => setIsDetailedResultsModalOpen(true)}
                className={`flex items-center text-xs px-2 py-1 rounded min-w-[80px] justify-center
                  border border-blue-400 hover:border-2 hover:border-blue-500 hover:font-semibold
                  focus:ring focus:ring-blue-300 transition-all duration-200
                  ${theme.bg.lo} ${theme.fg.hi} hover:${theme.bg.med}`}>
                {/* <FileText className='h-3 w-3 mr-1' /> */}
                <span>View Detailed Results</span>
              </button>
            </div>
          )}
        </div>

        {/* Scrollable Search History */}
        {!searchLoading && (
          <div className='mt-4 flex-1 min-h-0 flex flex-col'>
            <SearchHistory onSelectSearch={setSearchQuery} />
          </div>
        )}

        {/* Status messages at the bottom */}
        <div className='mt-4 flex-shrink-0'>
          {isCurtailed && (
            <div className='text-yellow-500 text-xs'>
              Search curtailed due to timeout. Try:
              <ul className='list-disc ml-4 mt-1'>
                <li>Narrowing your search scope</li>
                <li>Using more specific search terms</li>
                <li>Increasing the timeout duration</li>
              </ul>
            </div>
          )}
          {isCancelled && (
            <div className='text-yellow-500 text-xs'>Search cancelled.</div>
          )}
        </div>
      </div>

      {/* Performance Modal */}
      <SearchPerformanceModal
        isOpen={isPerformanceModalOpen}
        onClose={() => setIsPerformanceModalOpen(false)}
        onCancel={handleCancelSearch}
        performance={performance}
        loading={searchLoading}
        expandingInProgress={expandingInProgress}
        isRendering={isRendering}
        searchStats={searchStats}
        isCurtailed={isCurtailed}
      />

      {/* Detailed Results Modal */}
      <DetailedResultsModal
        isOpen={isDetailedResultsModalOpen}
        onClose={() => setIsDetailedResultsModalOpen(false)}
        searchStats={searchStats}
        performance={performance}
        searchResults={searchResults}
      />
    </Profiler>
  );
}
