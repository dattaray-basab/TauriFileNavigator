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

#[cfg(target_os = "macos")]
mod macos;
#[cfg(not(target_os = "macos"))]
mod non_macos;

#[cfg(target_os = "macos")]
use macos::{get_available_drives as get_macos_drives, get_common_paths as get_macos_paths};
#[cfg(not(target_os = "macos"))]
use non_macos::{get_available_drives as get_non_macos_drives, get_common_paths as get_non_macos_paths};

#[tauri::command]
pub async fn get_available_drives() -> Result<Vec<String>, String> {
    #[cfg(target_os = "macos")]
    {
        get_macos_drives().await
    }
    #[cfg(not(target_os = "macos"))]
    {
        get_non_macos_drives().await
    }
}

/// This command is kept for future use in the frontend.
/// It provides a platform-independent way to get common system paths.
#[tauri::command]
#[allow(dead_code)]
pub async fn get_common_paths() -> Result<Vec<String>, String> {
    #[cfg(target_os = "macos")]
    {
        get_macos_paths().await
    }
    #[cfg(not(target_os = "macos"))]
    {
        get_non_macos_paths().await
    }
} 