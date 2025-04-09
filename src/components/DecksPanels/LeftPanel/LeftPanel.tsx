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
import { useState } from "react";
import { useTheme } from "@/components/common";
import { SearchIcon, Star } from "lucide-react";
import { Favorites } from "./Favorites";
import { Search } from "@/components/Search";

type Tab = "favorites" | "search";

export function LeftPanel() {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState<Tab>("favorites");

  const getTabButtonClass = (isActive: boolean) => {
    return `flex-1 py-1 flex justify-center items-center transition-all duration-200 ease-in-out ${
      theme.highlight.focus
    } ${
      isActive
        ? `${theme.highlight.badge} font-medium relative z-10`
        : `${theme.bg.med} ${theme.fg.med} hover:${theme.hover.hi}`
    }`;
  };

  return (
    <div
      className={`flex flex-col h-full ${theme.bg.med} border-r shadow-md relative z-10 min-w-[300px]`}>
      {/* Tab navigation with icons instead of text */}
      <div className={`flex relative`}>
        <button
          className={getTabButtonClass(activeTab === "favorites")}
          onClick={() => setActiveTab("favorites")}
          title='Favorites'>
          <Star className='h-5 w-5' />
        </button>
        <button
          className={getTabButtonClass(activeTab === "search")}
          onClick={() => setActiveTab("search")}
          title='Search'>
          <SearchIcon className='h-5 w-5' />
        </button>
      </div>

      {/* Tab content */}
      <div className={`flex-1 overflow-auto ${theme.highlight.badge} -mt-px`}>
        {activeTab === "favorites" ? <Favorites /> : <Search />}
      </div>
    </div>
  );
}
