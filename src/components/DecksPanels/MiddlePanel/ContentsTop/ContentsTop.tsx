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
import { Navigation } from "./Navigation";
import { PathInput } from "./PathInput";

export function ContentsTop() {
  const { theme } = useTheme();

  return (
    <div className='w-full'>
      <div
        className={`flex flex-wrap items-center px-4 py-2 border-b-[3px] 
                    ${theme.border.hi} ${theme.shadow.med} relative ${theme.bg.med} 
                    gap-2 z-10 after:content-[""] after:absolute 
                    after:bottom-0 after:left-0 after:right-0 
                    after:border-b after:${theme.border.lo}`}>
        {/* Navigation Component */}
        <div className='flex-grow sm:flex-grow-0'>
          <Navigation />
        </div>

        {/* Path Display Component */}
        <div className='w-full sm:flex-1 min-w-[300px]'>
          <PathInput />
        </div>
      </div>
    </div>
  );
}
