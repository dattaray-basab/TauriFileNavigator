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

use winapi::um::fileapi::GetLogicalDriveStringsW;
use std::ptr;
use std::ffi::OsString;
use std::os::windows::ffi::OsStringExt;

#[cfg(target_os = "windows")]
pub async fn get_default_paths() -> Result<Vec<String>, String> {
    unsafe {
        // First call to get the buffer size needed
        let buffer_len = GetLogicalDriveStringsW(0, ptr::null_mut());
        if buffer_len == 0 {
            return Err("Failed to get buffer length for drive strings.".into());
        }

        // Allocate buffer with the needed size
        let mut buffer: Vec<u16> = vec![0; buffer_len as usize];

        let result = GetLogicalDriveStringsW(buffer_len, buffer.as_mut_ptr());
        if result == 0 {
            return Err("Failed to get drive strings.".into());
        }

        // Split the null-separated drive strings
        let mut drives = Vec::new();
        let mut start = 0;
        for i in 0..buffer.len() {
            if buffer[i] == 0 {
                if start == i {
                    break;
                }
                let os_str = OsString::from_wide(&buffer[start..i]);
                if let Ok(drive) = os_str.into_string() {
                    drives.push(drive);
                }
                start = i + 1;
            }
        }

        Ok(drives)
    }
}
