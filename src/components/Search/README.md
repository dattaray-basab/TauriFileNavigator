# Search Module Documentation

## Overview

The Search module provides comprehensive search functionality for the application, including file content search, result highlighting, and performance monitoring. It uses Jotai for state management and integrates with a Rust backend for efficient file searching.

## Key Features

- Progressive loading with batched results (50 results per batch)
- Smart directory prioritization (source code directories first)
- Resource management with configurable limits
- Early results display with real-time progress updates
- Cumulative processing time tracking
- Intelligent throttling and timeout handling
- Case-sensitive and whole-word search enabled by default

## Directory Structure

```
Search/
├── common/                    # Shared utilities and core functionality
│   ├── hooks/                # Custom React hooks
│   │   └── useHighlighting.ts  # Hook for managing search result highlighting
│   ├── backendInterface/     # Rust backend integration
│   │   └── rustAccess.ts      # Interface for Rust search functionality
│   └── stateMgt/            # State management
│       └── index.ts          # Search-related Jotai atoms and types
├── SearchInput/             # Search input components
│   ├── SearchTextCapture.tsx    # Search action buttons
│   ├── SearchActionButtons.tsx   # Search control options
│   ├── SearchOptions.tsx    # Advanced search options
│   └── TimeoutSlider.tsx    # Search timeout control
├── TextHighlighter.tsx      # Content highlighting component
├── SearchHighlighter.tsx    # Tree view highlighting component
├── SearchResults.tsx        # Search results display
├── SearchPerformanceModal.tsx # Search performance monitoring
└── Search.tsx              # Main search component
```

## Performance Optimizations

### Resource Management

- `MAX_FILES_PER_DIR`: 100 files per directory
- `MAX_RESULTS_PER_DIR`: 20 results per directory
- `MAX_TOTAL_RESULTS`: 1000 total results cap
- `BATCH_SIZE`: 50 results per batch
- Binary and large files (>1MB) are automatically skipped

### Smart Prioritization

- Prioritizes source code directories (src, lib, app, components, utils, helpers)
- Smaller directories (<100KB) are searched first
- Results are streamed in batches for responsive UI

### Progress Monitoring

- Real-time statistics (files searched, directories searched, matches found)
- Cumulative processing time tracking
- Early results display (every 500ms)
- Progress updates every 250ms
- Clear user feedback for timeouts and cancellations

## Types

### SearchMatch

\`\`\`typescript
interface SearchMatch {
line: number;
content: string;
matchRanges: [number, number][]; // Start and end positions
}
\`\`\`

### SearchFileResult

\`\`\`typescript
interface SearchFileResult {
path: string;
matches: SearchMatch[];
}
\`\`\`

### SearchResponse

\`\`\`typescript
interface SearchResponse {
results: SearchFileResult[];
stats: SearchStats;
cancelled: boolean;
curtailed: boolean;
processing_time_ms: u64;
}
\`\`\`

## Usage

### Basic Search Integration

\`\`\`typescript
import { Search } from '@/components/Search/Search';

function MyComponent() {
return <Search />;
}
\`\`\`

### Using the Highlighting Hook

\`\`\`typescript
import { useHighlighting } from '@/components/Search/common/hooks/useHighlighting';

function MyComponent() {
const { getHighlightInfo } = useHighlighting();
const { isHighlighted, matchCount } = getHighlightInfo(path);

return (

<div className={isHighlighted ? 'highlighted' : ''}>
{matchCount > 0 && <span>{matchCount} matches</span>}
</div>
);
}
\`\`\`

### Text Content Highlighting

\`\`\`typescript
import { TextHighlighter } from '@/components/Search/TextHighlighter';

function MyComponent({ content, filePath }) {
return <TextHighlighter content={content} filePath={filePath} />;
}
\`\`\`

## State Management

The search state is managed through Jotai atoms with optimized defaults:
\`\`\`typescript
const searchState = {
query: atom<string>(""),
regex: atom<boolean>(false),
caseSensitive: atom<boolean>(true), // Enabled by default
wholeWord: atom<boolean>(true), // Enabled by default
loading: atom<boolean>(false),
active: atom<boolean>(false),
results: atom<SearchFileResult[]>([]),
// ... additional state atoms
};
\`\`\`

## Error Handling

- Graceful timeout handling with user feedback
- Clear error messages for invalid regex patterns
- Automatic cancellation cleanup
- Progress preservation on early termination

## Backend Integration

The search functionality integrates with a Rust backend through the following functions:

- `searchFiles`: Performs the actual file search
- `resetSearch`: Cancels an ongoing search
- `listenToSearchProgress`: Provides real-time search progress updates
