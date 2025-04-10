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
import { NodeDetails } from "@/components/common/types/types";
import { MenuOps } from "@/components/common/menu/MenuOps";
import { useAtom } from "jotai";
import { jotaiPathStates } from "@/components/common/globalStateMgt/jotaiPathStates";
import { FetchItemNameModal } from "./FetchItemNameModal";
import { Menu, Item } from "react-contexify";
import { ConfirmModal } from "@/components/FileOperations/ConfirmModal";
import {
  NODE_KINDS,
  MENU_OPERATIONS,
} from "@/components/common/types/constants";
import { deleteFileSystemItem } from "@/components/FileOperations/fileOperations";
import { toast } from "sonner";
import { valtioTreeStates } from "@/components/common/globalStateMgt/valtioTreeStates";

interface NodeDetailsContextMenuProps {
  node: NodeDetails;
  onRefresh: (level?: number) => Promise<void>;
}

// Define a type for menu items
interface MenuItem {
  label: string;
  actionId: string;
  onClick: () => void;
  data: NodeDetails | null;
  disabled?: boolean;
}

export const NodeContextMenu = ({
  node,
  onRefresh: onRefreshSubtree,
}: NodeDetailsContextMenuProps) => {
  const [favoritePaths, setFavoritePaths] = useAtom(
    jotaiPathStates.favoritePathsState
  );
  const [fetchFolderName, setFetchFolderName] = useState(false);
  const [fetchFileName, setFetchFileName] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);

  const isDirectory = node.kind === NODE_KINDS.DIRECTORY;
  // const [, setRefreshed] = useAtom(jotaiPathStates.refreshedState);

  // Check if this is the root node
  const isRootNode = node.path === valtioTreeStates.currentPath;

  // Add to favorites
  const addToFavorites = () => {
    if (!favoritePaths.includes(node.path)) {
      const newPaths = [...favoritePaths, node.path];
      setFavoritePaths(newPaths);
    }
  };

  // Then use this type for your menuItems array
  let menuItems: MenuItem[] = [
    {
      label: MENU_OPERATIONS.ADD_TO_FAVORITES,
      actionId: "addToFavorites",
      onClick: addToFavorites,
      data: node,
    },
    {
      label: MENU_OPERATIONS.SEPARATOR,
      actionId: "separator",
      onClick: () => {},
      data: null,
    },
  ];

  // Add operations based on node type
  if (isDirectory) {
    menuItems = [
      ...menuItems,
      {
        label: MENU_OPERATIONS.CREATE_DIRECTORY,
        actionId: "newDirectory",
        onClick: () => setFetchFolderName(true),
        data: node,
      },
      {
        label: MENU_OPERATIONS.CREATE_TEXT_FILE,
        actionId: "newTextFile",
        onClick: () => setFetchFileName(true),
        data: node,
      },
      {
        label: MENU_OPERATIONS.DELETE_DIRECTORY,
        actionId: "deleteDirectory",
        onClick: () => setShowDeleteConfirmation(true),
        data: node,
        disabled: isRootNode, // Disable delete for root node
      },
    ];
  } else {
    menuItems = [
      ...menuItems,
      {
        label: MENU_OPERATIONS.DELETE_FILE,
        actionId: "deleteFile",
        onClick: () => setShowDeleteConfirmation(true),
        data: node,
      },
    ];
  }

  const handleConfirmDelete = async () => {
    try {
      console.log("Starting delete operation for:", node.path);
      await deleteFileSystemItem(node.path, isDirectory);
      console.log("Delete operation completed, refreshing parent");

      // We use level 1 to refresh the parent node
      await onRefreshSubtree(1);
      // setRefreshed({ path: node.path, timestamp: Date.now() });
      setShowDeleteConfirmation(false);
    } catch (error) {
      console.error("Error deleting item:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to delete item"
      );
    }
  };

  return (
    <>
      <Menu id={node.path}>
        <Item onClick={() => setFetchFolderName(true)}>
          {isDirectory
            ? MENU_OPERATIONS.CREATE_DIRECTORY
            : MENU_OPERATIONS.CREATE_TEXT_FILE}
        </Item>
        {isDirectory && (
          <Item onClick={() => setFetchFileName(true)}>
            {MENU_OPERATIONS.CREATE_TEXT_FILE}
          </Item>
        )}
      </Menu>

      <MenuOps menu_id={node.path} items={menuItems} />

      <FetchItemNameModal
        node={node}
        onRefresh={() => onRefreshSubtree().catch(console.error)}
        isOpen={fetchFolderName}
        onClose={() => setFetchFolderName(false)}
        mode={NODE_KINDS.DIRECTORY}
      />

      <FetchItemNameModal
        node={node}
        onRefresh={() => onRefreshSubtree().catch(console.error)}
        isOpen={fetchFileName}
        onClose={() => setFetchFileName(false)}
        mode={NODE_KINDS.FILE}
      />

      <ConfirmModal
        node={node}
        onRefresh={handleConfirmDelete}
        isOpen={showDeleteConfirmation}
        onClose={() => setShowDeleteConfirmation(false)}
      />
    </>
  );
};
