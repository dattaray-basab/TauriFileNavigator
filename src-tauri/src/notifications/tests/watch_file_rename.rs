use notify::Watcher;
use tempfile::TempDir;
use std::time::Duration;
use crate::notifications::tests::common::{setup_test_watcher, create_temp_file, wait_for_event};
use crate::notifications::watch_ops::WatchTarget;
use crate::platform;

#[tokio::test]
async fn watch_filesys_should_detect_file_rename() {
    // Create a temporary directory for testing
    let temp_dir = TempDir::new().expect("Failed to create temp dir");
    let test_path = temp_dir.path().join("test_file.txt");
    let new_file_path = temp_dir.path().join("renamed_file.txt");
    let parent = test_path.parent().unwrap();

    println!("Setting up watcher for file: {:?}", test_path);

    // Set up watcher with FileRename target
    let (rx, mut watcher) = setup_test_watcher(
        platform::normalize_path(&test_path.to_string_lossy().to_string()),
        Some(WatchTarget::FileRename),
    ).await;

    // Watch the parent directory
    println!("Watching parent directory: {:?}", parent);
    watcher.watch(parent, notify::RecursiveMode::NonRecursive)
        .expect("Failed to watch directory");

    println!("Watcher initialized, creating file...");

    // Create and then rename the test file
    create_temp_file(&test_path).expect("Failed to create test file");
    println!("File created, waiting for event...");

    // Wait a bit to ensure the file creation event is processed
    tokio::time::sleep(Duration::from_millis(500)).await;

    // Rename the file and collect events
    std::fs::rename(&test_path, &new_file_path).expect("Failed to rename test file");
    println!("File renamed, waiting for event...");

    // Collect events with a longer timeout
    let mut events = Vec::new();
    let timeout = Duration::from_secs(5);
    let start_time = std::time::Instant::now();

    while start_time.elapsed() < timeout {
        if let Some(event) = wait_for_event(&rx, Duration::from_millis(500)) {
            events.push(event);
            if events.iter().any(|e| e.event_type == "file-renamed") {
                break;
            }
        }
    }

    // Check that we received the rename event
    println!("Received {} events", events.len());
    for event in &events {
        println!("Event: {} - {}", event.event_type, event.path);
    }

    let has_rename = events.iter().any(|e| {
        e.event_type == "file-renamed" &&
        (platform::normalize_path(&e.path) == platform::normalize_path(&test_path.to_string_lossy().to_string()) ||
         platform::normalize_path(&e.path) == platform::normalize_path(&new_file_path.to_string_lossy().to_string()))
    });

    assert!(has_rename, "Missing file rename event");
} 