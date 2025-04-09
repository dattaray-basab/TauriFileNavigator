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
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTheme } from "@/components/common";

interface TextHighlightNavProps {
  matchCount: number;
  currentMatchIndex: number;
  onPreviousMatch: () => void;
  onNextMatch: () => void;
}

export function TextHighlightNav({
  matchCount,
  currentMatchIndex,
  onPreviousMatch,
  onNextMatch,
}: TextHighlightNavProps) {
  const { theme } = useTheme();

  if (matchCount <= 0) return null;

  // Ensure currentMatchIndex is valid
  const displayIndex =
    matchCount > 0 ? Math.min(currentMatchIndex, matchCount - 1) + 1 : 0;

  const handlePreviousClick = () => {
    if (matchCount > 1) {
      console.log("Previous match clicked");
      onPreviousMatch();
    }
  };

  const handleNextClick = () => {
    if (matchCount > 1) {
      console.log("Next match clicked");
      onNextMatch();
    }
  };

  return (
    <div className='flex items-center p-2 border-b border-gray-200 dark:border-gray-700'>
      <div
        className={
          matchCount > 1 ? theme.navButton.enabled : theme.navButton.disabled
        }
        title='Previous match'
        onClick={handlePreviousClick}>
        <ChevronLeft className='h-5 w-5' />
      </div>
      <span className={`mx-2 ${theme.navButton.counter}`}>
        {displayIndex} of {matchCount}
      </span>
      <div
        className={
          matchCount > 1 ? theme.navButton.enabled : theme.navButton.disabled
        }
        title='Next match'
        onClick={handleNextClick}>
        <ChevronRight className='h-5 w-5' />
      </div>
    </div>
  );
}
