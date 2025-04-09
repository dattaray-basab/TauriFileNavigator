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

use crate::platforms;
use crate::search::types::{SearchFileResult, SearchMatch};
use regex::Regex;
use std::fs;
use std::path::Path;

const MAX_FILE_SIZE: u64 = 10 * 1024 * 1024; // 10MB

pub fn should_search_directory(_path: &Path) -> bool {
    true // No directory restrictions as per requirements
}

pub fn search_file(path: &Path, regex: &Regex) -> Option<SearchFileResult> {
    if let Ok(content) = fs::read_to_string(path) {
        let mut file_matches = Vec::new();

        for (line_num, line) in content.lines().enumerate() {
            let mut line_matches = Vec::new();

            // Use find_iter to get all matches
            for capture in regex.find_iter(line) {
                line_matches.push([capture.start(), capture.end()]);
            }

            if !line_matches.is_empty() {
                file_matches.push(SearchMatch {
                    line: line_num + 1,
                    content: line.to_string(),
                    match_ranges: line_matches,
                });
            }
        }

        if !file_matches.is_empty() {
            // Normalize the path for the current platform
            let normalized_path = platforms::normalize_path(&path.to_string_lossy());
            return Some(SearchFileResult {
                path: normalized_path,
                matches: file_matches,
            });
        }
    }
    None
}

pub fn should_skip_file(path: &Path) -> bool {
    is_binary_file(path) || is_too_large(path)
}

pub fn is_binary_file(path: &Path) -> bool {
    if let Ok(content) = fs::read(path) {
        content.iter().any(|&b| b == 0)
    } else {
        false
    }
}

pub fn is_too_large(path: &Path) -> bool {
    if let Ok(metadata) = fs::metadata(path) {
        metadata.len() > MAX_FILE_SIZE
    } else {
        false
    }
}

pub fn should_prioritize_directory(path: &Path) -> bool {
    // Prioritize directories that are likely to contain source code
    let priority_dirs = ["src", "lib", "app", "components", "pages"];
    path.file_name()
        .and_then(|name| name.to_str())
        .map(|name| priority_dirs.contains(&name))
        .unwrap_or(false)
}
