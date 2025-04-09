use notify::Watcher;
use tempfile::TempDir;
use crate::notifications::tests::common::{setup_test_watcher, create_temp_dir, wait_for_event};
use crate::notifications::watch_ops::WatchTarget;
use std::time::Duration;
use crate::platform;

#[tokio::test]
async fn watch_filesys_should_detect_folder_creation() {
    // Create a temporary directory for testing
    let temp_dir = TempDir::new().expect("Failed to create temp dir");
    let test_path = temp_dir.path().join("test_folder");
    let parent = test_path.parent().unwrap();

    println!("Setting up watcher for folder: {:?}", test_path);

    // Set up watcher with FolderCreation target
    let (rx, mut watcher) = setup_test_watcher(
        platform::normalize_path(&parent.to_string_lossy().to_string()),
        Some(WatchTarget::FolderCreation),
    ).await;

    // Watch the parent directory
    println!("Watching parent directory: {:?}", parent);
    watcher.watch(parent, notify::RecursiveMode::NonRecursive)
        .expect("Failed to watch directory");

    println!("Watcher initialized, creating folder...");

    // Create the test folder
    create_temp_dir(&test_path).expect("Failed to create test folder");
    println!("Folder created, waiting for event...");

    // Collect events with a longer timeout
    let mut events = Vec::new();
    let timeout = Duration::from_secs(5);
    let start_time = std::time::Instant::now();

    while start_time.elapsed() < timeout {
        if let Some(event) = wait_for_event(&rx, Duration::from_millis(500)) {
            events.push(event);
            if events.iter().any(|e| e.event_type == "folder-created" && e.path.contains("test_folder")) {
                break;
            }
        }
    }

    // Check that we received the creation event
    println!("Received {} events", events.len());
    for event in &events {
        println!("Event: {} - {}", event.event_type, event.path);
    }

    let has_creation = events.iter().any(|e| {
        e.event_type == "folder-created" &&
        platform::normalize_path(&e.path).contains("test_folder")
    });

    assert!(has_creation, "Missing folder creation event");
} 