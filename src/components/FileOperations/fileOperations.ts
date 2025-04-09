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
import { invoke } from "@tauri-apps/api/tauri";
import { toPlatformPath } from "@/components/common/functions/platform";

/**
 * Deletes a file at the specified path
 *
 * @param filePath - The path to the file to delete
 * @returns A promise that resolves when the file is deleted
 */
export async function deleteFile(filePath: string): Promise<void> {
  return invoke("delete_file", { filePath: toPlatformPath(filePath) });
}

/**
 * Deletes a folder and all its contents at the specified path
 *
 * @param folderPath - The path to the folder to delete
 * @returns A promise that resolves when the folder is deleted
 */
export async function deleteFolder(folderPath: string): Promise<void> {
  return invoke("delete_folder", { folderPath: toPlatformPath(folderPath) });
}

/**
 * Deletes a file or folder based on its type
 *
 * @param path - The path to the file or folder to delete
 * @param isDirectory - Whether the path is a directory
 * @returns A promise that resolves when the item is deleted
 */
export async function deleteFileSystemItem(
  path: string,
  isDirectory: boolean
): Promise<void> {
  return isDirectory ? deleteFolder(path) : deleteFile(path);
}
