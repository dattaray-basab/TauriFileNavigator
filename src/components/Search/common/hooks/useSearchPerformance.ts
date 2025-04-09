import { useState, useEffect } from "react";
import debounce from "lodash/debounce";

export interface PerformanceMetrics {
  processingTime: number;
  nodesExpanded: number;
  totalNodes: number;
  currentDepth: number;
  renderTime: number;
}

interface UseSearchPerformanceProps {
  searchLoading: boolean;
  expandingInProgress: boolean;
}

export function useSearchPerformance({
  searchLoading,
  expandingInProgress,
}: UseSearchPerformanceProps) {
  const [isRendering, setIsRendering] = useState(false);
  const [performance, setPerformance] = useState<PerformanceMetrics>({
    processingTime: 0,
    nodesExpanded: 0,
    totalNodes: 0,
    currentDepth: 0,
    renderTime: 0,
  });

  // Handle profiler render measurements
  const onRender = (
    _id: string,
    phase: string,
    actualDuration: number,
    _baseDuration: number,
    _startTime: number,
    _commitTime: number
  ) => {
    if (phase === "mount" || phase === "update") {
      setPerformance((prev) => ({
        ...prev,
        renderTime: prev.renderTime + actualDuration,
      }));
    }
  };

  // Monitor DOM mutations for performance
  useEffect(() => {
    if (expandingInProgress || searchLoading) {
      setIsRendering(true);
      let lastChangeTime = Date.now();
      let renderingCompleteTimeout: NodeJS.Timeout;
      let mutationCount = 0;
      const DEBOUNCE_TIME = 1000;
      const MUTATION_THRESHOLD = 20;

      const checkRenderingComplete = debounce(() => {
        const timeSinceLastChange = Date.now() - lastChangeTime;
        if (
          timeSinceLastChange >= DEBOUNCE_TIME &&
          !searchLoading &&
          !expandingInProgress
        ) {
          mutationCount = 0;
          setIsRendering(false);
        }
      }, 250);

      const mutationObserver = new MutationObserver((mutations) => {
        const significantChanges = mutations.filter(
          (m) => m.type === "childList" || m.type === "characterData"
        );

        if (significantChanges.length === 0) return;

        lastChangeTime = Date.now();
        mutationCount += significantChanges.length;

        if (mutationCount > MUTATION_THRESHOLD) {
          setIsRendering(true);
        }

        clearTimeout(renderingCompleteTimeout);
        renderingCompleteTimeout = setTimeout(
          checkRenderingComplete,
          DEBOUNCE_TIME
        );
      });

      const treeContainer = document.querySelector(".tree-view-container");
      if (treeContainer) {
        mutationObserver.observe(treeContainer, {
          childList: true,
          subtree: true,
          characterData: true,
        });
      }

      return () => {
        mutationObserver.disconnect();
        clearTimeout(renderingCompleteTimeout);
      };
    } else {
      setIsRendering(false);
    }
  }, [searchLoading, expandingInProgress]);

  const updateProcessingTime = (time: number) => {
    setPerformance((prev) => ({
      ...prev,
      processingTime: time,
    }));
  };

  const resetPerformance = () => {
    setPerformance({
      processingTime: 0,
      nodesExpanded: 0,
      totalNodes: 0,
      currentDepth: 0,
      renderTime: 0,
    });
  };

  return {
    performance,
    isRendering,
    onRender,
    updateProcessingTime,
    resetPerformance,
  };
}
