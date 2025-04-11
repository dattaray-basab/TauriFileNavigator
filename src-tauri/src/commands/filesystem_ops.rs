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
use crate::platforms;

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
    let normalized_path = platforms::normalize_path(&file_path);
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
