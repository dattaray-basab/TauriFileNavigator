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

use crate::platform;
use serde::Serialize;

#[derive(Debug, Serialize)]
pub struct DriveInfo {
    pub system_drive: String,
    pub user_home: String,
    pub available_drives: Vec<String>,
}

#[tauri::command]
pub fn get_drive_info() -> DriveInfo {
    DriveInfo {
        system_drive: platform::get_system_drive(),
        user_home: platform::get_user_home(),
        available_drives: Vec::new(), // We'll get this from the platform-specific implementation
    }
}

#[cfg(target_os = "windows")]
#[allow(dead_code)]
fn get_available_drives() -> Result<Vec<String>, String> {
    // On Windows, use GetLogicalDriveStrings to get available drives
    use std::ffi::OsString;
    use std::os::windows::ffi::OsStringExt;
    use winapi::um::fileapi::GetLogicalDriveStringsW;

    unsafe {
        // First get the required buffer size
        let buf_size = GetLogicalDriveStringsW(0, std::ptr::null_mut());
        if buf_size == 0 {
            return Err("Failed to get drive strings buffer size".to_string());
        }

        // Allocate buffer and get drive strings
        let mut buffer: Vec<u16> = vec![0; buf_size as usize];
        let len = GetLogicalDriveStringsW(buf_size, buffer.as_mut_ptr());
        if len == 0 {
            return Err("Failed to get drive strings".to_string());
        }

        // Convert buffer to string and split into drives
        buffer.truncate(len as usize);
        let os_string = OsString::from_wide(&buffer);
        let drives_str = os_string.to_string_lossy();

        // Split into individual drives (they're null-terminated in the buffer)
        Ok(drives_str
            .split('\0')
            .filter(|s| !s.is_empty())
            .map(|s| s.to_string())
            .collect())
    }
}
