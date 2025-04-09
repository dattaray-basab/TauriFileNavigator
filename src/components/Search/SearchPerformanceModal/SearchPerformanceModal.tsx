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
import { X as XIcon } from "lucide-react";
import { useTheme } from "@/components/common";
import { createPortal } from "react-dom";

interface SearchPerformanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCancel: () => void;
  performance: {
    processingTime: number;
  };
  loading: boolean;
  expandingInProgress: boolean;
  isRendering: boolean;
  searchStats: {
    filesSearched: number;
    directoriesSearched: number;
    totalMatches: number;
  };
  isCurtailed: boolean;
}

export function SearchPerformanceModal({
  isOpen,
  onClose,
  onCancel,
  loading,
  expandingInProgress,
  isRendering,
  searchStats,
  isCurtailed,
}: SearchPerformanceModalProps) {
  const { theme } = useTheme();
  const isOperationInProgress = loading || expandingInProgress || isRendering;

  if (!isOpen) return null;

  const handleOverlayClick = (e: React.MouseEvent) => {
    // Only allow closing if no operation is in progress
    if (!isOperationInProgress && e.target === e.currentTarget) {
      onClose();
    }
  };

  const modalContent = (
    <div
      className='modal-container'
      style={{ position: "relative", zIndex: 999999 }}>
      {/* Backdrop */}
      <div
        className='fixed inset-0 bg-black bg-opacity-50'
        onClick={handleOverlayClick}
        style={{ cursor: isOperationInProgress ? "not-allowed" : "auto" }}
      />
      {/* Modal */}
      <div className='fixed inset-0 flex items-center justify-center'>
        <div
          className={`${theme.bg.hi} rounded-lg shadow-lg p-4 max-w-md w-full mx-4`}>
          <div className='flex justify-between items-center mb-4'>
            <h3 className={`text-sm font-semibold ${theme.fg.hi}`}>
              Search Performance
            </h3>
            {!isOperationInProgress && (
              <button
                onClick={onClose}
                className={`${theme.fg.lo} hover:${theme.fg.med}`}
                aria-label='Close modal'>
                <XIcon className='h-4 w-4' />
              </button>
            )}
          </div>

          <div className={`space-y-2 text-sm ${theme.fg.med}`}>
            <div className='flex justify-between'>
              <span>Status:</span>
              <span className={`${theme.fg.hi} font-medium`}>
                {loading
                  ? "Searching..."
                  : expandingInProgress
                  ? "Expanding Tree..."
                  : isRendering
                  ? "Rendering Results..."
                  : "Complete"}
              </span>
            </div>
            {isCurtailed && !loading && (
              <div className='flex justify-between'>
                <span>Note:</span>
                <span className={`${theme.fg.hi} font-medium text-yellow-500`}>
                  Search curtailed due to timeout
                </span>
              </div>
            )}
            <div className='flex justify-between'>
              <span>Files Searched:</span>
              <span className={theme.fg.hi}>{searchStats.filesSearched}</span>
            </div>
            <div className='flex justify-between'>
              <span>Directories Searched:</span>
              <span className={theme.fg.hi}>
                {searchStats.directoriesSearched}
              </span>
            </div>
            <div className='flex justify-between'>
              <span>Total Matches:</span>
              <span className={theme.fg.hi}>{searchStats.totalMatches}</span>
            </div>
            {/* <div className='flex justify-between'>
              <span>Processing Time:</span>
              <span className={theme.fg.hi}>
                {performance?.processingTime?.toFixed(2) || "0.00"} ms
              </span>
            </div> */}

            {/* Progress bar */}
            {isOperationInProgress && (
              <div className='mt-2'>
                <div
                  className={`w-full h-1 ${theme.bg.lo} rounded-full overflow-hidden`}>
                  <div
                    className={`h-full ${theme.bg.med} transition-all duration-300 ease-in-out w-full`}
                  />
                </div>
              </div>
            )}
          </div>

          <div className='mt-4 flex justify-end space-x-2'>
            {isOperationInProgress ? (
              <button
                onClick={onCancel}
                className={`px-3 py-1 text-xs rounded-md ${theme.bg.lo} ${theme.fg.hi} hover:${theme.bg.med} border ${theme.border.lo}`}>
                Cancel Operation
              </button>
            ) : (
              <button
                onClick={onClose}
                className={`px-3 py-1 text-xs rounded-md ${theme.bg.lo} ${theme.fg.hi} hover:${theme.bg.med} border ${theme.border.lo}`}>
                Close
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  // Render using portal
  return createPortal(
    modalContent,
    document.getElementById("modal-root") || document.body
  );
}
