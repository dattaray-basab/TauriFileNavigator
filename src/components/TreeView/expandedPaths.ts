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
import { notifyListeners } from "./listeners";
import { toPlatformPath } from "@/components/common/functions/platform_frontend";
import { FORWARD_SLASH } from "@/components/common/constants/filesys";

// Set to store expanded node paths
const expandedPaths = new Set<string>();

// Store for listeners that will be notified when the state changes

// Helper functions to manipulate the expansion state
export function isExpanded(path: string): boolean {
  return expandedPaths.has(toPlatformPath(path)); // Check if the path is in the expandedPaths set
}

export function toggleExpansion(path: string): void {
  const platformPath = toPlatformPath(path);
  if (expandedPaths.has(platformPath)) {
    expandedPaths.delete(platformPath);
  } else {
    expandedPaths.add(platformPath);
  }
  notifyListeners();
}

export function expandPath(path: string): void {
  expandedPaths.add(toPlatformPath(path));
  notifyListeners();
}

export function expandAncestry(path: string): void {
  // Split the path and expand all parent directories
  const platformPath = toPlatformPath(path);
  let currentPath = "";
  for (const segment of platformPath.split(FORWARD_SLASH).filter(Boolean)) {
    currentPath += FORWARD_SLASH + segment;
    expandedPaths.add(currentPath);
  }
  notifyListeners();
}

export function collapseAll(): void {
  expandedPaths.clear();
  notifyListeners();
}

export function collapsePath(path: string): void {
  expandedPaths.delete(toPlatformPath(path));
  notifyListeners();
}
