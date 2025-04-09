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
import React from "react";
import { useTheme } from "@/components/common";
import { NodeDetails } from "@/components/common/types/types";
import { NODE_KINDS } from "../common/types/constants";

interface ConfirmModalProps {
  node: NodeDetails;
  onRefresh: () => Promise<void>;
  isOpen: boolean;
  onClose: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  node,
  onRefresh,
  isOpen,
  onClose,
}) => {
  const { theme } = useTheme();
  const isDirectory = node.kind === NODE_KINDS.DIRECTORY;

  if (!isOpen) return null;

  const handleConfirm = async () => {
    await onRefresh();
    onClose();
  };

  return (
    <>
      <div
        className='fixed inset-0 bg-black bg-opacity-50 z-40'
        onClick={onClose}
      />
      <div
        role='dialog'
        aria-labelledby='confirm-modal-title'
        aria-describedby='confirm-modal-description'
        className={`${theme.bg.hi} fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 
                   rounded-md shadow-lg w-72 overflow-hidden border ${theme.border} z-50`}>
        {/* Header */}
        <div className={`p-4 text-center`}>
          <h3
            id='confirm-modal-title'
            className={`text-base font-medium ${theme.fg.hi}`}>
            {isDirectory ? "Delete Folder" : "Delete File"}
          </h3>
        </div>

        {/* Message */}
        <div id='confirm-modal-description' className={`px-4 py-3`}>
          <p className={`text-sm ${theme.fg.med}`}>
            Are you sure you want to delete the{" "}
            {isDirectory ? NODE_KINDS.DIRECTORY : NODE_KINDS.FILE} "{node.name}
            "?
            {isDirectory && (
              <span className='block mt-1 text-red-500 font-medium'>
                This will also delete all contents inside the folder.
              </span>
            )}
          </p>
        </div>

        {/* Buttons */}
        <div className={`flex justify-end space-x-2 p-3`}>
          <button
            onClick={onClose}
            className={`px-4 py-1 border ${theme.border} 
                     rounded text-sm ${theme.fg.med} ${theme.bg.lo}`}>
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className='px-4 py-1 rounded text-sm text-white bg-red-500 hover:bg-red-600 border border-red-600'>
            Delete
          </button>
        </div>
      </div>
    </>
  );
};
