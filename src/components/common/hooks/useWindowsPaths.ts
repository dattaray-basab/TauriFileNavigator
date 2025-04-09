import { invoke } from "@tauri-apps/api/tauri";
import { useEffect, useState } from "react";
import { useOSType } from "./useOSType";

export interface WindowsPath {
  label: string;
  path: string;
}

export function useWindowsPaths() {
  const [commonPaths, setCommonPaths] = useState<WindowsPath[]>([]);
  const osType = useOSType();

  useEffect(() => {
    const loadWindowsPaths = async () => {
      if (osType === "Windows") {
        try {
          const paths = await invoke<[string, string][]>(
            "get_windows_common_paths"
          );
          setCommonPaths(
            paths.map(([label, path]) => ({
              label,
              path,
            }))
          );
        } catch (error) {
          console.error("Failed to load Windows common paths:", error);
        }
      }
    };

    loadWindowsPaths();
  }, [osType]);

  return {
    commonPaths,
    isWindows: osType === "Windows",
  };
}
