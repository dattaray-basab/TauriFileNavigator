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
import { useEffect, useState } from "react";
import { useSelectedFile } from "../../common/hooks/useSelectedFile";
import { useViewFile } from "./hooks/useViewFile";
import { useHighlighting, TextHighlighter } from "@/components/Search";
import { useAtom } from "jotai";
import { searchState } from "@/components/Search/common/stateMgt";

export const FileDisplay = () => {
  const { theme } = useTheme();
  const { selectedFile } = useSelectedFile();
  const { readFileContent } = useViewFile();
  const [fileContent, setFileContent] = useState<string>("");
  const { getHighlightInfo } = useHighlighting();
  const [isCaseSensitive] = useAtom(searchState.caseSensitive);
  const [isWholeWord] = useAtom(searchState.wholeWord);

  // Get highlight info for the current file
  const highlightInfo = selectedFile
    ? getHighlightInfo(selectedFile.path)
    : { isHighlighted: false, matchCount: 0 };

  // Load file content when selectedFile changes
  useEffect(() => {
    const loadContent = async () => {
      if (selectedFile && selectedFile.kind === "File") {
        try {
          const content = await readFileContent(selectedFile);
          setFileContent(content);
        } catch (error) {
          console.error("Error reading file:", error);
          setFileContent("Error loading file content");
        }
      } else {
        setFileContent("");
      }
    };

    loadContent();
  }, [selectedFile, readFileContent]);

  return (
    <div
      className={`h-full w-full flex flex-col ${theme.bg.hi} ${theme.border.lo} border-none`}>
      <div className={`p-4 ${theme.bg.med} z-10`}>
        <h2 className={`text-lg font-semibold ${theme.fg.hi}`}>
          {selectedFile ? selectedFile.name : "File Display"}
        </h2>
      </div>
      <div className={`flex-1 p-4 overflow-auto ${theme.fg.med}`}>
        {selectedFile ? (
          highlightInfo.isHighlighted ? (
            <TextHighlighter
              content={fileContent}
              filePath={selectedFile.path}
              isCaseSensitive={isCaseSensitive}
              isWholeWord={isWholeWord}
            />
          ) : (
            <pre className='whitespace-pre-wrap font-mono text-sm'>
              {fileContent}
            </pre>
          )
        ) : (
          <div className='flex items-center justify-center h-full text-center'>
            <p>Select a file to view its contents</p>
          </div>
        )}
      </div>
    </div>
  );
};
