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

/// Creates a new file or folder at the specified path
///
/// Parameters:
/// - parent_path: The directory where the item should be created
/// - item_name: The name of the new file or folder
/// - is_file: True if the item is a file, false if it's a directory
///
/// Returns:
/// - Ok(()): If the item was created successfully
/// - Err(String): If the item already exists or there was an error creating it


use std::fs;
use std::path::Path;
use std::io::Write;
use crate::platforms;

pub async fn create_filesystem_item(
    parent_path: String,
    item_name: String,
    is_file: bool,
) -> Result<(), String> {
    let normalized_parent = platforms::normalize_path(&parent_path);
    let normalized_name = platforms::normalize_path(&item_name);
    let path = Path::new(&normalized_parent).join(&normalized_name);

    // Windows-specific path validation
    if path.to_string_lossy().contains("..\\") {
        return Err("Path traversal attempts are not allowed".into());
    }

    if path.exists() {
        return Err(format!(
            "A {} named '{}' already exists.",
            if is_file { "file" } else { "directory" },
            normalized_name
        ));
    }

    if is_file {
        let mut file = fs::File::create(&path)
            .map_err(|e| format!("Failed to create file: {}", e))?;
        
        // Windows-specific default content
        file.write_all(b"@REM Add your code here\r\n")
            .map_err(|e| format!("Failed to write initial content: {}", e))?;
    } else {
        fs::create_dir(&path)
            .map_err(|e| format!("Failed to create directory: {}", e))?;
    }

    Ok(())
}

pub async fn delete_file(file_path: String) -> Result<(), String> {
    let normalized_path = platforms::normalize_path(&file_path);
    let path = Path::new(&normalized_path);
    
    if !path.exists() {
        return Err(format!("File '{}' does not exist.", normalized_path));
    }
    
    if !path.is_file() {
        return Err(format!("'{}' is not a file.", normalized_path));
    }
    
    // Windows-specific file attribute check
    #[cfg(windows)]
    {
        use std::os::windows::fs::MetadataExt;
        let metadata = path.metadata()
            .map_err(|e| format!("Failed to read metadata: {}", e))?;
        
        if metadata.file_attributes() & 0x2 != 0 { // FILE_ATTRIBUTE_HIDDEN
            return Err("Cannot delete hidden files".into());
        }
    }
    
    fs::remove_file(path)
        .map_err(|e| format!("Failed to delete file '{}': {}", normalized_path, e))?;
    
    Ok(())
}

pub async fn delete_folder(folder_path: String) -> Result<(), String> {
    let normalized_path = platforms::normalize_path(&folder_path);
    let path = Path::new(&normalized_path);
    
    if !path.exists() {
        return Err(format!("Folder '{}' does not exist.", normalized_path));
    }
    
    if !path.is_dir() {
        return Err(format!("'{}' is not a folder.", normalized_path));
    }
    
    // Windows-specific directory check
    #[cfg(windows)]
    {
        use winapi::um::fileapi::GetDriveTypeA;
        use std::ffi::CString;
        
        if let Some(root) = path.components().next() {
            let root_path = root.as_os_str().to_str().unwrap();
            let c_path = CString::new(root_path).unwrap();
            let drive_type = unsafe { GetDriveTypeA(c_path.as_ptr()) };
            
            if drive_type == 0x1 { // DRIVE_NO_ROOT_DIR
                return Err("Invalid network path".into());
            }
        }
    }
    
    fs::remove_dir_all(path)
        .map_err(|e| format!("Failed to delete folder '{}': {}", normalized_path, e))?;
    
    Ok(())
}

pub async fn read_file_content(file_path: String) -> Result<String, String> {
    let normalized_path = platforms::normalize_path(&file_path);
    let path = Path::new(&normalized_path);
    
    if !path.exists() {
        return Err(format!("File '{}' does not exist.", normalized_path));
    }
    
    if !path.is_file() {
        return Err(format!("'{}' is not a file.", normalized_path));
    }
    
    // Windows-specific line ending handling
    let content = fs::read_to_string(path)
        .map_err(|e| format!("Failed to read file '{}': {}", normalized_path, e))?;
    
    Ok(content.replace("\r\n", "\n"))
}
