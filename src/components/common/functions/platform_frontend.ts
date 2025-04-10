// all platform operations

import { BACK_SLASH, FORWARD_SLASH } from "../constants/filesys";
import { useOSType } from "../hooks/useOSType";
import { invoke } from "@tauri-apps/api";

// Drive information type


// Cache the platform value for synchronous operations
let cachedPlatform: string | null = null;
// Cache the separator value
let cachedSeparator: string | null = null;

// Initialize the platform cache
const initPlatform = async () => {
  if (cachedPlatform === null) {
    try {
      cachedPlatform = await invoke<string>("get_os_type");
      // Initialize the separator cache based on the platform
      cachedSeparator = cachedPlatform === "win32" ? BACK_SLASH : FORWARD_SLASH;
    } catch (error) {
      console.error("Failed to get OS type from Tauri:", error);
      cachedPlatform = process.platform;
      // Initialize the separator cache based on the fallback platform
      cachedSeparator = cachedPlatform === "win32" ? BACK_SLASH : FORWARD_SLASH;
    }
  }
  return cachedPlatform;
};

// Initialize platform on module load
initPlatform().catch(console.error);

// We only need toPlatformPath when:
// Displaying paths to the user
// Interacting with the file system
// Passing paths to platform-specific APIs
export const toPlatformPath = (normalizedPath: string): string => {
  const separator = platform.getSeparator();

  // Special handling for Windows drive letters
  if (platform.isWindows()) {
    // Ensure drive letter format is C:\
    return normalizedPath.replace(/^([A-Za-z]):([\\/])?/, `$1:${separator}`);
  }

  return normalizedPath.replace(/\//g, separator);
};

export const platform = {
  // OS Detection
  getOS: () => {
    return cachedPlatform || process.platform;
  },

  // Path Operations
  getSeparator: () => {
    return (
      cachedSeparator ||
      (process.platform === "win32" ? BACK_SLASH : FORWARD_SLASH)
    );
  },

  isWindows: () => {
    const platform = cachedPlatform || process.platform;
    return platform === "win32";
  },

  isMac: () => {
    const platform = cachedPlatform || process.platform;
    return platform === "darwin";
  },

  isLinux: () => {
    const platform = cachedPlatform || process.platform;
    return platform === "linux";
  },

  // Path Normalization
  normalizePath: (path: string) => {
    return path.replace(/\\/g, FORWARD_SLASH);
  },

  // Home Directory Key
  getHomeEnvKey: () => {
    const platform = cachedPlatform || process.platform;
    return platform === "win32" ? "USERPROFILE" : "HOME";
  },

  // Hidden File Check
  isHiddenFile: (filename: string) => {
    const platform = cachedPlatform || process.platform;
    if (platform === "win32") {
      // Windows uses file attributes for hidden files
      // This requires checking the actual file attributes using Node.js fs.statSync
      // Files can be hidden without starting with a dot
      // Also, files starting with a dot aren't automatically hidden in Windows
      try {
        const fs = require("fs");
        const stats = fs.statSync(filename);
        return (stats.mode & 2) === 2; // Check hidden attribute
      } catch (error) {
        // If we can't check attributes, fallback to name-based check
        return filename.startsWith("$") || filename.startsWith("~$");
      }
    }
    // Unix-like systems (Mac, Linux) use dot prefix
    return filename.startsWith(".");
  },

  // System-specific Paths
  getSystemPaths: () => {
    const platform = cachedPlatform || process.platform;
    if (platform === "win32") {
      // Use environment variables for Windows paths
      return {
        // User specific paths - these expand based on current user
        desktop: "%USERPROFILE%\\Desktop",
        documents: "%USERPROFILE%\\Documents",
        downloads: "%USERPROFILE%\\Downloads",
        music: "%USERPROFILE%\\Music",
        pictures: "%USERPROFILE%\\Pictures",
        videos: "%USERPROFILE%\\Videos",

        // System paths - these might be on different drives
        programFiles: "%ProgramFiles%",
        programFilesX86: "%ProgramFiles(x86)%",
        systemRoot: "%SystemRoot%",
        systemDrive: "%SystemDrive%",

        // App data paths - user specific
        appData: "%APPDATA%",
        localAppData: "%LOCALAPPDATA%",
        programData: "%ProgramData%",
        temp: "%TEMP%",

        // Shared paths
        public: "%PUBLIC%",
      };
    }

    // Unix-like systems (Mac/Linux)
    return {
      // User specific paths
      desktop: "$HOME/Desktop",
      documents: "$HOME/Documents",
      downloads: "$HOME/Downloads",
      music: "$HOME/Music",
      pictures: "$HOME/Pictures",
      videos: "$HOME/Videos",

      // System paths
      home: "$HOME",
      root: "/",
      tmp: "/tmp",
      etc: "/etc",
      var: "/var",
      opt: "/opt",

      // macOS specific
      ...(platform === "darwin"
        ? {
            applications: "/Applications",
            userApplications: "$HOME/Applications",
            library: "$HOME/Library",
          }
        : {}),
    };
  },

  // File Extension Handling
  getExecutableExtensions: () => {
    const platform = cachedPlatform || process.platform;
    if (platform === "win32") {
      return [".exe", ".bat", ".cmd", ".com"];
    }
    // Unix-like systems don't require extensions for executables
    return [""];
  },

  // System Commands
  getOpenCommand: () => {
    const platform = cachedPlatform || process.platform;
    switch (platform) {
      case "win32":
        return "start";
      case "darwin":
        return "open";
      default: // Linux
        return "xdg-open";
    }
  },

  // File URL Conversion
  filePathToUrl: (path: string) => {
    const platform = cachedPlatform || process.platform;
    const normalized = path.replace(/\\/g, FORWARD_SLASH);
    if (platform === "win32") {
      // Windows paths need special handling
      return `file:///${normalized}`;
    }
    return `file://${normalized}`;
  },

  // Case Sensitivity Check
  isCaseSensitiveFS: () => {
    const platform = cachedPlatform || process.platform;
    // Windows and macOS (by default) are case-insensitive
    // Linux is case-sensitive
    return platform === "linux";
  },

  // Line Ending Normalization
  normalizeLineEndings: (content: string) => {
    const platform = cachedPlatform || process.platform;
    if (platform === "win32") {
      return content.replace(/\r?\n/g, "\r\n"); // Windows: CRLF
    }
    return content.replace(/\r?\n/g, "\n"); // Unix: LF
  },

  // Default Text Editor Command
  getDefaultEditor: () => {
    const platform = cachedPlatform || process.platform;
    switch (platform) {
      case "win32":
        return "notepad";
      case "darwin":
        return "open -t";
      default: // Linux
        return "xdg-open";
    }
  },

  // System-specific Key Mappings
  getModifierKey: () => {
    const platform = cachedPlatform || process.platform;
    return platform === "darwin" ? "⌘" : "Ctrl";
  },

  // System-specific File Restrictions
  getInvalidFilenameChars: () => {
    const platform = cachedPlatform || process.platform;
    if (platform === "win32") {
      return ["<", ">", ":", '"', "/", "\\", "|", "?", "*"];
    }
    // Unix-like systems only forbid '/' in filenames
    return ["/"];
  },

  // Add a new function to resolve these paths
  resolveSystemPath: (pathKey: string) => {
    const currentPlatform = cachedPlatform || process.platform;
    const paths = platform.getSystemPaths();
    const rawPath = paths[pathKey as keyof typeof paths];

    if (!rawPath) return null;

    if (currentPlatform === "win32") {
      // Windows: resolve environment variables
      return rawPath.replace(
        /%([^%]+)%/g,
        (_: string, n: string) => process.env[n] || ""
      );
    } else {
      // Unix: resolve $HOME and other vars
      return rawPath.replace(
        /\$([A-Za-z_][A-Za-z0-9_]*)/g,
        (_: string, n: string) => process.env[n] || ""
      );
    }
  },

  // Drive Information - This needs to be async due to Tauri invoke

};

// Hook for reactive platform checks
export const usePlatform = () => {
  const osType = useOSType();

  return {
    ...platform,
    currentOS: osType,
    isCurrentOS: (os: string) => osType === os,
  };
};
