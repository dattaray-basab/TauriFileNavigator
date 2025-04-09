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
 * The author would like to give special thanks to the contributors of https://github.com/Souvlaki42/file-manager.git for providing inspiration for this project
 */

import { proxy, subscribe } from "valtio";
import { NodeDetails } from "@/components/common/types/types";
import { getTreeData } from "@/components/common/types/getTreeData";
import { sortItems } from "../functions/sortItems";
import { valtioToggleStates } from "./valtioToggleStates";
import { FORWARD_SLASH } from "../constants/filesys";

interface TreeNode {
  name: string;
  path: string;
  isDirectory: boolean;
  children?: TreeNode[];
  isExpanded?: boolean;
}

interface TreeState {
  currentPath: string;
  rootNode: TreeNode | null;
  sortedLocalData: NodeDetails[];
  childrenMap: Record<string, NodeDetails[]>;
  error: string | null;
  loadingNodes: Set<string>;
  expandedPaths: Set<string>;
  updateTrigger: number;
}

export const valtioTreeStates = proxy<TreeState>({
  currentPath: "",
  rootNode: null,
  sortedLocalData: [],
  childrenMap: {},
  error: null,
  loadingNodes: new Set(),
  expandedPaths: new Set(),
  updateTrigger: 0,
});

// Subscribe to valtioToggleStates changes
// toggleGroupSort clicked
// ↓
// valtioToggleStates.isGroupSort changes
// ↓
// subscription triggers
// ↓
// resortAll() executes
// ↓
// all tree data is re-sorted
// ↓
// updateTrigger increments
// ↓
// tree view re-renders with new sort order
subscribe(valtioToggleStates, () => {
  // Re-sort everything when groupSort changes
  treeActions.resortAll();
});

// Tree operations
export const treeActions = {
  isNodeExpanded: (path: string): boolean => {
    return valtioTreeStates.expandedPaths.has(path);
  },

  isNodeLoading: (path: string): boolean => {
    return valtioTreeStates.loadingNodes.has(path);
  },

  openParentNodeIfClosed: (path: string) => {
    const parentPath = path.substring(0, path.lastIndexOf(FORWARD_SLASH));
    const isExpanded = valtioTreeStates.expandedPaths.has(parentPath);
    if (!isExpanded) {
      valtioTreeStates.expandedPaths.add(path);
    }
    valtioTreeStates.updateTrigger++;
  },

  toggleNodeExpansion: async (path: string) => {
    const isExpanded = valtioTreeStates.expandedPaths.has(path);
    if (isExpanded) {
      valtioTreeStates.expandedPaths.delete(path);
    } else {
      valtioTreeStates.expandedPaths.add(path);
      // Load children if not in cache
      if (!valtioTreeStates.childrenMap[path]) {
        await treeActions.loadNodeChildren(path);
      }
    }
    valtioTreeStates.updateTrigger++;
  },

  expandAncestry: (path: string) => {
    const sep = FORWARD_SLASH;
    const parts = path.split(sep);
    let currentPath = "";
    for (const part of parts) {
      currentPath = currentPath ? `${currentPath}${sep}${part}` : part;
      valtioTreeStates.expandedPaths.add(currentPath);
    }
    valtioTreeStates.updateTrigger++;
  },

  loadNodeChildren: async (nodePath: string): Promise<void> => {
    if (valtioTreeStates.loadingNodes.has(nodePath)) return;

    try {
      valtioTreeStates.loadingNodes.add(nodePath);
      const contents = await getTreeData(nodePath, false);
      valtioTreeStates.childrenMap[nodePath] = treeActions.sortNodes(contents);
    } catch (err) {
      console.error(`Error loading children for ${nodePath}:`, err);
    } finally {
      valtioTreeStates.loadingNodes.delete(nodePath);
      valtioTreeStates.updateTrigger++;
    }
  },

  refreshNodeChildren: async (
    nodePath: string,
    levelsUp: number = 0
  ): Promise<NodeDetails[]> => {
    try {
      if (levelsUp > 0) {
        const parentPath = nodePath.substring(
          0,
          nodePath.lastIndexOf(FORWARD_SLASH)
        );
        if (!parentPath) return [];

        const parentContents = await getTreeData(parentPath, false);

        // Clean up the cache
        delete valtioTreeStates.childrenMap[nodePath];
        Object.keys(valtioTreeStates.childrenMap).forEach((key) => {
          if (key.startsWith(nodePath + FORWARD_SLASH)) {
            delete valtioTreeStates.childrenMap[key];
          }
        });

        // Update parent's children
        valtioTreeStates.childrenMap[parentPath] =
          treeActions.sortNodes(parentContents);

        // Update sorted local data if we're at root level
        if (parentPath === valtioTreeStates.currentPath) {
          valtioTreeStates.sortedLocalData =
            treeActions.sortNodes(parentContents);
        }

        // Force expansion by first removing from expandedPaths
        valtioTreeStates.expandedPaths.delete(parentPath);
        await treeActions.toggleNodeExpansion(parentPath);

        valtioTreeStates.updateTrigger++;
        return parentContents;
      } else {
        const contents = await getTreeData(nodePath, false);
        valtioTreeStates.childrenMap[nodePath] =
          treeActions.sortNodes(contents);

        // Handle parent expansion in the same way
        const parentPath = nodePath.substring(
          0,
          nodePath.lastIndexOf(FORWARD_SLASH)
        );
        if (parentPath) {
          // Force expansion by first removing from expandedPaths
          valtioTreeStates.expandedPaths.delete(parentPath);
          await treeActions.toggleNodeExpansion(parentPath);
        }

        valtioTreeStates.updateTrigger++;
        return contents;
      }
    } catch (err) {
      console.error(`Error refreshing children for ${nodePath}:`, err);
      return [];
    }
  },

  loadRootTree: async (path: string): Promise<void> => {
    try {
      valtioTreeStates.error = null;
      valtioTreeStates.currentPath = path;
      const contents = await getTreeData(path, false);
      valtioTreeStates.sortedLocalData = treeActions.sortNodes(contents);
    } catch (err) {
      console.error("Error loading root tree:", err);
      valtioTreeStates.error = err instanceof Error ? err.message : String(err);
      valtioTreeStates.sortedLocalData = [];
    }
    valtioTreeStates.updateTrigger++;
  },

  resortAll: () => {
    // Re-sort the root level data
    if (valtioTreeStates.sortedLocalData.length > 0) {
      valtioTreeStates.sortedLocalData = treeActions.sortNodes([
        ...valtioTreeStates.sortedLocalData,
      ]);
    }

    // Re-sort all children in the childrenMap
    Object.entries(valtioTreeStates.childrenMap).forEach(([path, nodes]) => {
      valtioTreeStates.childrenMap[path] = treeActions.sortNodes([...nodes]);
    });

    // Increment update trigger to force re-render
    valtioTreeStates.updateTrigger++;
  },

  sortNodes: (nodes: NodeDetails[]): NodeDetails[] => {
    const sorted = sortItems(nodes, valtioToggleStates.isGroupSort);
    return sorted;
  },

  getSortedChildren: (path: string): NodeDetails[] => {
    return valtioTreeStates.childrenMap[path] || [];
  },
};
