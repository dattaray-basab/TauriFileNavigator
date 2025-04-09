/**
 * Search-related Jotai states
 */

import { atom } from "jotai";
import {
  SEARCH_HISTORY_LENGTH,
  SEARCH_HISTORY_STORAGE_KEY,
} from "../constants/search";

// Search history atom
export const searchHistoryAtom = atom<string[]>([]);

// Create a derived atom for managing search history
export const searchHistoryManagerAtom = atom(
  (get) => get(searchHistoryAtom),
  (get, set, action: { type: "ADD" | "LOAD" | "CLEAR"; payload?: string }) => {
    const currentHistory = get(searchHistoryAtom);

    switch (action.type) {
      case "ADD": {
        if (!action.payload?.trim()) return; // Don't add empty searches

        // Remove the term if it already exists (to move it to the top)
        const filteredHistory = currentHistory.filter(
          (item: string) => item !== action.payload
        );

        // Add the term to the beginning of the array
        const newHistory = [action.payload, ...filteredHistory].slice(
          0,
          SEARCH_HISTORY_LENGTH
        );

        // Save to local storage
        try {
          localStorage.setItem(
            SEARCH_HISTORY_STORAGE_KEY,
            JSON.stringify(newHistory)
          );
        } catch (error) {
          console.error("Failed to save search history:", error);
        }

        set(searchHistoryAtom, newHistory);
        break;
      }

      case "LOAD": {
        try {
          const savedHistory = localStorage.getItem(SEARCH_HISTORY_STORAGE_KEY);
          if (savedHistory) {
            set(searchHistoryAtom, JSON.parse(savedHistory));
          }
        } catch (error) {
          console.error("Failed to load search history:", error);
        }
        break;
      }

      case "CLEAR": {
        set(searchHistoryAtom, []);
        try {
          localStorage.removeItem(SEARCH_HISTORY_STORAGE_KEY);
        } catch (error) {
          console.error("Failed to clear search history:", error);
        }
        break;
      }
    }
  }
);
