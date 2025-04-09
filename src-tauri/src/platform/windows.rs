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

use std::env;
use std::ffi::OsStr;
use std::os::windows::ffi::OsStrExt;
use std::path::Path;
use winapi::um::fileapi::GetFileAttributesW;
use winapi::um::winnt::FILE_ATTRIBUTE_HIDDEN;

#[allow(dead_code)]
pub fn is_hidden(path: &Path) -> bool {
    // Convert path to wide string for Windows API
    let wide: Vec<u16> = path.as_os_str().encode_wide().chain(Some(0)).collect();

    // Get file attributes using Windows API
    unsafe {
        let attributes = GetFileAttributesW(wide.as_ptr());
        if attributes == u32::MAX {
            return false; // Error getting attributes
        }
        attributes & FILE_ATTRIBUTE_HIDDEN != 0
    }
}

#[allow(dead_code)]
pub fn get_system_drive() -> String {
    env::var("SystemDrive").unwrap_or_else(|_| String::from("C:"))
}

#[allow(dead_code)]
pub fn get_user_home() -> Option<String> {
    env::var("USERPROFILE").ok()
}

#[allow(dead_code)]
pub fn normalize_path(path: &str) -> String {
    // Replace Unix-style separators with Windows ones
    path.replace('/', "\\")
}

pub fn get_common_paths() -> Vec<(String, String)> {
    let mut paths = Vec::new();

    // System Drive (usually C:)
    paths.push(("System Drive".to_string(), get_system_drive()));

    // User profile related paths
    if let Some(user_profile) = get_user_home() {
        paths.push(("Home".to_string(), user_profile.clone()));
        paths.push((
            "Documents".to_string(),
            format!("{}\\Documents", user_profile),
        ));
        paths.push(("Desktop".to_string(), format!("{}\\Desktop", user_profile)));
        paths.push((
            "Downloads".to_string(),
            format!("{}\\Downloads", user_profile),
        ));
        paths.push((
            "Pictures".to_string(),
            format!("{}\\Pictures", user_profile),
        ));
        paths.push(("Music".to_string(), format!("{}\\Music", user_profile)));
        paths.push(("Videos".to_string(), format!("{}\\Videos", user_profile)));
    }

    // Common system paths
    if let Ok(program_files) = env::var("ProgramFiles") {
        paths.push(("Program Files".to_string(), program_files));
    }
    if let Ok(program_files_x86) = env::var("ProgramFiles(x86)") {
        paths.push(("Program Files (x86)".to_string(), program_files_x86));
    }
    if let Ok(appdata) = env::var("APPDATA") {
        paths.push(("AppData".to_string(), appdata));
    }

    paths
}

#[tauri::command]
pub fn get_windows_common_paths() -> Vec<(String, String)> {
    get_common_paths()
}
