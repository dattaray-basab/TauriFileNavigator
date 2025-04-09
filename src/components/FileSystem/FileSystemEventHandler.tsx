import { useEffect } from "react";
import { listen } from "@tauri-apps/api/event";
import { invoke } from "@tauri-apps/api/tauri";
import { treeActions } from "../common/globalStateMgt/valtioTreeStates";
import { toPlatformPath } from "@/components/common/functions/platform";
import { BACK_SLASH, FORWARD_SLASH } from "@/components/common/constants/filesys";

interface FileSystemEvent {
  payload: {
    path: string;
  };
}

export const FileSystemEventHandler: React.FC<{ path: string }> = ({
  path,
}) => {
  useEffect(() => {
    const setupWatcher = async () => {
      try {
        await invoke("watch_filesys", { path });
        console.log("File system watcher initialized for:", path);
      } catch (error) {
        console.error("Failed to initialize file system watcher:", error);
      }
    };

    const unlisten: Promise<any>[] = [];

    const events = [
      "file-created",
      "file-deleted",
      "file-modified",
      "file-renamed",
      "folder-created",
      "folder-deleted",
      "folder-renamed",
    ];

    events.forEach((eventType) => {
      const promise = listen(eventType, async (event: FileSystemEvent) => {
        try {
          console.log(`Received ${eventType} event for: ${event.payload.path}`);

          // Convert path to platform-specific format for file system operations
          const platformPath = toPlatformPath(event.payload.path);
          const separator = platformPath.includes(BACK_SLASH)
            ? BACK_SLASH
            : FORWARD_SLASH;

          const parentPath = platformPath.substring(
            0,
            platformPath.lastIndexOf(separator)
          );

          if (eventType === "file-created" || eventType === "folder-created") {
            // First refresh the parent directory
            await treeActions.refreshNodeChildren(platformPath, 1);
            // Then expand all ancestors of the parent path
            treeActions.expandAncestry(parentPath);
          } else {
            // For other events, just refresh
            await treeActions.refreshNodeChildren(platformPath, 1);
          }
        } catch (error) {
          console.error(`Error handling ${eventType} event:`, error);
        }
      });
      unlisten.push(promise);
    });

    // Set up the watcher
    setupWatcher();

    // Cleanup function
    return () => {
      unlisten.forEach(async (promise) => {
        try {
          const unlistenFn = await promise;
          unlistenFn();
        } catch (error) {
          console.error("Error cleaning up event listener:", error);
        }
      });
    };
  }, [path]);

  return null;
};
