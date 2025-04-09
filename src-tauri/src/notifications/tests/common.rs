use notify::{Config, Event, EventKind, Watcher};
use notify::event::ModifyKind;
use std::path::PathBuf;
use std::sync::mpsc::{channel, Receiver};
use std::time::Duration;
use crate::notifications::watch_ops::WatchTarget;
use crate::platforms;

#[derive(Debug)]
pub struct FileSystemEvent {
    pub event_type: String,
    pub path: String,
}

pub async fn setup_test_watcher(
    _test_path: String,
    target: Option<WatchTarget>,
) -> (Receiver<FileSystemEvent>, notify::RecommendedWatcher) {
    let (tx, rx) = channel();

    let watcher = Watcher::new(
        move |res: Result<Event, notify::Error>| {
            if let Ok(event) = res {
                let send_event = |event_type: &str, path: String| {
                    let _ = tx.send(FileSystemEvent {
                        event_type: event_type.to_string(),
                        path: platform::normalize_path(&path),
                    });
                };

                match event.kind {
                    EventKind::Create(_) => {
                        let path = &event.paths[0];
                        if path.exists() {
                            let normalized_path = platform::normalize_path(&path.to_string_lossy());
                            if path.is_dir() {
                                if matches!(target, None | Some(WatchTarget::FolderCreation) | Some(WatchTarget::All)) {
                                    send_event("folder-created", normalized_path);
                                }
                            } else if path.is_file() {
                                if matches!(target, None | Some(WatchTarget::FileCreation) | Some(WatchTarget::All)) {
                                    send_event("file-created", normalized_path);
                                }
                            }
                        }
                    },
                    EventKind::Remove(_) => {
                        if matches!(target, None | Some(WatchTarget::FileDeletion) | Some(WatchTarget::All)) {
                            send_event("file-deleted", event.paths[0].to_string_lossy().to_string());
                        }
                        if matches!(target, None | Some(WatchTarget::FolderDeletion) | Some(WatchTarget::All)) {
                            send_event("folder-deleted", event.paths[0].to_string_lossy().to_string());
                        }
                    },
                    EventKind::Modify(ModifyKind::Data(_)) => {
                        if matches!(target, None | Some(WatchTarget::FileModification) | Some(WatchTarget::All)) {
                            send_event("file-modified", event.paths[0].to_string_lossy().to_string());
                        }
                    },
                    EventKind::Modify(ModifyKind::Name(_)) => {
                        if event.paths.iter().any(|p| p.is_file()) {
                            if matches!(target, None | Some(WatchTarget::FileRename) | Some(WatchTarget::All)) {
                                send_event("file-renamed", event.paths[0].to_string_lossy().to_string());
                            }
                        } else {
                            if matches!(target, None | Some(WatchTarget::FolderRename) | Some(WatchTarget::All)) {
                                send_event("folder-renamed", event.paths[0].to_string_lossy().to_string());
                            }
                        }
                    }
                    _ => {}
                }
            }
        },
        Config::default(),
    )
    .expect("Failed to create watcher");

    (rx, watcher)
}

pub fn wait_for_event(rx: &Receiver<FileSystemEvent>, timeout: Duration) -> Option<FileSystemEvent> {
    rx.recv_timeout(timeout).ok()
}

pub fn create_temp_file(path: &PathBuf) -> std::io::Result<()> {
    std::fs::write(path, "test content")?;
    Ok(())
}

pub fn create_temp_dir(path: &PathBuf) -> std::io::Result<()> {
    std::fs::create_dir_all(path)?;
    Ok(())
}

pub fn delete_temp_file(path: &PathBuf) -> std::io::Result<()> {
    std::fs::remove_file(path)?;
    Ok(())
}

pub fn delete_temp_dir(path: &PathBuf) -> std::io::Result<()> {
    std::fs::remove_dir_all(path)?;
    Ok(())
}

pub fn modify_temp_file(path: &PathBuf) -> std::io::Result<()> {
    std::fs::write(path, "modified content")?;
    Ok(())
}

pub fn rename_temp_file(old_path: &PathBuf, new_path: &PathBuf) -> std::io::Result<()> {
    std::fs::rename(old_path, new_path)?;
    Ok(())
}

pub fn rename_temp_dir(old_path: &PathBuf, new_path: &PathBuf) -> std::io::Result<()> {
    std::fs::rename(old_path, new_path)?;
    Ok(())
}
