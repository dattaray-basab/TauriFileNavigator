use notify::Watcher;
use tempfile::TempDir;
use std::time::Duration;
use crate::notifications::tests::common::{setup_test_watcher, create_temp_file, create_temp_dir, delete_temp_file, delete_temp_dir, modify_temp_file, rename_temp_file, rename_temp_dir, wait_for_event};
use crate::notifications::watch_ops::WatchTarget;
use crate::platform;

#[tokio::test]
async fn watch_filesys_should_detect_all_events() {
    // Create a temporary directory for testing
    let temp_dir = TempDir::new().expect("Failed to create temp dir");
    let test_file = temp_dir.path().join("test_file.txt");
    let test_folder = temp_dir.path().join("test_folder");
    let renamed_file = temp_dir.path().join("renamed_file.txt");
    let renamed_folder = temp_dir.path().join("renamed_folder");
    let parent = temp_dir.path();

    println!("Setting up watcher for directory: {:?}", parent);

    // Set up watcher with All target
    let (rx, mut watcher) = setup_test_watcher(
        platform::normalize_path(&parent.to_string_lossy().to_string()),
        Some(WatchTarget::All),
    ).await;

    // Watch the parent directory
    println!("Watching parent directory: {:?}", parent);
    watcher.watch(parent, notify::RecursiveMode::NonRecursive)
        .expect("Failed to watch directory");

    // Perform all operations with delays between them
    println!("Creating test files and folders...");
    
    // File creation
    create_temp_file(&test_file).expect("Failed to create test file");
    tokio::time::sleep(Duration::from_millis(500)).await;
    
    // Folder creation
    create_temp_dir(&test_folder).expect("Failed to create test folder");
    tokio::time::sleep(Duration::from_millis(500)).await;
    
    // File modification
    modify_temp_file(&test_file).expect("Failed to modify test file");
    tokio::time::sleep(Duration::from_millis(500)).await;
    
    // File rename
    rename_temp_file(&test_file, &renamed_file).expect("Failed to rename test file");
    tokio::time::sleep(Duration::from_millis(500)).await;
    
    // Folder rename
    rename_temp_dir(&test_folder, &renamed_folder).expect("Failed to rename test folder");
    tokio::time::sleep(Duration::from_millis(500)).await;
    
    // File deletion
    delete_temp_file(&renamed_file).expect("Failed to delete test file");
    tokio::time::sleep(Duration::from_millis(500)).await;
    
    // Folder deletion
    delete_temp_dir(&renamed_folder).expect("Failed to delete test folder");

    // Collect events
    let mut events = Vec::new();
    let timeout = Duration::from_secs(10); // Increased timeout for all events
    let start_time = std::time::Instant::now();

    while start_time.elapsed() < timeout {
        if let Some(event) = wait_for_event(&rx, Duration::from_millis(500)) {
            println!("Received event: {} - {}", event.event_type, event.path);
            events.push(event);
        }
    }

    // Helper function to check if an event exists
    let has_event = |event_type: &str, path: &std::path::Path| {
        let normalized_path = platform::normalize_path(&path.to_string_lossy().to_string());
        events.iter().any(|e| {
            e.event_type == event_type && 
            platform::normalize_path(&e.path) == normalized_path
        })
    };

    // Helper function to check if a rename event exists
    let has_rename_event = |event_type: &str, old_path: &std::path::Path, new_path: &std::path::Path| {
        let old_normalized = platform::normalize_path(&old_path.to_string_lossy().to_string());
        let new_normalized = platform::normalize_path(&new_path.to_string_lossy().to_string());
        events.iter().any(|e| {
            e.event_type == event_type && 
            (platform::normalize_path(&e.path) == old_normalized ||
             platform::normalize_path(&e.path) == new_normalized)
        })
    };

    // Print all events for debugging
    println!("\nAll received events:");
    for event in &events {
        println!("Event: {} - {}", event.event_type, event.path);
    }

    // Verify all expected events occurred
    assert!(has_event("file-created", &test_file), "Missing file creation event");
    assert!(has_event("folder-created", &test_folder), "Missing folder creation event");
    assert!(has_event("file-modified", &test_file), "Missing file modification event");
    assert!(has_rename_event("file-renamed", &test_file, &renamed_file), "Missing file rename event");
    assert!(has_rename_event("folder-renamed", &test_folder, &renamed_folder), "Missing folder rename event");
    assert!(has_event("file-deleted", &renamed_file), "Missing file deletion event");
    assert!(has_event("folder-deleted", &renamed_folder), "Missing folder deletion event");
} 