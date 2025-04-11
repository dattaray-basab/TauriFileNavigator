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
use std::io::Write;
use std::path::Path;

/// Creates a new file or folder at the specified path
///
/// Parameters:
/// - parent_path: The directory where the item should be created
/// - item_name: The name of the new file or folder
/// - is_file: true for file, false for directory
///
/// Returns:
/// - Ok(()): If the item was created successfully
/// - Err(String): If the item already exists or there was an error creating it
pub async fn create_filesystem_item(
    parent_path: String,
    item_name: String,
    is_file: bool,
) -> Result<(), String> {
    let path = Path::new(&parent_path).join(&item_name);

    // Check if the item already exists
    if path.exists() {
        return Err(format!(
            "A {} named '{}' already exists.",
            if is_file { "file" } else { "directory" },
            item_name
        ));
    }

    if is_file {
        let mut file =
            fs::File::create(&path).map_err(|e| format!("Failed to create file: {}", e))?;
        file.write_all(b"// Add your code here\n")
            .map_err(|e| format!("Failed to write initial content: {}", e))?;
    } else {
        fs::create_dir(&path).map_err(|e| format!("Failed to create directory: {}", e))?;
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
pub async fn delete_file(file_path: String) -> Result<(), String> {
    let path = Path::new(&file_path);

    // Check if the path exists and is a file
    if !path.exists() {
        return Err(format!("File '{}' does not exist.", file_path));
    }

    if !path.is_file() {
        return Err(format!("'{}' is not a file.", file_path));
    }

    // Attempt to delete the file
    fs::remove_file(path).map_err(|e| format!("Failed to delete file '{}': {}", file_path, e))?;

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
pub async fn delete_folder(folder_path: String) -> Result<(), String> {
    let path = Path::new(&folder_path);

    // Check if the path exists and is a directory
    if !path.exists() {
        return Err(format!("Folder '{}' does not exist.", folder_path));
    }

    if !path.is_dir() {
        return Err(format!("'{}' is not a folder.", folder_path));
    }

    // Attempt to delete the folder and all its contents
    fs::remove_dir_all(path)
        .map_err(|e| format!("Failed to delete folder '{}': {}", folder_path, e))?;

    Ok(())
}
