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
import { NodeDetails } from "@/components/common/types/types";
import { Folder, FolderOpen, File } from "lucide-react";
import { useContextMenu } from "react-contexify";
import "react-contexify/dist/ReactContexify.css";
import { useSnapshot } from "valtio";
import { useSelectedFile } from "@/components/common/hooks/useSelectedFile";
import { useHighlighting } from "@/components/Search";
import { useRef } from "react";
import { NODE_KINDS } from "@/components/common/types/constants";
import { NodeContextMenu } from "../FileOperations/NodeContextMenu";
import { toPlatformPath } from "@/components/common/functions/platform_frontend";
// import { deleteFileSystemItem } from "@/components/FileOperations/fileOperations";
// import { toast } from "react-hot-toast";
import {
  valtioTreeStates,
  treeActions,
} from "@/components/common/globalStateMgt/valtioTreeStates";

interface NodeViewProps {
  node: NodeDetails;
  level: number;
  onNavigate: (path: string) => void;
  onRefresh: (nodePath: string, level?: number) => Promise<void>;
}

export const NodeView = ({
  node,
  level,
  onNavigate,
  onRefresh: onRefreshVal,
}: NodeViewProps) => {
  const { theme } = useTheme();
  const { show: contextMenu } = useContextMenu({ id: node.path });
  const { selectedFile, selectFile } = useSelectedFile();
  const { getHighlightInfo } = useHighlighting();
  const snap = useSnapshot(valtioTreeStates);

  // Get highlight info for this node
  const { isHighlighted, matchCount, highlightBg, highlightText } =
    getHighlightInfo(toPlatformPath(node.path));

  const nodeRef = useRef<HTMLDivElement>(null);

  const expanded = treeActions.isNodeExpanded(node.path);
  const loading = treeActions.isNodeLoading(node.path);
  const sortedChildren = expanded
    ? treeActions.getSortedChildren(node.path)
    : [];

  // Check if this node is the currently selected file
  const isSelected = selectedFile && selectedFile.path === node.path;

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (node.kind === NODE_KINDS.DIRECTORY) {
      treeActions.toggleNodeExpansion(node.path);
    }
    selectFile(node);
  };

  const handleItemClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    treeActions.toggleNodeExpansion(node.path);
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    contextMenu({ event: e });
  };

  return (
    <div
      ref={nodeRef}
      className='select-none'
      data-force-update={snap.updateTrigger}
      key={`${node.path}-${sortedChildren.length}`}>
      <div
        className={`flex items-center py-1 px-2 rounded cursor-pointer ${
          isSelected
            ? `${theme.bg.lo} border-l-4 ${theme.border.hi}`
            : theme.hover.lo
        } ${highlightBg}`}
        style={{ paddingLeft: `${level * 16 + (isSelected ? 4 : 8)}px` }}
        onClick={handleClick}
        data-path={node.path}
        data-allow-context-menu='true'
        onContextMenu={handleContextMenu}>
        <div className='flex items-center flex-1'>
          {node.kind === NODE_KINDS.DIRECTORY ? (
            (node.children && node.children.length > 0) || loading ? (
              <span
                className={`mr-1 ${
                  isSelected ? theme.fg.hi : theme.fg.med
                } cursor-pointer`}
                onClick={handleItemClick}></span>
            ) : (
              <span className='w-4 mr-1'></span>
            )
          ) : (
            <span className='w-4 mr-1'></span>
          )}
          <span className={`mr-2 ${isSelected ? theme.fg.hi : theme.fg.med}`}>
            {node.kind === NODE_KINDS.DIRECTORY ? (
              expanded ? (
                <FolderOpen
                  className={`w-4 h-4 ${
                    isSelected ? "stroke-2" : ""
                  } text-blue-500 dark:text-blue-400`}
                />
              ) : (
                <Folder
                  className={`w-4 h-4 ${
                    isSelected ? "stroke-2" : ""
                  } text-blue-500 dark:text-blue-400`}
                />
              )
            ) : (
              <File
                className={`w-4 h-4 ${
                  isSelected ? "stroke-2" : ""
                } text-yellow-500 dark:text-yellow-400`}
              />
            )}
          </span>
          <span
            className={`${
              isSelected ? `${theme.fg.hi} font-semibold` : theme.fg.hi
            } ${highlightText}`}>
            {node.name}
          </span>

          {/* Show match count badge if highlighted */}
          {isHighlighted && matchCount > 0 && (
            <span className='ml-2 text-xs py-0.5 px-1.5 rounded-full bg-blue-200 dark:bg-blue-700 text-blue-800 dark:text-blue-200'>
              {matchCount}
            </span>
          )}
        </div>
        {/* <button
          onClick={handleDelete}
          className={`ml-2 p-1 rounded hover:bg-red-500/20 text-gray-500 hover:text-red-500`}
          title='Delete'>
          <Trash2 className='w-4 h-4' />
        </button> */}
      </div>

      <NodeContextMenu
        node={node}
        onRefresh={async (level) => {
          await treeActions.refreshNodeChildren(node.path, level);
          return;
        }}
      />

      {expanded && sortedChildren.length > 0 && (
        <div>
          {sortedChildren.map((child) => {
            const childWithParent: NodeDetails = {
              ...child,
              parentPath: node.path,
            };

            return (
              <NodeView
                key={child.path}
                node={childWithParent}
                level={level + 1}
                onNavigate={onNavigate}
                onRefresh={onRefreshVal}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};
