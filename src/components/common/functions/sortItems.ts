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
import { NodeDetails } from "@/components/common/types/types";
import { NODE_KINDS } from "../types/constants";

/**
 * Sorts an array of NodeDetails based on the specified sorting preference
 *
 * @param items Array of files and folders to sort
 * @param folderFirst When true, folders appear before files; when false, sorts purely alphabetically
 * @returns A new sorted array (original array is not modified)
 */
export function sortItems(
  items: NodeDetails[],
  folderFirst: boolean
): NodeDetails[] {
  // Create a copy of the array to avoid modifying the original
  const itemsCopy = [...items];

  return itemsCopy.sort((a, b) => {
    // CASE 1: When folderFirst is enabled and items are of different types
    if (folderFirst) {
      // If one is a directory and the other is a file
      if (a.kind !== b.kind) {
        // Directories come before files
        if (a.kind === NODE_KINDS.DIRECTORY) return -1;
        if (b.kind === NODE_KINDS.DIRECTORY) return 1;
      }
    }

    // CASE 2: When items are the same type OR folderFirst is disabled
    // Sort alphabetically (case-insensitive)
    const nameA = a.name.toLowerCase();
    const nameB = b.name.toLowerCase();

    if (nameA < nameB) return -1;
    if (nameA > nameB) return 1;
    return 0;
  });
}
