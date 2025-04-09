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
use std::io::Write;
use crate::platform;

/// Creates a new file or folder at the specified path
///
/// Parameters:
/// - parent_path: The directory where the item should be created
/// - item_name: The name of the new file or folder
/// - item_type: Either "File" or "Directory"
/// - is_empty: Option to indicate if the file should be empty
///
/// Returns:
/// - Ok(()): If the item was created successfully
/// - Err(String): If the item already exists or there was an error creating it
#[tauri::command]
pub async fn create_filesystem_item(
    parent_path: String,
    item_name: String,
    item_type: String,
    // is_empty: Option<bool>,
) -> Result<(), String> {
    // Normalize paths for the current platform
    let normalized_parent = platform::normalize_path(&parent_path);
    let normalized_name = platform::normalize_path(&item_name);
    let path = Path::new(&normalized_parent).join(&normalized_name);

    // Check if the item already exists
    if path.exists() {
        return Err(format!(
            "A {} named '{}' already exists.",
            item_type, normalized_name
        ));
    }

    match item_type.as_str() {
        "Directory" => {
            fs::create_dir(&path).map_err(|e| format!("Failed to create directory: {}", e))?;
        }
        "File" => {
            let mut file = fs::File::create(&path).map_err(|e| format!("Failed to create file: {}", e))?;
            // Only write default content if not creating an empty file
            // if !is_empty.unwrap_or(false) {
                file.write_all(b"// Add your code here\n")
                    .map_err(|e| format!("Failed to write initial content: {}", e))?;
            // }
            // non empty files may be needed later!
        }
        _ => return Err("Invalid item type".to_string()),
    }

    Ok(())
}

/// Deletes a file at the specified path
///
/// Parameters:
/// - file_path: The path to the file to delete
///
/// Returns:
/// - Ok(()): If the file was deleted successfully
/// - Err(String): If there was an error deleting the file
#[tauri::command]
pub async fn delete_file(file_path: String) -> Result<(), String> {
    // Normalize path for the current platform
    let normalized_path = platform::normalize_path(&file_path);
    let path = Path::new(&normalized_path);
    
    // Check if the path exists and is a file
    if !path.exists() {
        return Err(format!("File '{}' does not exist.", normalized_path));
    }
    
    if !path.is_file() {
        return Err(format!("'{}' is not a file.", normalized_path));
    }
    
    // Attempt to delete the file
    fs::remove_file(path).map_err(|e| {
        format!("Failed to delete file '{}': {}", normalized_path, e)
    })?;
    
    Ok(())
}

/// Deletes a folder and all its contents at the specified path
///
/// Parameters:
/// - folder_path: The path to the folder to delete
///
/// Returns:
/// - Ok(()): If the folder was deleted successfully
/// - Err(String): If there was an error deleting the folder
#[tauri::command]
pub async fn delete_folder(folder_path: String) -> Result<(), String> {
    // Normalize path for the current platform
    let normalized_path = platform::normalize_path(&folder_path);
    let path = Path::new(&normalized_path);
    
    // Check if the path exists and is a directory
    if !path.exists() {
        return Err(format!("Folder '{}' does not exist.", normalized_path));
    }
    
    if !path.is_dir() {
        return Err(format!("'{}' is not a folder.", normalized_path));
    }
    
    // Attempt to delete the folder and all its contents
    fs::remove_dir_all(path).map_err(|e| {
        format!("Failed to delete folder '{}': {}", normalized_path, e)
    })?;
    
    Ok(())
}

/// Reads the contents of a file, including hidden files
/// 
/// Parameters:
/// - file_path: The path to the file to read
///
/// Returns:
/// - Ok(String): The contents of the file
/// - Err(String): If there was an error reading the file
#[tauri::command]
pub async fn read_file_content(file_path: String) -> Result<String, String> {
    // Normalize path for the current platform
    let normalized_path = platform::normalize_path(&file_path);
    let path = Path::new(&normalized_path);
    
    // Check if the path exists and is a file
    if !path.exists() {
        return Err(format!("File '{}' does not exist.", normalized_path));
    }
    
    if !path.is_file() {
        return Err(format!("'{}' is not a file.", normalized_path));
    }
    
    // Attempt to read the file
    fs::read_to_string(path).map_err(|e| {
        format!("Failed to read file '{}': {}", normalized_path, e)
    })
}
