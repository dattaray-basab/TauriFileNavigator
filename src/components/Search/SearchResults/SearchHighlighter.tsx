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
import { useEffect, useState } from "react";
import { useAtom } from "jotai";
import { searchState, type HighlightedPath } from "../common/stateMgt";
import { toPlatformPath } from "@/components/common/functions/platform_frontend";
import { FORWARD_SLASH } from "@/components/common/constants/filesys";
import { SearchFileResult } from "../common/stateMgt/types";

// Performance monitoring interface
export interface SearchPerformance {
  processingTime: number;
  nodesExpanded: number;
  totalNodes: number;
  currentDepth: number;
  renderTime: number;
}

// Custom path handling functions to replace Node.js path module
const pathUtils = {
  dirname: (pathStr: string): string => {
    // Remove trailing slash if present
    pathStr = pathStr.endsWith(FORWARD_SLASH) ? pathStr.slice(0, -1) : pathStr;
    // Find the last slash
    const lastSlashIndex = pathStr.lastIndexOf(FORWARD_SLASH);
    if (lastSlashIndex === -1) return ".";
    if (lastSlashIndex === 0) return FORWARD_SLASH; // Root directory
    return pathStr.slice(0, lastSlashIndex);
  },
};

export const SearchHighlighter = () => {
  const [expandingInProgress, setExpandingInProgress] = useAtom(
    searchState.expandingInProgress
  );
  const [expandedLevel, setExpandedLevel] = useAtom(searchState.expandedLevel);
  const [searchResults] = useAtom(searchState.results);
  const [highlightedPaths, setHighlightedPaths] = useAtom(
    searchState.highlightedPaths
  );
  const [performance, setPerformance] = useState<SearchPerformance>({
    processingTime: 0,
    nodesExpanded: 0,
    totalNodes: 0,
    currentDepth: 0,
    renderTime: 0,
  });

  // Add clearHighlights method
  const clearHighlights = () => {
    setHighlightedPaths([]);
    setExpandedLevel(0);
    setExpandingInProgress(false);
  };

  // Count matches in a search result
  const countMatches = (result: SearchFileResult): number => {
    let matchCount = 0;
    if (result.matches) {
      for (let line of result.matches) {
        // Ensure line has a property 'match_ranges' that is an array
        const matchRanges = (
          line as unknown as { match_ranges: [number, number][] }
        ).match_ranges;

        // If matchRanges is actually an array, proceed
        if (Array.isArray(matchRanges)) {
          matchCount += matchRanges.length;
        }
      }
    }
    return matchCount;
  };

  // Process search results to create highlighted paths
  const processSearchResults = (results?: SearchFileResult[]) => {
    const startTime = window.performance.now();
    const resultsToProcess = results || searchResults;

    if (!resultsToProcess || resultsToProcess.length === 0) {
      setHighlightedPaths([]);
      return;
    }

    const newHighlightedPaths: HighlightedPath[] = [];
    const pathMap = new Map<string, number>();

    resultsToProcess.forEach((result) => {
      const matchCount = countMatches(result);
      pathMap.set(result.path, matchCount);

      // Add parent directories to the map but don't expand them
      let parentPath = pathUtils.dirname(result.path);
      while (parentPath && parentPath !== FORWARD_SLASH && parentPath !== ".") {
        const currentCount = pathMap.get(parentPath) || 0;
        pathMap.set(parentPath, currentCount + matchCount);
        parentPath = pathUtils.dirname(parentPath);
      }
    });

    // Convert to array with all nodes initially collapsed
    Array.from(pathMap.entries()).forEach(([pathStr, count]) => {
      newHighlightedPaths.push({
        path: toPlatformPath(pathStr),
        matchCount: count,
        expanded: false,
      });
    });

    const processingTime = window.performance.now() - startTime;
    setPerformance((prev) => ({
      ...prev,
      processingTime,
      totalNodes: newHighlightedPaths.length,
      nodesExpanded: 0,
      currentDepth: 0,
    }));

    setHighlightedPaths(newHighlightedPaths);
    setExpandedLevel(0);
    setExpandingInProgress(false);
  };

  // Toggle expansion for a specific path
  const togglePathExpansion = (path: string) => {
    setHighlightedPaths((prev) =>
      prev.map((item) =>
        item.path === toPlatformPath(path)
          ? { ...item, expanded: !item.expanded }
          : item
      )
    );
  };

  // Watch for search results changes
  useEffect(() => {
    processSearchResults();
  }, [searchResults]);

  return {
    highlightedPaths,
    expandingInProgress,
    expandedLevel,
    processSearchResults,
    clearHighlights,
    performance,
    setPerformance,
    togglePathExpansion,
  };
};
