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
import { useState, useRef, useEffect } from "react";
import { fs } from "@tauri-apps/api";
import { join } from "@tauri-apps/api/path";
import { NodeDetails } from "@/components/common/types/types";
import { invoke } from "@tauri-apps/api/tauri";
import { NODE_KINDS } from "@/components/common/types/constants";

type CreateMode = typeof NODE_KINDS.FILE | typeof NODE_KINDS.DIRECTORY;

interface UseCreateItemReturn {
  itemName: string;
  setItemName: (name: string) => void;
  errorMessage: string | null;
  isProcessing: boolean;
  inputRef: React.RefObject<HTMLInputElement>;
  handleCreateItem: () => Promise<void>;
  handleKeyDown: (e: React.KeyboardEvent) => void;
  isInputEmpty: boolean;
  resetState: () => void;
}

export const useCreateItem = (
  node: NodeDetails,
  mode: CreateMode,
  onRefresh: () => Promise<void>,
  onClose: () => void,
  isOpen: boolean
): UseCreateItemReturn => {
  const [itemName, setItemName] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const isInputEmpty = itemName.trim() === "";

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      resetState();
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Clear error message when user types
  useEffect(() => {
    if (errorMessage) {
      setErrorMessage(null);
    }
  }, [itemName]);

  const resetState = () => {
    setItemName("");
    setErrorMessage(null);
    setIsProcessing(false);
  };

  const handleCreateItem = async () => {
    try {
      if (isInputEmpty) return;

      setIsProcessing(true);

      const newItemPath = await join(node.path, itemName);

      // Check if item already exists
      const exists = await fs.exists(newItemPath);
      if (exists) {
        setErrorMessage(
          `A ${
            mode === NODE_KINDS.DIRECTORY
              ? NODE_KINDS.DIRECTORY
              : NODE_KINDS.FILE
          } named "${itemName}" already exists.`
        );
        inputRef.current?.select();
        return;
      }

      // Create the item based on mode
      await invoke("create_filesystem_item", {
        parentPath: node.path,
        itemName: itemName,
        itemType:
          mode === NODE_KINDS.DIRECTORY
            ? NODE_KINDS.DIRECTORY
            : NODE_KINDS.FILE,
        // isEmpty: mode === "empty-file",
      });

      await onRefresh();
      onClose();
    } catch (error) {
      setErrorMessage(String(error));
      inputRef.current?.select();
      console.error(`Error creating ${mode}:`, error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !isInputEmpty) {
      handleCreateItem();
    } else if (e.key === "Escape") {
      onClose();
    }
  };

  return {
    itemName,
    setItemName,
    errorMessage,
    isProcessing,
    inputRef,
    handleCreateItem,
    handleKeyDown,
    isInputEmpty,
    resetState,
  };
};
