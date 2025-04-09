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
import {
  jotaiPathStates,
  useAtom,
} from "@/components/common/globalStateMgt/jotaiPathStates";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function Navigation() {
  const { theme } = useTheme();
  const [paths] = useAtom(jotaiPathStates.pathsState);
  const [pathIndex, setPathIndex] = useAtom(jotaiPathStates.pathIndexState);

  const handleBack = () => {
    if (pathIndex > 0) {
      setPathIndex(pathIndex - 1);
    }
  };

  const handleForward = () => {
    if (pathIndex < paths.length - 1) {
      setPathIndex(pathIndex + 1);
    }
  };

  const canGoBack = pathIndex > 0;
  const canGoForward = pathIndex < paths.length - 1;

  return (
    <div className='flex items-center gap-1'>
      <button
        onClick={handleBack}
        disabled={!canGoBack}
        className={`p-1.5 rounded-full transition-all duration-200 ${
          canGoBack ? `${theme.fg.hi} hover:${theme.bg.med}` : theme.fg.lo
        }`}
        title='Go back'>
        <ChevronLeft className='h-5 w-5' />
      </button>
      <button
        onClick={handleForward}
        disabled={!canGoForward}
        className={`p-1.5 rounded-full transition-all duration-200 ${
          canGoForward ? `${theme.fg.hi} hover:${theme.bg.med}` : theme.fg.lo
        }`}
        title='Go forward'>
        <ChevronRight className='h-5 w-5' />
      </button>
    </div>
  );
}
