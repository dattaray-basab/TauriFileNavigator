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


#[cfg(target_os = "macos")]
pub mod mac;

#[cfg(target_os = "windows")]
pub mod windows;

pub mod mix;

#[cfg(target_os = "macos")]
pub use mac::{
    create_filesystem_item as mac_create_item,
    delete_file as mac_delete_file,
    delete_folder as mac_delete_folder,
};

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

#[tauri::command]
pub async fn get_default_paths() -> Result<Vec<String>, String> {
    #[cfg(target_os = "macos")]
    {
        mac::get_default_paths().await
    }

    #[cfg(target_os = "windows")]
    {
        windows::get_default_paths().await
    }

    #[cfg(not(any(target_os = "macos", target_os = "windows")))]
    {
        Ok(Vec::new())
    }
}

#[tauri::command]
pub async fn create_filesystem_item(parent_path: String, item_name: String, item_type: String) -> Result<(), String> {
    #[cfg(target_os = "macos")]
    {
        let is_file = item_type == "File";
        mac_create_item(parent_path, item_name, is_file).await
    }

    #[cfg(not(target_os = "macos"))]
    {
        Err("Operation not supported on this platform".to_string())
    }
}

#[tauri::command]
pub async fn delete_file(file_path: String) -> Result<(), String> {
    #[cfg(target_os = "macos")]
    {
        mac_delete_file(file_path).await
    }

    #[cfg(not(target_os = "macos"))]
    {
        Err("Operation not supported on this platform".to_string())
    }
}

#[tauri::command]
pub async fn delete_folder(folder_path: String) -> Result<(), String> {
    #[cfg(target_os = "macos")]
    {
        mac_delete_folder(folder_path).await
    }

    #[cfg(not(target_os = "macos"))]
    {
        Err("Operation not supported on this platform".to_string())
    }
}
