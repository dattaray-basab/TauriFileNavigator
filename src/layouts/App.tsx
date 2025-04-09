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

import { useTheme } from "../components/common";
import PanelSet from "./PanelSet";
import { SunIcon, MoonIcon, GroupIcon, ShuffleIcon } from "lucide-react";
import { useSnapshot } from "valtio";
import {
  valtioToggleStates,
  toggleActions,
} from "../components/common/globalStateMgt/valtioToggleStates";
import { useOSType } from "@/components/common/hooks/useOSType";
import { useEffect } from "react";

export default function App() {
  const { theme, isDark, toggleColorTheme } = useTheme();
  const snap = useSnapshot(valtioToggleStates);
  const osType = useOSType();

  useEffect(() => {
    document.body.style.backgroundColor = theme.bg.hi;
  }, [theme]);

  if (typeof window.__TAURI_IPC__ !== "function")
    return <div>This website doesn't work. Use the desktop app instead.</div>;

  return (
    <div
      className={`flex flex-col h-screen w-full ${theme.bg.hi} overflow-hidden`}>
      <header
        className={`flex-none h-14 ${theme.bg.hi} ${theme.border.lo} border-b`}>
        <div className='flex items-center justify-between h-full px-4'>
          <div className='flex items-center space-x-2'>
            <svg
              viewBox='0 0 24 24'
              className={`w-6 h-6 ${theme.fg.hi}`}
              fill='none'
              stroke='currentColor'
              strokeWidth='2'>
              <path d='M4 6h16M4 12h16M4 18h16' />
            </svg>
            <span
              className={`text-lg font-semibold tracking-tight ${theme.fg.hi}`}>
              Decks (Developer Explorer for Code Kick Start)
            </span>
            <span className={`text-sm ${theme.fg.lo}`}>({osType})</span>
          </div>

          <div className='flex items-center space-x-2 pr-8'>
            {/* Sort Mode Toggle (Grouped/Mixed) */}
            <div className='relative group mr-3'>
              <button
                onClick={() => toggleActions.toggleGroupSort()}
                className={`p-2 rounded-md ${theme.bg.med} ${theme.fg.med} ${theme.hover.med} transition-colors flex items-center justify-center`}>
                {snap.isGroupSort ? (
                  <GroupIcon className='w-5 h-5' />
                ) : (
                  <ShuffleIcon className='w-5 h-5' />
                )}
              </button>
              <span
                className={`absolute left-0 top-full mt-2 px-2 py-1 text-xs rounded-md text-center
                ${theme.bg.lo} ${theme.fg.hi} ${theme.shadow.med}
                opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-50`}
                style={{ whiteSpace: "pre-line" }}>
                {snap.isGroupSort ? "Ungroup\nfiles" : "Group\nfiles"}
              </span>
            </div>

            {/* Theme Toggle (Light/Dark) */}
            <div className='relative group'>
              <button
                onClick={() => toggleColorTheme()}
                className={`p-2 rounded-md ${theme.bg.med} ${theme.fg.med} ${theme.hover.med} transition-colors flex items-center justify-center`}>
                {isDark ? (
                  <SunIcon className='w-5 h-5' />
                ) : (
                  <MoonIcon className='w-5 h-5' />
                )}
              </button>
              <span
                className={`absolute left-0 top-full mt-2 px-2 py-1 text-xs rounded-md text-center
                ${theme.bg.lo} ${theme.fg.hi} ${theme.shadow.med}
                opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-50`}
                style={{ whiteSpace: "pre-line" }}>
                {isDark ? "Switch\nto\nlight\nmode" : "Switch\nto\ndark\nmode"}
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className='flex-1 min-h-0 overflow-hidden border-none [&>*]:border-none'>
        <PanelSet />
      </main>

      <footer
        className={`flex-none h-12 ${theme.bg.hi} ${theme.border.lo} border-t ${theme.fg.lo}`}>
        <div className='flex flex-col px-4 py-1.5'>
          <div className='flex justify-between items-center'>
            <span>Basab Dattaray, CKS</span>
            <span className='text-xs'>{new Date().toLocaleString()}</span>
          </div>
          <div className='flex items-center gap-2.5'>
            <div className='text-xs'>Decks: v0.0.3</div>
            <div className='text-xs'>
              Tuesday, April 8, 2025 -- 11:28:23 pm PDT
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
// Key changes:
// 1. Added flex-none to both header and footer to prevent them from shrinking
// Added min-h-0 and overflow-hidden to the middle section to ensure proper scrolling
// Added py-4 and py-1 to the headers for better vertical centering
// Wrapped PanelSet in a flex-1 container to allow it to scroll independently
// This should maintain the header and footer heights while allowing the middle section to scroll when content overflows.
