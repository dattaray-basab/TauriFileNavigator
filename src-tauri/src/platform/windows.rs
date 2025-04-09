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
use std::path::Path;
use windows::core::PCWSTR;
use windows::Win32::Foundation::BOOL;
use windows::Win32::Storage::FileSystem::{GetFileAttributesW, FILE_ATTRIBUTE_HIDDEN};

pub fn is_hidden(path: &str) -> bool {
    unsafe {
        let wide_path: Vec<u16> = path.encode_utf16().chain(std::iter::once(0)).collect();
        let path_ptr = PCWSTR::from_raw(wide_path.as_ptr());
        let attributes = GetFileAttributesW(path_ptr);
        attributes & FILE_ATTRIBUTE_HIDDEN.0 != 0
    }
}

pub fn get_system_drive() -> String {
    env::var("SystemDrive").unwrap_or_else(|_| "C:".to_string())
}

pub fn get_user_home() -> String {
    env::var("USERPROFILE").unwrap_or_else(|_| {
        let drive = get_system_drive();
        format!("{}\\Users\\Default", drive)
    })
}

pub fn get_common_paths() -> Result<Vec<String>, String> {
    let mut paths = Vec::new();

    // System paths
    if let Ok(system_drive) = env::var("SystemDrive") {
        paths.push(format!("{}\\", system_drive));
    }

    // User paths
    if let Ok(user_profile) = env::var("USERPROFILE") {
        paths.push(user_profile.clone());
        paths.push(format!("{}\\Desktop", user_profile));
        paths.push(format!("{}\\Documents", user_profile));
        paths.push(format!("{}\\Downloads", user_profile));
        paths.push(format!("{}\\Pictures", user_profile));
        paths.push(format!("{}\\Music", user_profile));
        paths.push(format!("{}\\Videos", user_profile));
    }

    // Program Files
    if let Ok(program_files) = env::var("ProgramFiles") {
        paths.push(program_files);
    }
    if let Ok(program_files_x86) = env::var("ProgramFiles(x86)") {
        paths.push(program_files_x86);
    }

    // AppData paths
    if let Ok(app_data) = env::var("APPDATA") {
        paths.push(app_data);
    }
    if let Ok(local_app_data) = env::var("LOCALAPPDATA") {
        paths.push(local_app_data);
    }

    Ok(paths)
}

pub fn get_drive_info() -> Result<(String, String, Vec<String>), String> {
    let system_drive = get_system_drive();
    let user_drive = get_system_drive(); // Usually the same as system drive on Windows

    // Get all available drives
    let mut drives = Vec::new();
    for drive_letter in b'A'..=b'Z' {
        let drive = format!("{}:", drive_letter as char);
        let path = Path::new(&drive);
        if path.exists() {
            drives.push(drive);
        }
    }

    Ok((system_drive, user_drive, drives))
}
