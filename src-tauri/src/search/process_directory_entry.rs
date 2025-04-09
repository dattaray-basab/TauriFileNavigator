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

use crate::search::constants::MAX_FILES_PER_DIR;
use crate::search::file_ops::{search_file, should_prioritize_directory, should_skip_file};
use crate::search::types::{SearchFileResult, SearchStats};
use regex::Regex;
use std::path::PathBuf;

pub fn process_directory_entry(
    entry: &std::fs::DirEntry,
    regex: &Regex,
    dirs_to_search: &mut Vec<PathBuf>,
    dir_results: &mut Vec<SearchFileResult>,
    dir_files_searched: &mut usize,
    stats: &mut SearchStats,
) {
    let path = entry.path();

    if let Ok(ft) = entry.file_type() {
        if ft.is_dir() {
            if should_prioritize_directory(&path) {
                dirs_to_search.insert(0, path);
            } else {
                dirs_to_search.push(path);
            }
        } else if ft.is_file() && !should_skip_file(&path) {
            *dir_files_searched += 1;
            if *dir_files_searched > MAX_FILES_PER_DIR {
                return;
            }

            if let Some(result) = search_file(&path, regex) {
                stats.total_matches += result.matches.len();
                dir_results.push(result);
            }
        }
    }
}
