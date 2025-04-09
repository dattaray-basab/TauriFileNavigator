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
import { ContentsTop } from "../ContentsTop/ContentsTop";
import { TreeView } from "../../../TreeView/TreeView";
// import { WelcomeScreen } from "./WelcomeScreen";
import { useSnapshot } from "valtio";
import { valtioTreeStates } from "@/components/common/globalStateMgt/valtioTreeStates";

export default function ViewAsTree({}) {
  const { theme } = useTheme();
  const snap = useSnapshot(valtioTreeStates);

  // If no path is selected, show blank panel
  if (!snap.currentPath) {
    return <main className={`h-full ${theme.bg.hi}`} />;
  }

  return (
    <main
      className={`min-w-0 relative flex-col h-full overflow-auto ${theme.bg.hi}`}>
      <div className={`sticky top-0 z-10 ${theme.bg.hi}`}>
        <ContentsTop />
      </div>
      <div className='p-0'>
        <TreeView />
      </div>
    </main>
  );
}
