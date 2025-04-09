import { useState, useCallback, useMemo } from "react";

export const HookMemoAndCallback = ({ multiplier }: { multiplier: number }) => {
  const [count, setCount] = useState(0);

  // A function that's both memoized for its identity (useCallback)
  // and whose result is memoized (useMemo)
  const expensiveOperation = useCallback(
    useMemo(() => {
      console.log("Expensive operation running!");
      return () => {
        console.log("Inner function running!");
        return count * multiplier;
      };
    }, [count, multiplier]),
    [count, multiplier]
  );

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>Increment</button>
      <p>Result: {expensiveOperation()}</p>
    </div>
  );
};
