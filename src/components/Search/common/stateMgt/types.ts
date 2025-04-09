// Search result types
export interface SearchMatch {
  line: number;
  content: string;
  matchRanges: [number, number][]; // Start and end positions of matches
}

export interface SearchFileResult {
  path: string;
  matches: SearchMatch[];
}

// Performance monitoring
export interface SearchPerformance {
  processingTime: number;
  nodesExpanded: number;
  totalNodes: number;
  currentDepth: number;
  renderTime: number;
}

// Path highlighting
export interface HighlightedPath {
  path: string;
  matchCount: number;
  expanded: boolean;
}

// Search statistics
export interface SearchStats {
  filesSearched: number;
  directoriesSearched: number;
  totalMatches: number;
}
