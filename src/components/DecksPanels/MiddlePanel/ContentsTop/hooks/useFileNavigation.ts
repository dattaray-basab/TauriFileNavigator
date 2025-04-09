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
import { jotaiPathStates } from "@/components/common/globalStateMgt/jotaiPathStates";
import { useAtom } from "jotai";
import { useCallback } from "react";

export const useFileNavigation = () => {
  const [paths, setPaths] = useAtom(jotaiPathStates.pathsState);
  const [pathIndex, setPathIndex] = useAtom(jotaiPathStates.pathIndexState);

  const navigateToDirectory = useCallback(
    (dirPath: string) => {
      setPaths((oldPath) => [...oldPath.slice(0, pathIndex + 1), dirPath]);
      setPathIndex((i) => i + 1);
    },
    [pathIndex, setPaths, setPathIndex]
  );

  const navigateBack = useCallback(() => {
    if (pathIndex > 0) {
      setPathIndex((i) => i - 1);
    }
  }, [pathIndex, setPathIndex]);

  const navigateForward = useCallback(() => {
    if (pathIndex < paths.length - 1) {
      setPathIndex((i) => i + 1);
    }
  }, [paths.length, pathIndex, setPathIndex]);


  return {
    navigateToDirectory,
    navigateBack,
    navigateForward,
    currentPath: paths[pathIndex],
    canGoBack: pathIndex > 0,
    canGoForward: pathIndex < paths.length - 1,
    pathIndex,
  };
};
