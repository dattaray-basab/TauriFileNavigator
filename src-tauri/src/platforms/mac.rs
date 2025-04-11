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

#[cfg(not(target_os = "macos"))]
use crate::platforms;

use dirs;
use std::path::PathBuf;

pub async fn get_default_paths() -> Result<Vec<String>, String> {
    #[cfg(target_os = "macos")]
    {
        let mut paths = Vec::new();
        
        // Get current user's home directory
        let home = dirs::home_dir()
            .ok_or_else(|| "Could not determine home directory".to_string())?;
        
        // Add Home directory first (special case - always at top)
        paths.push(home.to_string_lossy().to_string());
        
        // Add common user directories
        let user_dirs = [
            ("Desktop", dirs::desktop_dir()),
            ("Documents", dirs::document_dir()),
            ("Downloads", dirs::download_dir()),
            ("Pictures", dirs::picture_dir()),
            ("Music", dirs::audio_dir()),
            ("Movies", dirs::video_dir())
        ];

        // Collect all valid paths
        for (_name, dir) in user_dirs {
            if let Some(path) = dir {
                if path.exists() {
                    paths.push(path.to_string_lossy().to_string());
                }
            }
        }

        // Add Applications directory (system and user)
        let applications = [
            (PathBuf::from("/Applications"), "Applications (System)"),
            (home.join("Applications"), "Applications (User)")
        ];

        for (app_dir, label) in applications {
            if app_dir.exists() {
                // Store the full path but with a custom display name
                paths.push(format!("{}|{}", app_dir.to_string_lossy(), label));
            }
        }

        if paths.len() > 1 {  // Only sort if we have more than just home
            // Sort paths by their directory names (excluding Home which is already first)
            let home_path = paths.remove(0); // Remove home temporarily
            paths.sort_by(|a, b| {
                let get_sort_key = |path: &str| {
                    if let Some((_, label)) = path.split_once('|') {
                        label.to_lowercase()
                    } else {
                        let path_buf = PathBuf::from(path);
                        path_buf.file_name()
                            .and_then(|n| n.to_str())
                            .unwrap_or("")
                            .to_lowercase()
                    }
                };
                
                get_sort_key(a).cmp(&get_sort_key(b))
            });
            paths.insert(0, home_path); // Put home back at the start
        }

        Ok(paths)
    }

    #[cfg(target_os = "windows")]
    {
        let mut paths = Vec::new();
        
        // Get all available local drives
        let drives = platforms::get_default_paths();
        
        // Add each drive with a label
        for drive in drives {
            // Skip network drives (starting with \\)
            if drive.starts_with("\\\\") {
                continue;
            }
            
            // Local drive - use the drive letter as the label
            let drive_letter = drive.chars().next().unwrap_or('?');
            let drive_name = format!("{}|Drive {}:", drive, drive_letter);
            
            paths.push(drive_name);
        }
        
        // Sort drives alphabetically
        paths.sort();
        
        Ok(paths)
    }

    #[cfg(not(any(target_os = "macos", target_os = "windows")))]
    {
        // For Linux and other platforms, use the platform-specific implementation
        Ok(platforms::get_default_paths())
    }
} 