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

/// Platform-independent way to check if a path is hidden
pub fn is_hidden(path: &Path) -> bool {
    path.file_name()
        .and_then(|name| name.to_str())
        .map(|name| name.starts_with('.'))
        .unwrap_or(false)
}

/// Normalize a path to the current platform's format
pub fn normalize_path(path: &str) -> String {
    #[cfg(target_os = "windows")]
    {
        // On Windows, we use backslashes
        path.replace('/', "\\")
    }

    #[cfg(target_os = "macos")]
    {
        // On macOS, we use forward slashes and remove /private prefix
        path.replace('\\', "/").replace("/private/", "/")
    }

    #[cfg(not(any(target_os = "windows", target_os = "macos")))]
    {
        // On other Unix systems, we use forward slashes
        path.replace('\\', "/")
    }
}


// pub fn get_system_drive() -> String {
//     #[cfg(target_os = "windows")]
//     {
//         // On Windows, try to get the system drive from environment
//         std::env::var("SystemDrive").unwrap_or_else(|_| "C:".to_string())
//     }

//     #[cfg(not(target_os = "windows"))]
//     {
//         // On Unix systems, the root is "/"
//         String::from("/")
//     }
// }


// pub fn get_user_home() -> Option<String> {
//     #[cfg(target_os = "windows")]
//     {
//         // On Windows, try USERPROFILE first, then HOMEDRIVE + HOMEPATH
//         if let Ok(profile) = std::env::var("USERPROFILE") {
//             return Some(profile);
//         }

//         // Fallback to HOMEDRIVE + HOMEPATH
//         let drive = std::env::var("HOMEDRIVE").ok()?;
//         let path = std::env::var("HOMEPATH").ok()?;
//         Some(format!("{}{}", drive, path))
//     }

//     #[cfg(not(target_os = "windows"))]
//     {
//         // On Unix systems, use HOME environment variable
//         std::env::var("HOME").ok()
//     }
// }


// pub fn get_available_drives() -> Vec<String> {
//     #[cfg(target_os = "windows")]
//     {
//         use std::fs;
//         let mut drives = Vec::new();

//         // Check drives A: through Z:
//         for letter in b'A'..=b'Z' {
//             let drive = format!("{}:", letter as char);
//             if let Ok(metadata) = fs::metadata(&drive) {
//                 if metadata.is_dir() {
//                     drives.push(drive);
//                 }
//             }
//         }

//         drives
//     }

//     #[cfg(not(target_os = "windows"))]
//     {
//         // On Unix systems, we only have the root filesystem
//         vec![String::from("/")]
//     }
// }
