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

mod platform {
    #[cfg(target_os = "macos")]
    mod macos;
    #[cfg(target_os = "windows")]
    mod windows;
    #[cfg(target_os = "linux")]
    mod linux;

    #[cfg(target_os = "macos")]
    pub use macos::{get_available_drives as get_macos_drives, get_common_paths as get_macos_paths};
    #[cfg(target_os = "windows")]
    pub use windows::{get_available_drives as get_windows_drives, get_common_paths as get_windows_paths};
    #[cfg(target_os = "linux")]
    pub use linux::{get_available_drives as get_linux_drives, get_common_paths as get_linux_paths};
}

use platform::*;

/// Get a list of available drives on the system.
/// On macOS, this returns a list of mounted volumes and common directories.
/// On Windows, this returns a list of available drive letters.
/// On Linux, this returns a list of mounted filesystems.
#[tauri::command]
pub async fn get_available_drives() -> Result<Vec<String>, String> {
    #[cfg(target_os = "macos")]
    {
        get_macos_drives().await
    }
    #[cfg(target_os = "windows")]
    {
        get_windows_drives().await
    }
    #[cfg(target_os = "linux")]
    {
        get_linux_drives().await
    }
}

/// Get a list of common system paths.
/// This includes user directories (Desktop, Documents, etc.) and system directories.
/// The paths returned are specific to each operating system.
#[tauri::command]
#[allow(dead_code)]
pub async fn get_common_paths() -> Result<Vec<String>, String> {
    #[cfg(target_os = "macos")]
    {
        get_macos_paths().await
    }
    #[cfg(target_os = "windows")]
    {
        get_windows_paths().await
    }
    #[cfg(target_os = "linux")]
    {
        get_linux_paths().await
    }
} 