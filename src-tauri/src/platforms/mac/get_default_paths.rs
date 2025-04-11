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

use std::fs;
use dirs;

#[cfg(target_os = "macos")]
pub async fn get_default_paths() -> Result<Vec<String>, String> {
    let mut paths = Vec::new();
    
    // Get user's home directory
    if let Some(home) = dirs::home_dir() {
        paths.push(home.to_string_lossy().into_owned());
        
        // Add common user directories
        let user_dirs = [
            "Documents",
            "Downloads",
            "Desktop",
            "Pictures",
            "Music",
            "Movies",
            "Applications"
        ];
        
        for dir in user_dirs.iter() {
            let path = home.join(dir);
            if path.exists() {
                paths.push(path.to_string_lossy().into_owned());
            }
        }
    }
    
    // Add system volumes
    if let Ok(volumes) = fs::read_dir("/Volumes") {
        for volume in volumes.filter_map(Result::ok) {
            let path = volume.path();
            if path.is_dir() {
                paths.push(path.to_string_lossy().into_owned());
            }
        }
    }
    
    // Sort paths and ensure home directory is first
    paths.sort();
    if let Some(home) = dirs::home_dir() {
        let home_str = home.to_string_lossy().into_owned();
        if let Some(pos) = paths.iter().position(|x| x == &home_str) {
            if pos != 0 {
                paths.remove(pos);
                paths.insert(0, home_str);
            }
        }
    }
    
    Ok(paths)
} 