import { useTheme } from "@/components/common";
import { useState, useEffect, useCallback } from "react";

// Timeout constants
const MIN_TIMEOUT = 1; // 1 second
const MAX_TIMEOUT = 3600; // 60 minutes
const DEFAULT_TIMEOUT = 45; // 45 seconds

// Convert linear slider value (0-100) to exponential seconds
const sliderToSeconds = (value: number): number => {
  const minLog = Math.log(MIN_TIMEOUT);
  const maxLog = Math.log(MAX_TIMEOUT);
  const scale = (maxLog - minLog) / 100;
  return Math.round(Math.exp(minLog + scale * value));
};

// Convert seconds to slider value (0-100)
const secondsToSlider = (seconds: number): number => {
  const minLog = Math.log(MIN_TIMEOUT);
  const maxLog = Math.log(MAX_TIMEOUT);
  const scale = (maxLog - minLog) / 100;
  return Math.round((Math.log(seconds) - minLog) / scale);
};

// Format timeout display
const formatTimeout = (seconds: number): string => {
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
  return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
};

interface TimeoutSliderProps {
  initialTimeout?: number;
  onTimeoutChange: (seconds: number) => void;
  resetTrigger?: number;
  disabled?: boolean;
}

export function TimeoutSlider({
  initialTimeout,
  onTimeoutChange,
  resetTrigger = 0,
  disabled = false,
}: TimeoutSliderProps) {
  const { theme } = useTheme();
  const initialValue = initialTimeout || DEFAULT_TIMEOUT;

  // Calculate the initial slider position (0-100)
  // For 45 seconds, this should be around 15-20% of the slider
  const initialSliderValue = Math.min(
    100,
    Math.max(
      0,
      Math.round(
        ((Math.log(initialValue) - Math.log(MIN_TIMEOUT)) /
          (Math.log(MAX_TIMEOUT) - Math.log(MIN_TIMEOUT))) *
          100
      )
    )
  );

  const [sliderValue, setSliderValue] = useState(initialSliderValue);
  const [currentTimeout, setCurrentTimeout] = useState(initialValue);
  const [showTooltip, setShowTooltip] = useState(false);

  // Reset to default when resetTrigger changes
  useEffect(() => {
    const defaultSliderValue = secondsToSlider(DEFAULT_TIMEOUT);
    setSliderValue(defaultSliderValue);
    setCurrentTimeout(DEFAULT_TIMEOUT);
    onTimeoutChange(DEFAULT_TIMEOUT);
  }, [resetTrigger, onTimeoutChange]);

  const handleSliderChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = parseInt(event.target.value, 10);
      setSliderValue(value);
      const newTimeout = sliderToSeconds(value);
      setCurrentTimeout(newTimeout);
      onTimeoutChange(newTimeout);
    },
    [onTimeoutChange]
  );

  const handleFocus = useCallback(() => setShowTooltip(true), []);
  const handleBlur = useCallback(() => setShowTooltip(false), []);

  return (
    <div
      className='flex items-center space-x-2 mb-2 w-full'
      role='group'
      aria-labelledby='timeout-label'>
      <span id='timeout-label' className={`text-xs ${theme.fg.med}`}>
        Timeout:
      </span>
      <div className='relative flex-grow'>
        <input
          type='range'
          min='0'
          max='100'
          value={sliderValue}
          onChange={handleSliderChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          disabled={disabled}
          aria-valuemin={MIN_TIMEOUT}
          aria-valuemax={MAX_TIMEOUT}
          aria-valuenow={currentTimeout}
          aria-valuetext={formatTimeout(currentTimeout)}
          className={`
            w-full h-1 rounded-lg appearance-none cursor-pointer
            ${disabled ? "opacity-50 cursor-not-allowed" : ""}
            ${theme.bg.lo}
            [&::-webkit-slider-thumb]:appearance-none
            [&::-webkit-slider-thumb]:w-4
            [&::-webkit-slider-thumb]:h-4
            [&::-webkit-slider-thumb]:rounded-full
            [&::-webkit-slider-thumb]:bg-blue-500
            [&::-webkit-slider-thumb]:hover:bg-blue-600
            [&::-webkit-slider-thumb]:focus:outline-none
            [&::-webkit-slider-thumb]:focus:ring-2
            [&::-webkit-slider-thumb]:focus:ring-blue-300
          `}
        />
        {showTooltip && (
          <div
            className={`
              absolute -top-8 left-1/2 transform -translate-x-1/2 
              px-2 py-1 rounded text-xs
              ${theme.bg.hi} ${theme.fg.hi}
              shadow-lg
            `}
            role='tooltip'>
            {formatTimeout(currentTimeout)}
          </div>
        )}
      </div>
      <span
        className={`text-xs ${theme.fg.hi} min-w-[60px] text-right`}
        aria-live='polite'>
        {formatTimeout(currentTimeout)}
      </span>
    </div>
  );
}

// Export utilities for external use if needed
export const timeoutUtils = {
  MIN_TIMEOUT,
  MAX_TIMEOUT,
  DEFAULT_TIMEOUT,
  sliderToSeconds,
  secondsToSlider,
  formatTimeout,
};
