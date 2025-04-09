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
import { File } from "lucide-react";
import { useTheme } from "@/components/common";
import { useAtom } from "jotai";
import { searchState } from "../common/stateMgt";
import { useEffect, useState } from "react";
import { SearchHighlighter } from "./SearchHighlighter";
import { toPlatformPath } from "@/components/common/functions/platform";
import { platform } from "@/components/common/functions/platform";

interface SearchResultsProps {
  onFileSelect?: (filePath: string) => void;
}

export const SearchResults = ({ onFileSelect }: SearchResultsProps) => {
  const { theme } = useTheme();
  const [searchQuery] = useAtom(searchState.query);
  const [searchLoading] = useAtom(searchState.loading);
  const [searchActive] = useAtom(searchState.active);
  const [searchResults, setSearchResults] = useAtom(searchState.results);
  const [_selectedFile, setSelectedFile] = useState<string | null>(null);
  const { processSearchResults, clearHighlights } = SearchHighlighter();

  // Clear results
  const handleClearResults = () => {
    setSearchResults([]);
    clearHighlights();
  };

  // Handle file click
  const handleFileClick = (filePath: string) => {
    setSelectedFile(filePath);
    onFileSelect?.(toPlatformPath(filePath));
  };

  // Update highlighting when search results change
  useEffect(() => {
    if (searchActive && searchResults.length > 0) {
      processSearchResults(searchResults);
    } else {
      clearHighlights();
    }
  }, [searchResults, searchActive]);

  if (searchLoading) {
    return (
      <div className='px-4 py-2'>
        <div className={`text-sm ${theme.fg.med} animate-pulse`}>
          Searching...
        </div>
      </div>
    );
  }

  if (searchActive && searchResults.length === 0) {
    return (
      <div className='px-4 py-2'>
        <div className={`text-sm ${theme.fg.lo} italic`}>
          No results found. Try a different search term.
        </div>
      </div>
    );
  }

  if (!searchActive || !searchQuery) {
    return (
      <div className='px-4 py-2'>
        <div className={`text-sm ${theme.fg.lo} italic`}>
          Enter a search term to find files and content.
        </div>
      </div>
    );
  }

  // Calculate total matches
  const totalMatches = searchResults.reduce(
    (sum, file) => sum + file.matches.length,
    0
  );

  return (
    <div className='px-4'>
      <div className={`text-xs ${theme.fg.med} mb-2`}>
        {totalMatches} {totalMatches === 1 ? "match" : "matches"} in{" "}
        {searchResults.length} {searchResults.length === 1 ? "File" : "files"}
      </div>

      {searchResults.map((file) => (
        <div
          key={file.path}
          className={`mb-4 ${theme.border.lo} border-b pb-2`}
          onClick={() => handleFileClick(file.path)}>
          <div
            className={`flex items-center mb-1 ${theme.fg.hi} cursor-pointer hover:${theme.fg.hi}`}>
            <File className={`h-4 w-4 ${theme.fg.lo} mr-2 flex-shrink-0`} />
            <span className='text-sm truncate'>
              {getDisplayPath(file.path)}
            </span>
          </div>

          {/* Match lines */}
          <div className='pl-6 space-y-1'>
            {file.matches.map((match: any, idx: number) => (
              <div key={idx} className='text-xs'>
                <span className={`${theme.fg.lo} mr-2`}>{match.line}:</span>
                <span
                  className={theme.fg.med}
                  dangerouslySetInnerHTML={{
                    __html: highlightMatches(match.content, match.matchRanges),
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Clear results button */}
      {searchResults.length > 0 && (
        <div className='mt-4 mb-4'>
          <button
            onClick={handleClearResults}
            className={`text-xs px-2 py-1 rounded ${theme.bg.lo} ${theme.fg.med} hover:${theme.bg.med}`}>
            Clear Results
          </button>
        </div>
      )}
    </div>
  );
};

// Helper function to get a clean display path
function getDisplayPath(filePath: string): string {
  // Convert to platform-specific path for display
  const platformPath = toPlatformPath(filePath);

  // Split path into segments
  const segments = platformPath.split(/[\\/]/).filter(Boolean);

  if (segments.length === 0) return "";
  if (segments.length === 1) return segments[0];

  // Return last two segments (parent directory and filename)
  return `${segments[segments.length - 2]}${platform.getSeparator()}${
    segments[segments.length - 1]
  }`;
}

// Helper function to highlight matches in text
function highlightMatches(text: string, ranges: [number, number][]): string {
  if (!ranges || ranges.length === 0) return text;

  let result = "";
  let lastEnd = 0;

  for (const [start, end] of ranges) {
    // Add text before match
    result += escapeHtml(text.substring(lastEnd, start));

    // Add highlighted match
    result += `<span class="bg-yellow-200 text-black">${escapeHtml(
      text.substring(start, end)
    )}</span>`;

    lastEnd = end;
  }

  // Add remaining text
  result += escapeHtml(text.substring(lastEnd));

  return result;
}

// Helper function to escape HTML special characters
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
