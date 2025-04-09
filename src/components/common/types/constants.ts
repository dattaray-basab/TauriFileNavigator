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
// Node kind constants
export const NODE_KINDS = {
  DIRECTORY: "Directory",
  FILE: "File",
} as const;

// Menu operation labels
export const MENU_OPERATIONS = {
  // Create operations
  CREATE_DIRECTORY: "New Directory",
  CREATE_TEXT_FILE: "New Text File",

  // Delete operations
  DELETE_DIRECTORY: "Delete Directory",
  DELETE_FILE: "Delete File",

  // Other operations
  ADD_TO_FAVORITES: "Add to Favorites",

  // UI elements
  SEPARATOR: "---",

  // Button labels
  CONFIRM_DELETE: "Delete",
  CANCEL: "Cancel",
  CREATE: "Create",
  YES: "Yes",
  NO: "No",
} as const;

// Dialog text
export const DIALOG_TEXT = {
  DELETE_CONFIRMATION: (name: string, isDirectory: boolean) =>
    `Are you sure you want to delete this ${
      isDirectory
        ? NODE_KINDS.DIRECTORY.toLowerCase()
        : NODE_KINDS.FILE.toLowerCase()
    } "${name}"? This cannot be undone.`,
  DELETE_TITLE: (isDirectory: boolean) =>
    `Delete ${isDirectory ? NODE_KINDS.DIRECTORY : NODE_KINDS.FILE}`,
} as const;

// Modal text
export const MODAL_TEXT = {
  // Titles
  CREATE_TEXT_FILE_TITLE: "Create Empty File",
  CREATE_FILE_TITLE: "Create New File",
  CREATE_DIRECTORY_TITLE: "Create New Directory",

  // Labels
  FILE_NAME_LABEL: "Enter file name:",
  DIRECTORY_NAME_LABEL: "Enter directory name:",

  // Placeholders
  NEW_FILE_PLACEHOLDER: "New File",
  NEW_DIRECTORY_PLACEHOLDER: "New Directory",
} as const;
