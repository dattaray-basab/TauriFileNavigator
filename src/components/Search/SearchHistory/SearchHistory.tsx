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
 */

import React from "react";
import { useAtom } from "jotai";
import {
  searchHistoryAtom,
  searchHistoryManagerAtom,
} from "@/components/common/globalStateMgt/jotaiSearchStates";
import { useTheme } from "@/components/common";
import { X as XIcon } from "lucide-react";

interface SearchHistoryProps {
  onSelectSearch: (searchTerm: string) => void;
}

export const SearchHistory: React.FC<SearchHistoryProps> = ({
  onSelectSearch,
}) => {
  const [searchHistory] = useAtom(searchHistoryAtom);
  const [, setSearchHistoryManager] = useAtom(searchHistoryManagerAtom);
  const { theme } = useTheme();

  const handleClearHistory = () => {
    setSearchHistoryManager({ type: "CLEAR" });
  };

  if (searchHistory.length === 0) {
    return null;
  }

  return (
    <div
      className={`flex flex-col h-full ${theme.bg.hi} ${theme.fg.hi} border rounded-md ${theme.border.lo}`}>
      <div
        className={`flex-shrink-0 p-2 ${theme.bg.hi} ${theme.fg.hi} text-sm font-medium flex justify-between items-center rounded-t-md border-b ${theme.border.lo}`}>
        <span>Recent Searches</span>
        <button
          onClick={handleClearHistory}
          className={`flex items-center text-xs px-2 py-1 rounded min-w-[80px] justify-center 
            border border-blue-400 hover:border-2 hover:border-blue-500 hover:font-semibold
            focus:ring focus:ring-blue-300 transition-all duration-200
            ${theme.bg.lo} ${theme.fg.hi} hover:${theme.bg.med}`}>
          <XIcon className='h-3 w-3 mr-1' />
          <span>Clear History</span>
        </button>
      </div>
      <div className='flex-1 min-h-0'>
        <ul className='h-full overflow-y-auto'>
          {searchHistory.map((term, index) => (
            <li
              key={index}
              className={`p-2 hover:${theme.bg.lo} cursor-pointer flex items-center text-sm`}
              onClick={() => onSelectSearch(term)}>
              <span className='mr-2 text-xs opacity-50'>{index + 1}.</span>
              <span className='truncate'>{term}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
