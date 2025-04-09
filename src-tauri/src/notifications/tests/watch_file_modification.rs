use notify::Watcher;
use tempfile::TempDir;
use std::time::Duration;
use crate::notifications::tests::common::{setup_test_watcher, create_temp_file, wait_for_event};
use crate::notifications::watch_ops::WatchTarget;
use crate::platforms;

#[tokio::test]
async fn watch_filesys_should_detect_file_modification() {
    // Create a temporary directory for testing
    let temp_dir = TempDir::new().expect("Failed to create temp dir");
    let test_path = temp_dir.path().join("test_file.txt");
    let parent = test_path.parent().unwrap();

    println!("Setting up watcher for file: {:?}", test_path);

    // Set up watcher with FileModification target
    let (rx, mut watcher) = setup_test_watcher(
        platform::normalize_path(&test_path.to_string_lossy().to_string()),
        Some(WatchTarget::FileModification),
    ).await;

    // Watch the parent directory
    println!("Watching parent directory: {:?}", parent);
    watcher.watch(parent, notify::RecursiveMode::NonRecursive)
        .expect("Failed to watch directory");

    println!("Watcher initialized, creating file...");

    // Create the test file
    create_temp_file(&test_path).expect("Failed to create test file");

    println!("File created, waiting for event...");

    // Wait for the event
    if let Some(event) = wait_for_event(&rx, Duration::from_secs(2)) {
        assert_eq!(event.event_type, "file-modified");
        let expected_path = platform::normalize_path(&test_path.to_string_lossy().to_string());
        let actual_path = platform::normalize_path(&event.path);
        assert_eq!(actual_path, expected_path);
        println!("Successfully received modification event for path: {}", event.path);
    } else {
        panic!("Failed to receive event within timeout");
    }
}
