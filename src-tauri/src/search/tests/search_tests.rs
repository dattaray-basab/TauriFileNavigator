use crate::search::file_ops::search_file;
use regex::Regex;
use std::fs;
use std::path::Path;
use tempfile::tempdir;

fn create_test_file(dir: &Path, filename: &str, content: &str) -> std::path::PathBuf {
    let file_path = dir.join(filename);
    fs::write(&file_path, content).unwrap();
    file_path
}

#[test]
fn test_case_sensitive_file_search() {
    let dir = tempdir().unwrap();
    let file_path = create_test_file(
        dir.path(),
        "test.txt",
        "Hello World\nhello world\nHELLO WORLD",
    );

    let regex = Regex::new("Hello").unwrap();
    let result = search_file(&file_path, &regex).unwrap();

    assert_eq!(result.matches.len(), 1);
    assert_eq!(result.matches[0].line, 1);
    assert_eq!(result.matches[0].content, "Hello World");
}

#[test]
fn test_case_insensitive_file_search() {
    let dir = tempdir().unwrap();
    let file_path = create_test_file(
        dir.path(),
        "test.txt",
        "Hello World\nhello world\nHELLO WORLD",
    );

    let regex = Regex::new("(?i)hello").unwrap();
    let result = search_file(&file_path, &regex).unwrap();

    assert_eq!(result.matches.len(), 3);
    assert_eq!(result.matches[0].line, 1);
    assert_eq!(result.matches[1].line, 2);
    assert_eq!(result.matches[2].line, 3);
}

#[test]
fn test_whole_word_file_search() {
    let dir = tempdir().unwrap();
    let file_path = create_test_file(
        dir.path(),
        "test.txt",
        "hello\nhelloworld\nhello world\nhello!",
    );

    let regex = Regex::new(r"\bhello\b").unwrap();
    let result = search_file(&file_path, &regex).unwrap();

    assert_eq!(result.matches.len(), 3);
    assert_eq!(result.matches[0].line, 1);
    assert_eq!(result.matches[1].line, 3);
    assert_eq!(result.matches[2].line, 4);
}

#[test]
fn test_multiple_matches_per_line() {
    let dir = tempdir().unwrap();
    let file_path = create_test_file(dir.path(), "test.txt", "hello hello hello\nworld world");

    let regex = Regex::new("hello").unwrap();
    let result = search_file(&file_path, &regex).unwrap();

    assert_eq!(result.matches.len(), 1);
    assert_eq!(result.matches[0].match_ranges.len(), 3);
}

#[test]
fn test_empty_file() {
    let dir = tempdir().unwrap();
    let file_path = create_test_file(dir.path(), "test.txt", "");

    let regex = Regex::new("hello").unwrap();
    let result = search_file(&file_path, &regex);

    assert!(result.is_none());
}

#[test]
fn test_binary_file() {
    let dir = tempdir().unwrap();
    let file_path = dir.path().join("test.bin");
    fs::write(&file_path, [0u8, 1, 2, 3, 0, 4, 5, 6]).unwrap();

    let regex = Regex::new("hello").unwrap();
    let result = search_file(&file_path, &regex);

    assert!(result.is_none());
}

#[test]
fn test_unicode_file() {
    let dir = tempdir().unwrap();
    let file_path = create_test_file(dir.path(), "test.txt", "café\ncafe\nCAFÉ");

    let regex = Regex::new("café").unwrap();
    let result = search_file(&file_path, &regex).unwrap();

    assert_eq!(result.matches.len(), 1);
    assert_eq!(result.matches[0].line, 1);
}

#[test]
fn test_special_characters() {
    let dir = tempdir().unwrap();
    let file_path = create_test_file(
        dir.path(),
        "test.txt",
        "hello.world\nhello world\nhello.world!",
    );

    let regex = Regex::new("hello\\.world").unwrap();
    let result = search_file(&file_path, &regex).unwrap();

    assert_eq!(result.matches.len(), 2);
    assert_eq!(result.matches[0].line, 1);
    assert_eq!(result.matches[1].line, 3);
}
