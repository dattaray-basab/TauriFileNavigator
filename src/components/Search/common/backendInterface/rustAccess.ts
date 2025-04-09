import { invoke } from "@tauri-apps/api/tauri";
import { listen } from "@tauri-apps/api/event";
import type { SearchFileResult } from "../stateMgt";

export interface SearchResponse {
  results: SearchFileResult[];
  stats: {
    files_searched: number;
    total_matches: number;
    directories_searched: number;
    processing_time_ms: number;
  };
  cancelled: boolean;
  curtailed: boolean;
}

export interface SearchProgress {
  files_searched: number;
  directories_searched: number;
  total_matches: number;
  processing_time_ms: number;
}

export const searchFiles = async (
  path: string,
  query: string,
  isRegex: boolean,
  isCaseSensitive: boolean,
  isWholeWord: boolean,
  timeoutSeconds: number
): Promise<SearchResponse> => {
  return invoke("search_folder", {
    path,
    query,
    isRegex,
    isCaseSensitive,
    isWholeWord,
    timeoutSeconds,
  });
};

export const cancelSearch = async (): Promise<void> => {
  return invoke("cancel_search");
};

export const listenToSearchProgress = (
  callback: (progress: SearchProgress) => void
): Promise<() => void> => {
  return listen<SearchProgress>("search-progress", (event) => {
    callback(event.payload);
  });
};
