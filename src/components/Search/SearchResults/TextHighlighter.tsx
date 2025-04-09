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
import React, { useEffect, useState, useCallback, useRef } from "react";
import { useAtom } from "jotai";
import { searchState } from "../common/stateMgt";
import { useTheme } from "@/components/common";
import { TextHighlightNav } from "./TextHighlightNav";

interface TextHighlighterProps {
  content: string;
  filePath: string;
  isCaseSensitive: boolean;
  isWholeWord: boolean;
}

export function TextHighlighter({
  content,
  filePath,
  isCaseSensitive,
  isWholeWord,
}: TextHighlighterProps) {
  const [highlightedPaths] = useAtom(searchState.highlightedPaths);
  const [searchQuery] = useAtom(searchState.query);
  const [highlightedContent, setHighlightedContent] = useState<
    React.ReactNode[]
  >([]);
  const { theme } = useTheme();
  const [matchCount, setMatchCount] = useState(0);
  const [currentMatchIndex, setCurrentMatchIndex] = useState(0);
  const contentRef = useRef<HTMLDivElement>(null);
  const matchRefs = useRef<(HTMLSpanElement | null)[]>([]);

  // Helper function to escape special regex characters
  const escapeRegExp = useCallback((string: string): string => {
    return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }, []);

  // Create regex for highlighting with constraints
  const createSearchRegex = useCallback(() => {
    let pattern = escapeRegExp(searchQuery);
    if (isWholeWord) {
      pattern = `\\b${pattern}\\b`;
    }
    const flags = isCaseSensitive ? "g" : "gi";
    return new RegExp(pattern, flags);
  }, [searchQuery, isCaseSensitive, isWholeWord]);

  // Process content and highlight matches
  const processContent = useCallback(() => {
    // If no content or search query, show plain content
    if (!content || !searchQuery) {
      setHighlightedContent([
        <pre key='content' className='whitespace-pre-wrap font-mono text-sm'>
          {content}
        </pre>,
      ]);
      setMatchCount(0);
      return;
    }

    // Get search matches for this file
    const fileHighlight = highlightedPaths.find((hp) => hp.path === filePath);
    if (!fileHighlight) {
      setHighlightedContent([
        <pre key='content' className='whitespace-pre-wrap font-mono text-sm'>
          {content}
        </pre>,
      ]);
      setMatchCount(0);
      return;
    }

    // Split content into lines
    const lines = content.split("\n");
    const highlightedLines: React.ReactNode[] = [];

    // Create regex with constraints
    const searchRegex = createSearchRegex();

    // Count total matches
    let totalMatches = 0;
    // Reset match refs array
    matchRefs.current = [];

    // Process each line
    lines.forEach((line, lineIndex) => {
      const parts: React.ReactNode[] = [];
      let lastIndex = 0;
      let match;

      // Find all matches in the current line
      searchRegex.lastIndex = 0; // Reset regex index for each line
      while ((match = searchRegex.exec(line)) !== null) {
        const matchIndex = totalMatches;

        // Add text before match
        if (match.index > lastIndex) {
          parts.push(line.substring(lastIndex, match.index));
        }

        // Add highlighted match with ref for scrolling
        const isCurrentMatch = matchIndex === currentMatchIndex;
        parts.push(
          <span
            key={`match-${matchIndex}`}
            ref={(el) => {
              matchRefs.current[matchIndex] = el;
            }}
            className={
              isCurrentMatch ? theme.highlight.active : theme.highlight.content
            }>
            {match[0]}
          </span>
        );

        lastIndex = match.index + match[0].length;
        totalMatches++;
      }

      // Add remaining text
      if (lastIndex < line.length) {
        parts.push(line.substring(lastIndex));
      }

      // Add the processed line
      highlightedLines.push(
        <div key={lineIndex} className='whitespace-pre font-mono text-sm'>
          <span className='text-gray-500 inline-block w-10 text-right mr-2'>
            {lineIndex + 1}
          </span>
          {parts.length > 0 ? parts : line}
        </div>
      );
    });

    setMatchCount(totalMatches);
    setHighlightedContent(highlightedLines);
  }, [
    content,
    filePath,
    highlightedPaths,
    searchQuery,
    theme,
    currentMatchIndex,
    escapeRegExp,
    isCaseSensitive,
    isWholeWord,
  ]);

  // Scroll to current match when it changes
  useEffect(() => {
    if (matchCount > 0 && matchRefs.current[currentMatchIndex]) {
      console.log(`Scrolling to match ${currentMatchIndex}`);
      // Add a slightly longer delay to ensure the DOM is fully updated
      setTimeout(() => {
        const matchElement = matchRefs.current[currentMatchIndex];
        if (matchElement) {
          console.log(`Found match element, scrolling to it`);
          matchElement.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
        } else {
          console.log(`Match element not found for index ${currentMatchIndex}`);
        }
      }, 150); // Increased delay to ensure DOM is updated
    }
  }, [currentMatchIndex, matchCount]);

  // Process content when dependencies change
  useEffect(() => {
    processContent();
  }, [processContent]);

  // Handle navigation between matches
  const handlePreviousMatch = useCallback(() => {
    if (matchCount <= 1) return;

    console.log(`Previous match clicked, current index: ${currentMatchIndex}`);
    const newIndex =
      currentMatchIndex > 0 ? currentMatchIndex - 1 : matchCount - 1;
    console.log(`Updating to previous match index: ${newIndex}`);

    setCurrentMatchIndex(newIndex);
  }, [matchCount, currentMatchIndex]);

  const handleNextMatch = useCallback(() => {
    if (matchCount <= 1) return;

    console.log(`Next match clicked, current index: ${currentMatchIndex}`);
    const newIndex = (currentMatchIndex + 1) % matchCount;
    console.log(`Updating to next match index: ${newIndex}`);

    setCurrentMatchIndex(newIndex);
  }, [matchCount, currentMatchIndex]);

  // Add keyboard navigation support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle keyboard events if there are matches
      if (matchCount <= 1) return;

      // Navigate to previous match with left arrow or up arrow
      if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        console.log("Keyboard navigation: Previous match");
        handlePreviousMatch();
      }
      // Navigate to next match with right arrow or down arrow
      else if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        console.log("Keyboard navigation: Next match");
        handleNextMatch();
      }
    };

    // Add event listener for keyboard navigation
    window.addEventListener("keydown", handleKeyDown);

    // Clean up event listener on unmount
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [matchCount, handlePreviousMatch, handleNextMatch]);

  return (
    <div className='flex flex-col h-full'>
      <TextHighlightNav
        matchCount={matchCount}
        currentMatchIndex={currentMatchIndex}
        onPreviousMatch={handlePreviousMatch}
        onNextMatch={handleNextMatch}
      />
      <div ref={contentRef} className='overflow-auto'>
        {highlightedContent}
      </div>
    </div>
  );
}
