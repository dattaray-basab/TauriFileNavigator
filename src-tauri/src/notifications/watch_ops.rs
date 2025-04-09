// MIT License
//
// Copyright (c) 2025 Basab Dattaray
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.
//
// The author would also like to give special thanks to the contributors of https://github.com/Souvlaki42/file-manager.git
// for providing inspiration for this project.

use notify::{Config, RecommendedWatcher, RecursiveMode, Watcher};
use std::path::Path;
use std::sync::Mutex;
use tauri::Runtime;
use tauri::Manager;
use serde::{Deserialize, Serialize};
use crate::platform;

#[derive(Debug, Clone, Deserialize, Serialize)]
pub enum WatchTarget {
    FileCreation,
    FileDeletion,
    FileModification,
    FileRename,
    FolderCreation,
    FolderDeletion,
    FolderRename,
    All,  // New variant for watching all events
}

#[tauri::command]
pub async fn watch_filesys<R: Runtime>(
    app_handle: tauri::AppHandle<R>,
    path: String,
    target: Option<WatchTarget>,  // Make target optional
) -> Result<(), String> {
    println!("Setting up watcher for path: {:?}", path);
    let app_handle_clone = app_handle.clone();

    // Normalize the path for the current platform
    let normalized_path = platform::normalize_path(&path);

    let mut watcher: RecommendedWatcher = Watcher::new(
        move |res: Result<notify::Event, notify::Error>| {
            if let Ok(event) = res {
                let emit_event = |event_type: &str, path: String| {
                    // Normalize the path for the current platform
                    let normalized_path = platform::normalize_path(&path);
                    let _ = app_handle_clone.emit_all(
                        event_type,
                        serde_json::json!({ "path": normalized_path }),
                    );
                };

                match event.kind {
                    notify::EventKind::Create(_) => {
                        // For creation events, we need to check if the path exists and is a directory
                        let path = &event.paths[0];
                        if path.exists() {
                            let normalized_path = platform::normalize_path(&path.to_string_lossy());
                            if path.is_dir() {
                                if matches!(target, Some(WatchTarget::FolderCreation) | Some(WatchTarget::All) | None) {
                                    let _ = app_handle_clone.emit_all(
                                        "folder-created",
                                        serde_json::json!({ "path": normalized_path }),
                                    );
                                }
                            } else if path.is_file() {
                                if matches!(target, Some(WatchTarget::FileCreation) | Some(WatchTarget::All) | None) {
                                    let _ = app_handle_clone.emit_all(
                                        "file-created",
                                        serde_json::json!({ "path": normalized_path }),
                                    );
                                }
                            }
                        }
                    },
                    notify::EventKind::Remove(_) => {
                        // For deletion events, we can't check is_file() since the path no longer exists
                        // We'll rely on the target type or emit both events for All/None
                        if matches!(target, Some(WatchTarget::FileDeletion) | Some(WatchTarget::All) | None) {
                            emit_event("file-deleted", event.paths[0].to_string_lossy().to_string());
                        }
                        if matches!(target, Some(WatchTarget::FolderDeletion) | Some(WatchTarget::All) | None) {
                            emit_event("folder-deleted", event.paths[0].to_string_lossy().to_string());
                        }
                    },
                    notify::EventKind::Modify(notify::event::ModifyKind::Data(_)) => {
                        if matches!(target, Some(WatchTarget::FileModification) | Some(WatchTarget::All) | None) {
                            emit_event("file-modified", event.paths[0].to_string_lossy().to_string());
                        }
                    },
                    notify::EventKind::Modify(notify::event::ModifyKind::Name(_)) => {
                        if event.paths.iter().any(|p| p.is_file()) {
                            if matches!(target, Some(WatchTarget::FileRename) | Some(WatchTarget::All) | None) {
                                emit_event("file-renamed", event.paths[0].to_string_lossy().to_string());
                            }
                        } else {
                            if matches!(target, Some(WatchTarget::FolderRename) | Some(WatchTarget::All) | None) {
                                emit_event("folder-renamed", event.paths[0].to_string_lossy().to_string());
                            }
                        }
                    },
                    _ => {}
                }
            }
        },
        Config::default(),
    )
    .map_err(|e| e.to_string())?;

    // Watch the path
    watcher
        .watch(Path::new(&normalized_path), RecursiveMode::Recursive)
        .map_err(|e| e.to_string())?;

    // Store watcher in app state to keep it alive
    let watchers = app_handle.state::<Mutex<Vec<RecommendedWatcher>>>();
    watchers.lock().unwrap().push(watcher);

    Ok(())
} 