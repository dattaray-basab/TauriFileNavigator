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

use std::path::Path;

#[cfg(not(target_os = "windows"))]
mod unix;
#[cfg(target_os = "windows")]
mod windows;

#[cfg(not(target_os = "windows"))]
pub use unix::{get_system_drive, get_user_home};
#[cfg(target_os = "windows")]
pub use windows::{get_system_drive, get_user_home};

/// Platform-independent way to check if a path is hidden
#[cfg(not(target_os = "windows"))]
#[allow(dead_code)]
pub fn is_hidden(path: &Path) -> bool {
    path.file_name()
        .and_then(|name| name.to_str())
        .map(|name| name.starts_with('.'))
        .unwrap_or(false)
}

/// Normalize a path to the current platform's format
#[cfg(not(target_os = "windows"))]
#[allow(dead_code)]
pub fn normalize_path(path: &str) -> String {
    #[cfg(target_os = "windows")]
    {
        path.replace('/', "\\")
    }
    #[cfg(not(target_os = "windows"))]
    {
        path.replace('\\', "/")
    }
}

/// Get available drives on the system
#[allow(dead_code)]
pub fn get_available_drives() -> Vec<String> {
    #[cfg(target_os = "windows")]
    {
        use std::fs;
        let mut drives = Vec::new();

        // Check drives A: through Z:
        for letter in b'A'..=b'Z' {
            let drive = format!("{}:", letter as char);
            if let Ok(metadata) = fs::metadata(&drive) {
                if metadata.is_dir() {
                    drives.push(drive);
                }
            }
        }

        drives
    }

    #[cfg(not(target_os = "windows"))]
    {
        // On Unix systems, we only have the root filesystem
        vec![String::from("/")]
    }
}

/// Type alias for platform-specific results.
/// This type is used throughout the platform module to provide consistent error handling.
#[allow(dead_code)]
pub type PathResult<T> = Result<T, String>;
