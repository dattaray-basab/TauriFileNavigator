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
import { memo, useState } from "react";
import { FileDisplay } from "../components/DecksPanels/RightPanel/FileDisplay";
import ViewAsTree from "../components/DecksPanels/MiddlePanel/ViewAsTree/ViewAsTree";
import Split from "react-split";
import { LeftPanel } from "@/components/DecksPanels/LeftPanel/LeftPanel";
import { FileSystemEventHandler } from "../components/FileSystem/FileSystemEventHandler";
import { useSnapshot } from "valtio";
import { valtioTreeStates } from "@/components/common/globalStateMgt/valtioTreeStates";

// Type declarations
declare global {
  interface Window {
    __TAURI_IPC__: (message: any) => void;
  }
}

// Memoized components
const MemoizedTreeView = memo(ViewAsTree);
const MemoizedFileDisplay = memo(FileDisplay);

// Fallback component for non-desktop environments
const FallbackMessage = () => (
  <div className='flex h-full items-center justify-center text-gray-500'>
    Tauri IPC not available
  </div>
);

const PanelSet = () => {
  const { theme } = useTheme();
  const [sizes, setSizes] = useState([20, 40, 40]);
  const snap = useSnapshot(valtioTreeStates);

  if (typeof window.__TAURI_IPC__ !== "function") {
    return <FallbackMessage />;
  }

  return (
    <>
      {snap.currentPath && <FileSystemEventHandler path={snap.currentPath} />}
      <Split
        className={`flex h-full ${theme.bg.hi}`}
        sizes={sizes}
        minSize={[150, 200, 200]}
        snapOffset={0}
        onDragEnd={setSizes}>
        <LeftPanel />
        <MemoizedTreeView />
        <MemoizedFileDisplay />
      </Split>
    </>
  );
};

export default PanelSet;
