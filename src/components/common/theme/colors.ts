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
export const themeColors = {
  bg: {
    hi: {
      light: "bg-white", // Lightest
      dark: "bg-gray-800", // Medium dark
    },
    med: {
      light: "bg-gray-50", // Light gray
      dark: "bg-gray-600", // Lighter dark
    },
    lo: {
      light: "bg-gray-100", // Darker gray
      dark: "bg-gray-900", // Darkest
    },
  },
  fg: {
    hi: {
      light: "text-gray-900",
      dark: "text-gray-100",
    },
    med: {
      light: "text-gray-700",
      dark: "text-gray-200",
    },
    lo: {
      light: "text-gray-500",
      dark: "text-gray-300",
    },
  },
  border: {
    hi: {
      light: "border-gray-300",
      dark: "border-gray-500",
    },
    med: {
      light: "border-gray-200",
      dark: "border-gray-600",
    },
    lo: {
      light: "border-gray-100",
      dark: "border-gray-700",
    },
  },
  shadow: {
    hi: {
      light: "shadow-lg",
      dark: "shadow-black/40",
    },
    med: {
      light: "shadow-md",
      dark: "shadow-black/30",
    },
    lo: {
      light: "shadow-sm",
      dark: "shadow-black/20",
    },
  },
  hover: {
    hi: {
      light: "bg-gray-200",
      dark: "bg-gray-500",
    },
    med: {
      light: "bg-gray-100",
      dark: "bg-gray-700 text-gray-200",
    },
    lo: {
      light: "bg-gray-50",
      dark: "bg-gray-800 text-gray-300",
    },
  },
  hoverBorder: {
    hi: {
      light: "hover:border-black",
      dark: "hover:border-white",
    },
  },
  menu: {
    hi: {
      light: "text-gray-800",
      dark: "text-gray-100",
    },
    med: {
      light: "text-gray-600",
      dark: "text-gray-300",
    },
    lo: {
      light: "text-gray-500",
      dark: "text-gray-400",
    },
  },
  separator: {
    hi: {
      light: "border-gray-300",
      dark: "border-gray-600",
    },
    med: {
      light: "border-gray-200",
      dark: "border-gray-700",
    },
    lo: {
      light: "border-gray-100",
      dark: "border-gray-800",
    },
  },
  highlight: {
    name: {
      light: "bg-blue-100 text-blue-900",
      dark: "bg-blue-700/50 text-blue-100",
    },
    content: {
      light: "bg-yellow-200 text-yellow-900",
      dark: "bg-yellow-700/50 text-yellow-100",
    },
    active: {
      light: "bg-orange-400 text-orange-900 ring-2 ring-orange-500",
      dark: "bg-orange-500/70 text-orange-100 ring-2 ring-orange-400",
    },
    badge: {
      light: "bg-blue-100 text-blue-800",
      dark: "bg-blue-600 text-blue-100",
    },
    focus: {
      light:
        "focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-offset-1",
      dark: "focus:ring-2 focus:ring-blue-400 focus:outline-none focus:ring-offset-1 focus:ring-offset-gray-800",
    },
    focusWithin: {
      light:
        "focus-within:ring-2 focus-within:ring-blue-500 focus-within:outline-none focus-within:ring-offset-1",
      dark: "focus-within:ring-2 focus-within:ring-blue-400 focus-within:outline-none focus-within:ring-offset-1 focus-within:ring-offset-gray-800",
    },
  },
  navButton: {
    enabled: {
      light:
        "p-1 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-800 cursor-pointer",
      dark: "p-1 rounded-full bg-gray-600 hover:bg-gray-500 text-gray-200 cursor-pointer",
    },
    disabled: {
      light: "p-1 rounded-full text-gray-400 cursor-not-allowed",
      dark: "p-1 rounded-full text-gray-500 cursor-not-allowed",
    },
    counter: {
      light: "text-sm",
      dark: "text-sm text-white",
    },
  },
} as const;

export function evaluate(isDark: boolean) {
  const result: Record<string, any> = {};

  for (const [category, values] of Object.entries(themeColors)) {
    result[category] = {};
    for (const [level, modes] of Object.entries(values)) {
      result[category][level] = isDark ? modes.dark : modes.light;
    }
  }

  return result;
}
