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
use crate::models::pathinfo::{NodeDetails, PathinfoKind};
use crate::platform;
use std::path::Path;
use std::{fs, io::ErrorKind, time::UNIX_EPOCH};

#[tauri::command]
pub fn get_tree_data(directory_path: String, recursive: bool) -> Vec<NodeDetails> {
    let mut pathinfo_list: Vec<NodeDetails> = Vec::new();
    let mut stack: Vec<String> = Vec::new();

    // Normalize the input path for platform consistency
    let normalized_path = platform::normalize_path(&directory_path);
    let path = Path::new(&normalized_path);

    // Early validation of the directory
    if !path.exists() {
        eprintln!("Directory does not exist: {}", normalized_path);
        return pathinfo_list;
    }

    if !path.is_dir() {
        eprintln!("Path is not a directory: {}", normalized_path);
        return pathinfo_list;
    }

    let _directory_path_is_hidden = platform::is_hidden(path);
    stack.push(normalized_path);

    while let Some(current_path) = stack.pop() {
        match fs::read_dir(&current_path) {
            Ok(files) => {
                for file in files {
                    if let Ok(entry) = file {
                        let path_buf = entry.path();
                        if let Ok(metadata) = entry.metadata() {
                            let name = entry.file_name().to_string_lossy().to_string();
                            // Ensure path is normalized for the current platform
                            let path = platform::normalize_path(&path_buf.to_string_lossy());
                            let kind = if metadata.is_dir() {
                                PathinfoKind::Directory
                            } else {
                                PathinfoKind::File
                            };
                            let hidden = platform::is_hidden(&path_buf);

                            // Get file metadata in a platform-independent way
                            let size = metadata.len();
                            let created = metadata
                                .created()
                                .unwrap_or(UNIX_EPOCH)
                                .duration_since(UNIX_EPOCH)
                                .unwrap_or_default()
                                .as_millis();
                            let modified = metadata
                                .modified()
                                .unwrap_or(UNIX_EPOCH)
                                .duration_since(UNIX_EPOCH)
                                .unwrap_or_default()
                                .as_millis();

                            pathinfo_list.push(NodeDetails {
                                name,
                                path: path.clone(),
                                kind: kind.clone(),
                                hidden,
                                size,
                                created,
                                modified,
                                children: Some(Vec::new()),
                            });

                            if recursive && kind == PathinfoKind::Directory {
                                stack.push(path);
                            }
                        }
                    }
                }
            }
            Err(err) => {
                if err.kind() == ErrorKind::PermissionDenied {
                    // Log permission errors but continue processing
                    eprintln!("Permission denied: {}", current_path);
                    continue;
                }
                eprintln!("Error reading directory {}: {}", current_path, err);
                continue;
            }
        }
    }

    pathinfo_list
}
