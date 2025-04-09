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
import { useTheme } from "@/components/common";
import { SearchInput } from "./SearchInput/SearchInput";

export function Search() {
  const { theme } = useTheme();
  const searchTimeout = 3600; // Default 60 minutes (3600 seconds)

  return (
    <div className={`h-full flex flex-col ${theme.bg.hi}`}>
      <div
        className={`${theme.highlight.badge} py-2 flex items-center justify-center flex-shrink-0`}
        role='heading'
        aria-level={2}>
        <h2 className={`text-sm font-semibold`}>Search</h2>
      </div>

      <div className='flex-1 min-h-0 overflow-hidden'>
        <SearchInput searchTimeout={searchTimeout} />
      </div>
    </div>
  );
}
