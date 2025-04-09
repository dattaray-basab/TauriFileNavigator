import type { SearchFileResult } from "../stateMgt";

// Event types
export type SearchEventType =
  | "SEARCH_STARTED"
  | "SEARCH_COMPLETED"
  | "SEARCH_CANCELLED"
  | "SEARCH_ERROR"
  | "RESULTS_UPDATED";

// Event payloads
export interface SearchEventPayloads {
  SEARCH_STARTED: { query: string; path: string };
  SEARCH_COMPLETED: { results: SearchFileResult[] };
  SEARCH_CANCELLED: { reason?: "timeout" | "user" | "aborted" };
  SEARCH_ERROR: { error: Error };
  RESULTS_UPDATED: { results: SearchFileResult[] };
}

type Subscriber<T> = (payload: T) => void;
type Unsubscribe = () => void;

// Event emitter class
class SearchEventEmitter {
  private static instance: SearchEventEmitter;
  private subscribers = new Map<SearchEventType, Set<Subscriber<any>>>();

  private constructor() {}

  static getInstance(): SearchEventEmitter {
    if (!SearchEventEmitter.instance) {
      SearchEventEmitter.instance = new SearchEventEmitter();
    }
    return SearchEventEmitter.instance;
  }

  subscribe<T extends SearchEventType>(
    event: T,
    callback: Subscriber<SearchEventPayloads[T]>
  ): Unsubscribe {
    if (!this.subscribers.has(event)) {
      this.subscribers.set(event, new Set());
    }

    this.subscribers.get(event)!.add(callback);

    return () => {
      const subs = this.subscribers.get(event);
      if (subs) {
        subs.delete(callback);
        if (subs.size === 0) {
          this.subscribers.delete(event);
        }
      }
    };
  }

  emit<T extends SearchEventType>(
    event: T,
    payload: SearchEventPayloads[T]
  ): void {
    const subs = this.subscribers.get(event);
    if (subs) {
      subs.forEach((callback) => callback(payload));
    }
  }
}

// Hook for using search events
export function useSearchEvents() {
  const emitter = SearchEventEmitter.getInstance();

  const emit = <T extends SearchEventType>(
    event: T,
    payload: SearchEventPayloads[T]
  ): void => {
    emitter.emit(event, payload);
  };

  const subscribe = <T extends SearchEventType>(
    event: T,
    callback: Subscriber<SearchEventPayloads[T]>
  ): Unsubscribe => {
    return emitter.subscribe(event, callback);
  };

  return { emit, subscribe };
}
