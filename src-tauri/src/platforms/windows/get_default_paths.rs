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

use winapi::um::fileapi::GetLogicalDrives;
use winapi::um::winbase::GetDriveTypeW;
use std::os::windows::ffi::OsStringExt;
use std::path::PathBuf;

#[cfg(target_os = "windows")]
pub async fn get_default_paths() -> Result<Vec<String>, String> {
    let mut paths = Vec::new();
    
    // Get all available drives
    let drives = unsafe { GetLogicalDrives() };
    for i in 0..26 {
        if (drives & (1 << i)) != 0 {
            let drive_letter = (b'A' + i) as char;
            let drive_path = format!("{}:\\", drive_letter);
            let drive_path_wide: Vec<u16> = drive_path.encode_utf16().collect();
            
            // Check if it's a local drive (skip network drives)
            let drive_type = unsafe { GetDriveTypeW(drive_path_wide.as_ptr()) };
            if drive_type == winapi::um::winbase::DRIVE_FIXED {
                paths.push(drive_path);
            }
        }
    }
    
    // Sort drives alphabetically
    paths.sort();
    
    Ok(paths)
} 