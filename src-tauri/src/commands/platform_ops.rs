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

#[cfg(not(target_os = "macos"))]
use crate::platform;

use dirs;
use std::path::PathBuf;

#[tauri::command]
pub async fn get_available_drives() -> Result<Vec<String>, String> {
    #[cfg(target_os = "macos")]
    {
        let mut paths = Vec::new();
        
        // Get current user's home directory
        let home = dirs::home_dir()
            .ok_or_else(|| "Could not determine home directory".to_string())?;
        
        // Add Home directory first (special case - always at top)
        paths.push(home.to_string_lossy().to_string());
        
        // Add common user directories
        let user_dirs = [
            ("Desktop", dirs::desktop_dir()),
            ("Documents", dirs::document_dir()),
            ("Downloads", dirs::download_dir()),
            ("Pictures", dirs::picture_dir()),
            ("Music", dirs::audio_dir()),
            ("Movies", dirs::video_dir())
        ];
        
        for (_, dir) in user_dirs.iter() {
            if let Some(dir) = dir {
                paths.push(dir.to_string_lossy().to_string());
            }
        }
        
        // Add system directories
        let system_dirs = [
            (PathBuf::from("/Applications"), "Applications (System)"),
            (PathBuf::from("/Library"), "Library (System)"),
            (PathBuf::from("/System"), "System"),
            (PathBuf::from("/Users"), "Users"),
            (PathBuf::from("/Volumes"), "Volumes"),
        ];
        
        for (path, _) in system_dirs.iter() {
            if path.exists() {
                paths.push(path.to_string_lossy().to_string());
            }
        }
        
        Ok(paths)
    }
    
    #[cfg(not(target_os = "macos"))]
    {
        let mut drives = Vec::new();
        
        // Check drives A: through Z:
        for letter in b'A'..=b'Z' {
            let drive = format!("{}:", letter as char);
            if let Ok(metadata) = std::fs::metadata(&drive) {
                if metadata.is_dir() {
                    drives.push(drive);
                }
            }
        }
        
        Ok(drives)
    }
}

#[tauri::command]
#[allow(dead_code)]
pub async fn get_common_paths() -> Result<Vec<String>, String> {
    #[cfg(target_os = "macos")]
    {
        let mut paths = Vec::new();
        
        // Get current user's home directory
        let home = dirs::home_dir()
            .ok_or_else(|| "Could not determine home directory".to_string())?;
        
        // Add Home directory first (special case - always at top)
        paths.push(home.to_string_lossy().to_string());
        
        // Add common user directories
        let user_dirs = [
            ("Desktop", dirs::desktop_dir()),
            ("Documents", dirs::document_dir()),
            ("Downloads", dirs::download_dir()),
            ("Pictures", dirs::picture_dir()),
            ("Music", dirs::audio_dir()),
            ("Movies", dirs::video_dir())
        ];
        
        for (_, dir) in user_dirs.iter() {
            if let Some(dir) = dir {
                let path_buf = PathBuf::from(dir);
                if path_buf.exists() {
                    paths.push(path_buf.to_string_lossy().to_string());
                }
            }
        }
        
        Ok(paths)
    }
    
    #[cfg(not(target_os = "macos"))]
    {
        let mut paths = Vec::new();
        
        // Get current user's home directory
        if let Some(home) = dirs::home_dir() {
            paths.push(home.to_string_lossy().to_string());
        }
        
        // Add common user directories
        let user_dirs = [
            ("Desktop", dirs::desktop_dir()),
            ("Documents", dirs::document_dir()),
            ("Downloads", dirs::download_dir()),
            ("Pictures", dirs::picture_dir()),
            ("Music", dirs::audio_dir()),
            ("Movies", dirs::video_dir())
        ];
        
        for (_, dir) in user_dirs.iter() {
            if let Some(dir) = dir {
                paths.push(dir.to_string_lossy().to_string());
            }
        }
        
        Ok(paths)
    }
} 