/**
 * MIT License
 *
 * Copyright (c) 2025 Basab Dattaray
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 *
 * The author would like to give special thanks to the contributors of https://github.com/Souvlaki42/file-manager.git
 * for providing inspiration for this project.
 */

import { useState, useCallback, useMemo } from "react";

export const MemoAndCallback = ({ factor }: { factor: number }) => {
  const [baseNumber, setBaseNumber] = useState(10);
  const [exponent, setExponent] = useState(2);

  const calculatePower = useCallback(
    useMemo(() => {
      console.log("Calculating power...");
      return (adjustment: number) => {
        console.log("Applying factor...");
        const result = Math.pow(baseNumber, exponent) * factor + adjustment;
        return result;
      };
    }, [baseNumber, exponent, factor]),
    [baseNumber, exponent, factor]
  );

  return (
    <div>
      <p>Base Number: {baseNumber}</p>
      <button onClick={() => setBaseNumber(baseNumber + 1)}>
        Increment Base
      </button>
      <p>Exponent: {exponent}</p>
      <button onClick={() => setExponent(exponent + 1)}>
        Increment Exponent
      </button>
      <p>Factor: {factor}</p>
      <p>Result: {calculatePower(5)}</p>
    </div>
  );
};
