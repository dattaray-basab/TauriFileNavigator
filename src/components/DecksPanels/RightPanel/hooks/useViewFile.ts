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

import { useState, useCallback } from "react";
import { NodeDetails } from "@/components/common/types/types";
import { invoke } from "@tauri-apps/api/tauri";

export function useViewFile() {
  // State for the preview modal
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [fileContent, setFileContent] = useState("");
  const [fileName, setFileName] = useState("");
  const [nodeDetails, setNodeDetails] = useState<NodeDetails | null>(null);

  // Open preview for a file (double click)
  const openPreview = useCallback(async (file: NodeDetails) => {
    if (file.kind === "File") {
      try {
        const content = await readFileContent(file);
        setFileContent(content);
        setFileName(file.name);
        setNodeDetails(file);
        setIsPreviewOpen(true);
      } catch (error) {
        console.error("Error reading file for preview:", error, {
          file: file.path,
          kind: file.kind,
          hidden: file.hidden,
        });
      }
    }
  }, []);

  // Close the preview modal
  const closePreview = useCallback(() => {
    setIsPreviewOpen(false);
  }, []);

  // Read file content without opening preview
  const readFileContent = useCallback(
    async (file: NodeDetails): Promise<string> => {
      if (file.kind === "File") {
        try {
          console.log("Attempting to read file:", {
            path: file.path,
            kind: file.kind,
            hidden: file.hidden,
          });
          const content = await invoke<string>("read_file_content", {
            filePath: file.path,
          });
          console.log("Successfully read file content");
          return content;
        } catch (error) {
          console.error("Error reading file:", error, {
            file: file.path,
            kind: file.kind,
            hidden: file.hidden,
          });
          return `Error reading file: ${error}`;
        }
      }
      return "";
    },
    []
  );

  return {
    isPreviewOpen,
    fileContent,
    fileName,
    nodeDetails,
    openPreview,
    closePreview,
    readFileContent,
  };
}
