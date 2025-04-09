import { useAtom } from "jotai";
import { useEffect } from "react";
import { invoke } from "@tauri-apps/api/tauri";
import { osTypeAtom, type OSType } from "../state/osState";

export const useOSType = () => {
  const [osType, setOSType] = useAtom(osTypeAtom);

  useEffect(() => {
    const initOSType = async () => {
      try {
        const detectedOS = await invoke<string>("get_os_type");
        setOSType(detectedOS as OSType);
      } catch (error) {
        console.error("Failed to detect OS type:", error);
      }
    };

    initOSType();
  }, [setOSType]);

  return osType;
};
