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
import { FolderIcon } from "lucide-react";
// import { Input } from "../../../CommonUI/input";
import {
  jotaiPathStates,
  useAtom,
} from "../../../common/globalStateMgt/jotaiPathStates";
import { useEffect, useState } from "react";

export const PathInput = () => {
  const { theme } = useTheme();
  const [pathInput, setPathInput] = useState<string>("");
  const [pathIndex] = useAtom(jotaiPathStates.pathIndexState);
  const [paths] = useAtom(jotaiPathStates.pathsState);

  useEffect(() => {
    // Keep pathInput in sync with current path
    const currentPath = paths[pathIndex] ?? "";
    if (pathInput !== currentPath) {
      setPathInput(currentPath);
    }
  }, [paths, pathIndex]);

  return (
    <div className='flex-1 min-w-0 grow relative'>
      <FolderIcon
        className={`absolute left-2 top-2 h-4 w-4 text-blue-500 dark:text-blue-400`}
      />
      <div
        className={`h-8 w-full pl-9 text-sm ${theme.bg.med} ${theme.fg.hi} border ${theme.border.hi} rounded flex items-center overflow-hidden`}>
        <div className='truncate'>{pathInput}</div>
      </div>
    </div>
  );
};
