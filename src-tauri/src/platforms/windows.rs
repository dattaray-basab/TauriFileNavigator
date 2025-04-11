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

use std::path::PathBuf;
use windows::Win32::Storage::FileSystem::GetLogicalDriveStringsW;
use windows::core::PCWSTR;

pub async fn get_default_paths() -> Result<Vec<String>, String> {
    let mut paths = Vec::new();
    
    // Get all available drives using Windows API
    let mut buffer = [0u16; 1024];
    let mut length = 0;
    unsafe {
        GetLogicalDriveStringsW(&mut buffer, &mut length);
    }
    
    // Convert the buffer to a string and split by null characters
    let drives = String::from_utf16_lossy(&buffer[..length as usize]);
    
    // Process each drive
    for drive in drives.split('\0').filter(|s| !s.is_empty()) {
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