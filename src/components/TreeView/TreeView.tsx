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
import { useEffect, useCallback } from "react";
import { useSnapshot } from "valtio";
import { NodeView } from "./NodeView";
import { useTheme } from "@/components/common";
import { useFileNavigation } from "../DecksPanels/MiddlePanel/ContentsTop/hooks/useFileNavigation";
import { NodeContextMenu } from "../FileOperations/NodeContextMenu";
import { usePreventDefaultContextMenu } from "@/components/common/hooks/usePreventDefaultContextMenu";
import {
  valtioTreeStates,
  treeActions,
} from "@/components/common/globalStateMgt/valtioTreeStates";
import { NodeDetails } from "@/components/common/types/types";
import { NODE_KINDS } from "@/components/common/types/constants";
import { toPlatformPath } from "@/components/common/functions/platform";
import { FORWARD_SLASH } from "@/components/common/constants/filesys";

const ERRORS = {
  NOT_FOUND: "No such file or directory",
};

export const TreeView = () => {
  const { navigateToDirectory } = useFileNavigation();
  const { theme } = useTheme();
  const snap = useSnapshot(valtioTreeStates);

  // Use the custom hook for context menu prevention
  usePreventDefaultContextMenu();

  useEffect(() => {
    if (!snap.currentPath) {
      return; // Don't load anything if no path is selected
    }

    // Load the selected path
    treeActions.loadRootTree(snap.currentPath);

    // Ensure the path is expanded and its children are loaded
    valtioTreeStates.expandedPaths.add(snap.currentPath);
    treeActions.loadNodeChildren(snap.currentPath);

    // Force UI update
    valtioTreeStates.updateTrigger++;
  }, [snap.currentPath]);

  // Create wrapper functions that match the expected types
  const handleRefresh = useCallback(
    async (level?: number) => {
      if (!snap.currentPath) return;
      await treeActions.refreshNodeChildren(snap.currentPath, level);
    },
    [snap.currentPath]
  );

  const handleNodeRefresh = useCallback(
    async (nodePath: string, level?: number) => {
      await treeActions.refreshNodeChildren(nodePath, level);
    },
    []
  );

  const handleNodeClick = useCallback(
    (path: string) => {
      navigateToDirectory(toPlatformPath(path));
    },
    [navigateToDirectory]
  );

  if (snap.error) {
    return (
      <div
        role='alert'
        className={
          snap.error === ERRORS.NOT_FOUND
            ? `h-full ${theme.bg.hi}`
            : `p-4 ${theme.fg.lo} text-sm`
        }>
        {snap.error !== ERRORS.NOT_FOUND && "Unable to load content"}
      </div>
    );
  }

  // Return empty div if no path is selected
  if (!snap.currentPath) {
    return <div role='status' className={`h-full ${theme.bg.hi}`} />;
  }

  // Only create and render root node if we have a current path
  const rootNode: NodeDetails = {
    name:
      snap.currentPath === FORWARD_SLASH
        ? FORWARD_SLASH
        : snap.currentPath.split(FORWARD_SLASH).pop() || FORWARD_SLASH,
    path: snap.currentPath,
    kind: NODE_KINDS.DIRECTORY,
    created: new Date(),
    modified: new Date(),
    children: snap.sortedLocalData,
    hidden: false,
    parentPath:
      snap.currentPath.split(FORWARD_SLASH).slice(0, -1).join(FORWARD_SLASH) ||
      FORWARD_SLASH,
    size: 0,
  };

  return (
    <div
      className={`p-2 ${theme.bg.hi} space-y-0 overflow-auto whitespace-nowrap`}
      key={snap.currentPath}>
      <NodeContextMenu node={rootNode} onRefresh={handleRefresh} />
      <NodeView
        key={rootNode.path}
        node={rootNode}
        level={0}
        onNavigate={handleNodeClick}
        onRefresh={handleNodeRefresh}
      />
    </div>
  );
};
