import { createPortal } from "react-dom";
import { XIcon, FileText, Clock, FolderOpen, Hash } from "lucide-react";
import { useTheme } from "@/components/common";
import { SearchFileResult, SearchMatch } from "../SearchInput/types";
import { useCallback, useEffect, useRef } from "react";

interface DetailedResultsModalProps {
  isOpen: boolean;
  onClose: () => void;
  searchStats: {
    filesSearched: number;
    directoriesSearched: number;
    totalMatches: number;
  };
  performance: {
    processingTime: number;
    renderTime: number;
    nodesExpanded: number;
    totalNodes: number;
  };
  searchResults: SearchFileResult[];
}

export function DetailedResultsModal({
  isOpen,
  onClose,
  searchStats,
  performance,
  searchResults,
}: DetailedResultsModalProps) {
  const { theme } = useTheme();
  const modalRef = useRef<HTMLDivElement>(null);

  // Handle escape key to close modal
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  // Focus trap for accessibility
  useEffect(() => {
    if (isOpen && modalRef.current) {
      const focusableElements = modalRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const firstFocusable = focusableElements[0] as HTMLElement;
      const lastFocusable = focusableElements[
        focusableElements.length - 1
      ] as HTMLElement;

      const handleTabKey = (e: KeyboardEvent) => {
        if (e.key === "Tab") {
          if (e.shiftKey) {
            if (document.activeElement === firstFocusable) {
              lastFocusable.focus();
              e.preventDefault();
            }
          } else {
            if (document.activeElement === lastFocusable) {
              firstFocusable.focus();
              e.preventDefault();
            }
          }
        }
      };

      document.addEventListener("keydown", handleTabKey);
      firstFocusable.focus();

      return () => {
        document.removeEventListener("keydown", handleTabKey);
      };
    }
  }, [isOpen]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const handleBackdropClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) {
        onClose();
      }
    },
    [onClose]
  );

  if (!isOpen) return null;

  return createPortal(
    <div
      className='fixed inset-0 flex items-center justify-center z-50'
      onClick={handleBackdropClick}
      role='dialog'
      aria-modal='true'
      aria-labelledby='modal-title'>
      <div
        className='fixed inset-0 bg-black bg-opacity-50'
        aria-hidden='true'
      />
      <div
        ref={modalRef}
        className={`${theme.bg.hi} ${theme.fg.hi} rounded-lg p-6 max-w-4xl w-full max-h-[80vh] flex flex-col relative shadow-xl`}
        role='document'>
        <div className='flex-none'>
          <div className='flex justify-between items-center mb-4'>
            <h2 id='modal-title' className='text-xl font-semibold'>
              Detailed Search Results
            </h2>
            <button
              onClick={onClose}
              className={`p-1 rounded-full ${theme.bg.med} hover:${theme.bg.hi} transition-colors duration-200`}
              aria-label='Close modal'>
              <XIcon className='w-5 h-5' aria-hidden='true' />
            </button>
          </div>

          <div className='mb-4'>
            <h3 className='text-lg font-medium mb-2'>Search Statistics</h3>
            <div className='grid grid-cols-3 gap-4'>
              <div className={`p-3 rounded ${theme.bg.med} flex items-center`}>
                <FileText
                  className='w-4 h-4 mr-2 text-blue-400'
                  aria-hidden='true'
                />
                <div>
                  <div className='text-sm opacity-70'>Files Searched</div>
                  <div className='text-xl font-semibold'>
                    {searchStats.filesSearched.toLocaleString()}
                  </div>
                </div>
              </div>
              <div className={`p-3 rounded ${theme.bg.med} flex items-center`}>
                <FolderOpen
                  className='w-4 h-4 mr-2 text-green-400'
                  aria-hidden='true'
                />
                <div>
                  <div className='text-sm opacity-70'>Directories Searched</div>
                  <div className='text-xl font-semibold'>
                    {searchStats.directoriesSearched.toLocaleString()}
                  </div>
                </div>
              </div>
              <div className={`p-3 rounded ${theme.bg.med} flex items-center`}>
                <Hash
                  className='w-4 h-4 mr-2 text-purple-400'
                  aria-hidden='true'
                />
                <div>
                  <div className='text-sm opacity-70'>Total Matches</div>
                  <div className='text-xl font-semibold'>
                    {searchStats.totalMatches.toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className='mb-4'>
            <h3 className='text-lg font-medium mb-2'>Performance Metrics</h3>
            <div className={`p-3 rounded ${theme.bg.med}`}>
              <div className='grid grid-cols-2 gap-4'>
                <div className='flex items-center'>
                  <Clock
                    className='w-4 h-4 mr-2 text-yellow-400'
                    aria-hidden='true'
                  />
                  <div>
                    <div className='text-sm opacity-70'>Processing Time</div>
                    <div className='font-semibold'>
                      {performance.processingTime.toFixed(2)} ms
                    </div>
                  </div>
                </div>
                <div className='flex items-center'>
                  <Clock
                    className='w-4 h-4 mr-2 text-yellow-400'
                    aria-hidden='true'
                  />
                  <div>
                    <div className='text-sm opacity-70'>Render Time</div>
                    <div className='font-semibold'>
                      {performance.renderTime.toFixed(2)} ms
                    </div>
                  </div>
                </div>
                <div className='flex items-center'>
                  <FolderOpen
                    className='w-4 h-4 mr-2 text-green-400'
                    aria-hidden='true'
                  />
                  <div>
                    <div className='text-sm opacity-70'>Nodes Expanded</div>
                    <div className='font-semibold'>
                      {performance.nodesExpanded.toLocaleString()}
                    </div>
                  </div>
                </div>
                <div className='flex items-center'>
                  <FolderOpen
                    className='w-4 h-4 mr-2 text-green-400'
                    aria-hidden='true'
                  />
                  <div>
                    <div className='text-sm opacity-70'>Total Nodes</div>
                    <div className='font-semibold'>
                      {performance.totalNodes.toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className='flex-1 overflow-y-auto min-h-0'>
          <h3 className='text-lg font-medium mb-2 sticky top-0 bg-inherit z-10'>
            Search Results
          </h3>
          <div className={`rounded ${theme.bg.med}`}>
            {searchResults.length > 0 ? (
              <ul className='space-y-4'>
                {searchResults.map(
                  (result: SearchFileResult, index: number) => (
                    <li
                      key={index}
                      className='border-b border-gray-700 pb-4 last:border-0'>
                      <div className='font-medium mb-1'>{result.path}</div>
                      <div className='text-sm opacity-70 mb-2'>
                        {result.matches.length} match
                        {result.matches.length !== 1 ? "es" : ""}
                      </div>

                      {result.matches.length > 0 && (
                        <div
                          className={`mt-2 p-3 rounded ${theme.bg.hi} bg-opacity-10 backdrop-brightness-125 border ${theme.border.lo} text-xs font-mono overflow-x-auto whitespace-pre`}>
                          {result.matches.map(
                            (match: SearchMatch, matchIndex: number) => (
                              <div key={matchIndex} className='mb-1'>
                                <span className='select-none text-blue-400'>
                                  {match.line}:
                                </span>{" "}
                                {match.content}
                              </div>
                            )
                          )}
                        </div>
                      )}
                    </li>
                  )
                )}
              </ul>
            ) : (
              <div className='text-center py-4'>No results found</div>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
