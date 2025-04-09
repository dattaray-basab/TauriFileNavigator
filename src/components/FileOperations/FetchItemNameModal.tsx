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
import { NodeDetails } from "@/components/common/types/types";
import { useTheme } from "@/components/common";
import { useCreateItem } from "./hooks/useCreateItem";
import {
  NODE_KINDS,
  MENU_OPERATIONS,
  MODAL_TEXT,
} from "@/components/common/types/constants";

interface FetchItemNameModalProps {
  node: NodeDetails;
  onRefresh: () => Promise<void>;
  isOpen: boolean;
  onClose: () => void;
  mode: typeof NODE_KINDS.FILE | typeof NODE_KINDS.DIRECTORY;
}

const LoadingSpinner = () => (
  <div
    className='inline-block animate-spin h-4 w-4 border-2 border-current 
                  border-t-transparent rounded-full ml-2'>
    <span className='sr-only'>Loading...</span>
  </div>
);

export const FetchItemNameModal: React.FC<FetchItemNameModalProps> = ({
  node,
  onRefresh,
  isOpen,
  onClose,
  mode = node.kind === NODE_KINDS.DIRECTORY
    ? NODE_KINDS.DIRECTORY
    : NODE_KINDS.FILE,
}) => {
  const { theme } = useTheme();
  const {
    itemName,
    setItemName,
    errorMessage,
    isProcessing,
    inputRef,
    handleCreateItem,
    handleKeyDown,
    isInputEmpty,
  } = useCreateItem(node, mode, onRefresh, onClose, isOpen);

  if (!isOpen) return null;

  // let mode = node.kind as string;

  const getModalText = () => {
    switch (mode) {
      case NODE_KINDS.FILE:
        return {
          title: MODAL_TEXT.CREATE_FILE_TITLE,
          label: MODAL_TEXT.FILE_NAME_LABEL,
          placeholder: MODAL_TEXT.NEW_FILE_PLACEHOLDER,
          confirmButton: MENU_OPERATIONS.YES,
        };
      case NODE_KINDS.DIRECTORY:
        return {
          title: MODAL_TEXT.CREATE_DIRECTORY_TITLE,
          label: MODAL_TEXT.DIRECTORY_NAME_LABEL,
          placeholder: MODAL_TEXT.NEW_DIRECTORY_PLACEHOLDER,
          confirmButton: MENU_OPERATIONS.YES,
        };
    }
  };

  const modalText = getModalText();

  return (
    <>
      <div
        className='fixed inset-0 bg-black bg-opacity-50 z-40'
        onClick={onClose}
      />
      <div
        role='dialog'
        aria-labelledby='modal-title'
        aria-describedby='modal-description'
        className={`${theme.bg.hi} fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 
                   rounded-md shadow-lg w-72 overflow-hidden border ${theme.border} z-50`}>
        {/* Header */}
        <div className={`p-4 text-center`}>
          <h3
            id='modal-title'
            className={`text-base font-medium ${theme.fg.hi}`}>
            {modalText.title}
          </h3>
        </div>

        {/* Input area */}
        <div id='modal-description' className={`px-4 py-3`}>
          <label className={`block text-sm ${theme.fg.med} mb-1`}>
            {modalText.label}
          </label>
          <input
            ref={inputRef}
            type='text'
            value={itemName}
            onChange={(e) => setItemName(e.target.value)}
            onKeyDown={handleKeyDown}
            className={`w-full px-2 py-1 border ${theme.border} rounded 
                     ${theme.bg.lo} ${theme.fg.hi} ${
              errorMessage ? "border-red-500" : ""
            }`}
            placeholder={modalText.placeholder}
            autoFocus
            disabled={isProcessing}
            autoCapitalize='off'
            autoCorrect='off'
            autoComplete='off'
            spellCheck='false'
          />

          {/* Error message area */}
          {errorMessage && (
            <div className='mt-2 text-sm text-red-500'>{errorMessage}</div>
          )}
        </div>

        {/* Buttons */}
        <div className={`flex justify-end space-x-2 p-3`}>
          <button
            onClick={onClose}
            className={`px-4 py-1 border ${theme.border} 
                     rounded text-sm ${theme.fg.med}
                     ${theme.bg.lo}`}>
            {node.kind === NODE_KINDS.FILE
              ? MENU_OPERATIONS.CANCEL
              : MENU_OPERATIONS.NO}
          </button>
          <button
            onClick={handleCreateItem}
            disabled={isInputEmpty || isProcessing}
            className={`px-4 py-1 rounded text-sm ${theme.fg.hi} border ${
              theme.border
            }
                      ${
                        isInputEmpty || isProcessing
                          ? "opacity-50 cursor-not-allowed"
                          : ""
                      }`}>
            {isProcessing ? (
              <>
                Creating
                <LoadingSpinner />
              </>
            ) : (
              modalText.confirmButton
            )}
          </button>
        </div>
      </div>
    </>
  );
};
