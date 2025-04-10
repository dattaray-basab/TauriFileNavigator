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

import { FolderIcon, HardDrive, RefreshCw } from "lucide-react";
import { useTheme } from "@/components/common";
import {
  jotaiPathStates,
  useAtom,
} from "../../common/globalStateMgt/jotaiPathStates";
import { useSetAtom } from "jotai";
import { useSelectedFile } from "@/components/common/hooks/useSelectedFile";
import { useState, useCallback, memo, useEffect, useMemo } from "react";
import { useContextMenu } from "react-contexify";
import { LeftPanelContextMenu } from "./LeftPanelContextMenu";
import { invoke } from "@tauri-apps/api/tauri";

import { usePreventDefaultContextMenu } from "@/components/common/hooks/usePreventDefaultContextMenu";
import { treeActions } from "../../common/globalStateMgt/valtioTreeStates";
import { useSnapshot } from "valtio";
import { valtioTreeStates } from "../../common/globalStateMgt/valtioTreeStates";
import { toPlatformPath } from "@/components/common/functions/platform";
import { FORWARD_SLASH } from "@/components/common/constants/filesys";

type FavoritesListProps = {
  paths: string[];
  onFavoriteClick: (path: string) => void;
  onContextMenu: (e: React.MouseEvent<HTMLDivElement>, path: string) => void;
};

interface PathItem {
  path: string;
  displayPath: string;
  displayName: string;
  isSystem: boolean;
  customLabel?: string;
}

function sortPaths(paths: string[]): PathItem[] {
  return paths
    .map((path) => {
      // Handle paths with custom labels (format: "path|label")
      const [actualPath, customLabel] = path.split("|");
      const displayPath = toPlatformPath(actualPath);
      return {
        path: actualPath,
        displayPath,
        displayName:
          customLabel || displayPath.split(FORWARD_SLASH).pop() || displayPath,
        customLabel,
        isSystem:
          actualPath.startsWith("/Applications") ||
          actualPath.startsWith("/System") ||
          actualPath.startsWith("/Library"),
      };
    })
    .sort((a, b) => {
      // First sort by system vs user
      if (a.isSystem !== b.isSystem) {
        return a.isSystem ? -1 : 1;
      }
      // Then alphabetically
      return a.displayName.localeCompare(b.displayName);
    });
}

function maintainSortedPaths(paths: string[]): string[] {
  // First convert to PathItems
  const pathItems = paths.map((path) => {
    // If path contains a label, preserve the original path
    if (path.includes("|")) {
      const [actualPath] = path.split("|");
      return {
        originalPath: path,
        path: actualPath,
        isSystem:
          actualPath.startsWith("/Applications") ||
          actualPath.startsWith("/System") ||
          actualPath.startsWith("/Library"),
      };
    }
    // No label case
    return {
      originalPath: path,
      path: path,
      isSystem:
        path.startsWith("/Applications") ||
        path.startsWith("/System") ||
        path.startsWith("/Library"),
    };
  });

  // Sort according to our rules
  return pathItems
    .sort((a, b) => {
      // First sort by system vs user
      if (a.isSystem !== b.isSystem) {
        return a.isSystem ? -1 : 1;
      }
      // Then alphabetically
      return a.path.localeCompare(b.path);
    })
    .map((item) => item.originalPath);
}

export function Favorites() {
  const { theme } = useTheme();
  const setPaths = useSetAtom(jotaiPathStates.pathsState);
  const [pathIndex, setPathIndex] = useAtom(jotaiPathStates.pathIndexState);
  // const setSelectedPathinfo = useSetAtom(jotaiPathStates.selectedPathinfoState);
  const [selectedPath, setSelectedPath] = useState<string | null>(null);

  const [favoritePaths, setFavoritesRaw] = useAtom(
    jotaiPathStates.favoritePathsState
  );

  // Wrap setFavoritePaths to always maintain sort order
  const setFavoritePaths = useCallback(
    (paths: string[] | ((prev: string[]) => string[])) => {
      if (typeof paths === "function") {
        setFavoritesRaw((prev) => maintainSortedPaths(paths(prev)));
      } else {
        setFavoritesRaw(maintainSortedPaths(paths));
      }
    },
    [setFavoritesRaw]
  );

  const { show } = useContextMenu({ id: "left-panel-context-menu" });

  const { selectFile } = useSelectedFile();

  // Use the custom hook for context menu prevention
  usePreventDefaultContextMenu();

  const handleFavoriteClick = useCallback(
    async (path: string) => {
      // setSelectedPathinfo(undefined);
      selectFile(null);
      const treeStateReset = new CustomEvent("reset-tree-state");
      window.dispatchEvent(treeStateReset);
      setPaths((oldPaths: string[]) => [...oldPaths, path]);
      setPathIndex(pathIndex + 1);

      // Load the root tree first
      await treeActions.loadRootTree(path);

      // Add the path to expanded paths and load its children
      valtioTreeStates.expandedPaths.add(path);
      await treeActions.loadNodeChildren(path);

      // Force a UI update
      valtioTreeStates.updateTrigger++;
    },
    [selectFile, setPaths, pathIndex, setPathIndex]
  );

  // Add explicit return types
  const handleRemovePath = async (pathToRemove: string): Promise<void> => {
    try {
      // Extract the actual path without any custom label
      const [actualPath] = pathToRemove.split("|");

      // Filter out the path, considering both labeled and unlabeled versions
      const filteredPaths = favoritePaths.filter((p) => {
        const [pActual] = p.split("|");
        return pActual !== actualPath;
      });

      setFavoritePaths(filteredPaths);
      console.log("[Favorites] Removed path:", pathToRemove);
    } catch (error) {
      console.error("[Favorites] Error removing favorite path:", error);
      throw error;
    }
  };

  // Add event type for context menu
  const handleContextMenu = (
    e: React.MouseEvent<HTMLDivElement>,
    path: string
  ): void => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedPath(path);
    show({ event: e });
  };

  const handleAddDefaultFavPaths = useCallback(async () => {
    try {
      const drives = await invoke<string[]>("get_default_paths");
      // Add new drives while preserving existing favorites and maintaining sort order
      setFavoritePaths((currentPaths) => {
        const newPaths = drives.filter((drive) => {
          const [drivePath] = drive.split("|");
          return !currentPaths.some((currentPath) => {
            const [currentPathActual] = currentPath.split("|");
            return currentPathActual === drivePath;
          });
        });
        return maintainSortedPaths([...currentPaths, ...newPaths]);
      });
      console.log("[Favorites] Added system drives:", drives);
    } catch (error) {
      console.error("[Favorites] Error adding system drives:", error);
    }
  }, [setFavoritePaths]);

  const handleResetFavorites = useCallback(async () => {
    try {
      // Get the default drives
      const defaultFavPaths = await invoke<string[]>("get_default_paths");

      // Replace all favorites with the defaults
      setFavoritePaths(defaultFavPaths);

      console.log("[Favorites] Reset favorites to defaults:", defaultFavPaths);
    } catch (error) {
      console.error("[Favorites] Error resetting favorites:", error);
    }
  }, [setFavoritePaths]);

  // Load drives on mount if no favorites exist
  useEffect(() => {
    if (favoritePaths.length === 0) {
      handleAddDefaultFavPaths();
    }
  }, [favoritePaths.length, handleAddDefaultFavPaths]);

  // Memoize the nav content
  const FavoritesList = memo<FavoritesListProps>(
    ({ paths, onFavoriteClick, onContextMenu }) => {
      const { currentPath } = useSnapshot(valtioTreeStates);
      const sortedPaths = useMemo(() => sortPaths(paths), [paths]);

      return paths.length === 0 ? (
        <div className='text-sm text-gray-500 dark:text-gray-400 p-2'>
          No favorites yet
        </div>
      ) : (
        <div className='space-y-1'>
          {sortedPaths.map(({ path, displayName, isSystem }) => {
            const isSelected = currentPath === path;

            return (
              <div
                key={path}
                onContextMenu={(e) => onContextMenu(e, path)}
                className='relative'
                data-allow-context-menu='true'>
                <a
                  href='#'
                  onClick={(e) => {
                    e.preventDefault();
                    onFavoriteClick(path);
                  }}
                  role='button'
                  aria-label={`Open favorite folder ${displayName}`}
                  className={`flex items-center px-2 py-1.5 text-sm rounded-md 
                  ${theme.bg.hi} ${theme.fg.med} ${theme.hover.lo} truncate
                  ${isSelected ? "font-bold" : "font-normal"}
                  ${isSystem ? "italic" : ""}`}
                  id={`favorite-${path}`}>
                  <FolderIcon
                    className={`mr-2 h-4 w-4 flex-shrink-0 text-blue-500 dark:text-blue-400`}
                  />
                  <span className='truncate'>{displayName}</span>
                </a>
              </div>
            );
          })}
        </div>
      );
    }
  );

  return (
    <div
      data-testid='favorites-container'
      className={`h-full flex flex-col ${theme.bg.hi}`}
      role='navigation'
      aria-label='Favorites'>
      <div
        className={`${theme.highlight.badge} py-2 flex items-center justify-between sticky top-0 z-10 px-4`}
        role='heading'
        aria-level={2}>
        <h2 className={`text-sm font-semibold`}>Favorites</h2>
        <div className='flex space-x-2'>
          <button
            onClick={handleAddDefaultFavPaths}
            className={`p-1 rounded-md ${theme.hover.lo}`}
            aria-label='Add default directories'
            title='Add default directories to favorites'>
            <HardDrive className='w-4 h-4' />
          </button>
          <button
            onClick={handleResetFavorites}
            className={`p-1 rounded-md ${theme.hover.lo}`}
            aria-label='Reset favorites'
            title='Reset favorites to default directories'>
            <RefreshCw className='w-4 h-4' />
          </button>
        </div>
      </div>
      <nav className='space-y-1 p-4 overflow-auto flex-1'>
        <FavoritesList
          paths={favoritePaths}
          onFavoriteClick={handleFavoriteClick}
          onContextMenu={handleContextMenu}
        />
      </nav>

      <LeftPanelContextMenu
        selectedPath={selectedPath}
        onRemove={handleRemovePath}
      />
    </div>
  );
}
