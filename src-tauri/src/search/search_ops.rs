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

use std::path::PathBuf;
use std::time::{Duration, Instant};
use std::collections::HashSet;
use tokio::sync::mpsc;
use std::sync::Mutex;
use once_cell::sync::Lazy;
use tauri::Window;
use std::fs;

use crate::search::types::{SearchResponse, SearchStats, SearchFileResult, SearchProgress};
use crate::search::regex::build_regex;
use crate::search::file_ops::should_search_directory;
use crate::search::constants::{
    MAX_RESULTS_PER_DIR,
    MAX_TOTAL_RESULTS,
    BATCH_SIZE,
    PROGRESS_UPDATE_INTERVAL,
    EARLY_RESULTS_INTERVAL,
};
use crate::search::process_directory_entry::process_directory_entry;
use crate::platforms;

// Global cancellation channel
static CANCEL_TX: Lazy<Mutex<Option<mpsc::Sender<()>>>> = Lazy::new(|| Mutex::new(None));

#[tauri::command]
pub async fn cancel_search() -> Result<(), String> {
    // Take ownership of the sender and drop the lock immediately
    let tx = CANCEL_TX.lock()
        .map_err(|_| "Failed to acquire lock".to_string())?
        .take();
    
    if let Some(tx) = tx {
        // Now we can await without holding the lock
        let _ = tx.send(()).await;
    }
    Ok(())
}

// Internal function to process batch results
fn process_batch_results(
    batch_results: &mut Vec<SearchFileResult>,
    results: &mut Vec<SearchFileResult>,
    stats: &SearchStats,
    start_time: &Instant,
    window: &Window,
) -> u64 {
    results.extend(batch_results.drain(..));
    let cumulative_time = start_time.elapsed().as_millis() as u64;
    
    let _ = window.emit("search-early-results", SearchResponse {
        results: results.clone(),
        stats: stats.clone(),
        cancelled: false,
        curtailed: false,
        processing_time_ms: cumulative_time
    });
    
    cumulative_time
}

#[tauri::command]
pub async fn search_folder(
    window: Window,
    path: String,
    query: String,
    is_regex: bool,
    is_case_sensitive: bool,
    is_whole_word: bool,
    timeout_seconds: u64,
) -> Result<SearchResponse, String> {
    let (tx, mut rx) = mpsc::channel(1);
    
    *CANCEL_TX.lock()
        .map_err(|_| "Failed to acquire lock".to_string())? = Some(tx);

    let timeout = Duration::from_secs(timeout_seconds);
    let start_time = Instant::now();
    let mut stats = SearchStats::default();
    let mut results = Vec::new();
    let mut visited_dirs = HashSet::new();
    let mut last_update = Instant::now();
    let mut last_early_results = Instant::now();
    let mut batch_results = Vec::new();
    let mut cumulative_time = 0;

    let regex = build_regex(&query, is_regex, is_case_sensitive, is_whole_word)?;
    
    // Normalize the search path for the current platform
    let normalized_path = platforms::normalize_path(&path);
    let mut dirs_to_search = vec![PathBuf::from(&normalized_path)];
    let mut curtailed = false;

    while let Some(current_dir) = dirs_to_search.pop() {
        if rx.try_recv().is_ok() {
            return Ok(SearchResponse { 
                results,
                stats,
                cancelled: true,
                curtailed: false,
                processing_time_ms: cumulative_time
            });
        }

        // Send results in batches
        if !batch_results.is_empty() && 
            (batch_results.len() >= BATCH_SIZE || last_early_results.elapsed() >= EARLY_RESULTS_INTERVAL) {
            cumulative_time = process_batch_results(
                &mut batch_results,
                &mut results,
                &stats,
                &start_time,
                &window
            );
            last_early_results = Instant::now();
        }

        if start_time.elapsed() > timeout || results.len() >= MAX_TOTAL_RESULTS {
            curtailed = true;
            break;
        }

        if !should_search_directory(&current_dir) || !visited_dirs.insert(current_dir.clone()) {
            continue;
        }

        let dir_entries = match fs::read_dir(&current_dir) {
            Ok(entries) => entries,
            Err(_) => continue,
        };

        let mut dir_results = Vec::new();
        let mut dir_files_searched = 0;

        for entry in dir_entries {
            let entry = match entry {
                Ok(e) => e,
                Err(_) => continue,
            };

            process_directory_entry(
                &entry,
                &regex,
                &mut dirs_to_search,
                &mut dir_results,
                &mut dir_files_searched,
                &mut stats,
            );
        }

        stats.files_searched += dir_files_searched;
        stats.directories_searched += 1;

        // Limit results per directory
        if dir_results.len() > MAX_RESULTS_PER_DIR {
            dir_results.truncate(MAX_RESULTS_PER_DIR);
        }

        batch_results.extend(dir_results);

        // Update progress periodically
        if last_update.elapsed() >= PROGRESS_UPDATE_INTERVAL {
            cumulative_time = start_time.elapsed().as_millis() as u64;
            let _ = window.emit("search-progress", SearchProgress {
                files_searched: stats.files_searched,
                directories_searched: stats.directories_searched,
                total_matches: stats.total_matches,
                processing_time_ms: cumulative_time,
            });
            last_update = Instant::now();
        }
    }

    // Send any remaining results
    if !batch_results.is_empty() {
        results.extend(batch_results);
    }

    Ok(SearchResponse {
        results,
        stats,
        cancelled: false,
        curtailed,
        processing_time_ms: start_time.elapsed().as_millis() as u64,
    })
}

// The approach we implemented combines several best practices from mature code search tools:
// Progressive Loading with batches of 50 results, making the UI feel snappy
// Smart Prioritization of source code directories and smaller files
// Resource Management with limits on files per directory and total results
// Efficient Updates with optimized progress reporting intervals
// Early Results showing matches as they're found rather than waiting
// The key was finding the right balance between:
// Speed (500ms early result intervals)
// Resource usage (max 1000 total results)
// User experience (prioritizing relevant directories)