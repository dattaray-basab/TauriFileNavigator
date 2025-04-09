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

use std::fs;
use std::path::Path;
use crate::platform;

/// Creates a new file at the specified path
#[tauri::command]
pub async fn create_file(file_path: String) -> Result<(), String> {
    // Normalize path for the current platform
    let normalized_path = platform::normalize_path(&file_path);
    let path = Path::new(&normalized_path);
    
    // Check if the file already exists
    if path.exists() {
        return Err(format!("File already exists: {}", normalized_path));
    }
    
    // Create the file
    match fs::File::create(path) {
        Ok(_) => Ok(()),
        Err(e) => Err(format!("Failed to create file: {}", e)),
    }
}

/// Creates a new directory at the specified path
#[tauri::command]
pub async fn create_directory(dir_path: String) -> Result<(), String> {
    // Normalize path for the current platform
    let normalized_path = platform::normalize_path(&dir_path);
    let path = Path::new(&normalized_path);
    
    // Check if the directory already exists
    if path.exists() {
        return Err(format!("Directory already exists: {}", normalized_path));
    }
    
    // Create the directory
    match fs::create_dir_all(path) {
        Ok(_) => Ok(()),
        Err(e) => Err(format!("Failed to create directory: {}", e)),
    }
}

/// Deletes a file or directory at the specified path
#[tauri::command]
pub async fn delete_path(path: String) -> Result<(), String> {
    // Normalize path for the current platform
    let normalized_path = platform::normalize_path(&path);
    let path = Path::new(&normalized_path);
    
    // Check if the path exists
    if !path.exists() {
        return Err(format!("Path does not exist: {}", normalized_path));
    }
    
    // Delete the path
    if path.is_dir() {
        match fs::remove_dir_all(path) {
            Ok(_) => Ok(()),
            Err(e) => Err(format!("Failed to delete directory: {}", e)),
        }
    } else {
        match fs::remove_file(path) {
            Ok(_) => Ok(()),
            Err(e) => Err(format!("Failed to delete file: {}", e)),
        }
    }
}

/// Renames a file or directory
#[tauri::command]
pub async fn rename_path(old_path: String, new_path: String) -> Result<(), String> {
    // Normalize paths for the current platform
    let normalized_old_path = platform::normalize_path(&old_path);
    let normalized_new_path = platform::normalize_path(&new_path);
    
    let old_path = Path::new(&normalized_old_path);
    let new_path = Path::new(&normalized_new_path);
    
    // Check if the old path exists
    if !old_path.exists() {
        return Err(format!("Path does not exist: {}", normalized_old_path));
    }
    
    // Check if the new path already exists
    if new_path.exists() {
        return Err(format!("Path already exists: {}", normalized_new_path));
    }
    
    // Rename the path
    match fs::rename(old_path, new_path) {
        Ok(_) => Ok(()),
        Err(e) => Err(format!("Failed to rename path: {}", e)),
    }
} 