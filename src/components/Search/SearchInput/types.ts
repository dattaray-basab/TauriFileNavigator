export interface SearchFileResult {
  path: string;
  matches: SearchMatch[];
}

export interface SearchMatch {
  line: number;
  content: string;
}
