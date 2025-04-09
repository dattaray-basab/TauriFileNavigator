use dirs;

/// Get a list of available drives on Windows systems.
/// This returns a list of available drive letters.
pub async fn get_available_drives() -> Result<Vec<String>, String> {
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

/// Get common paths on Windows systems.
/// This includes user directories and system directories.
pub async fn get_common_paths() -> Result<Vec<String>, String> {
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
    
    // Add Windows system directories
    let system_dirs = [
        "C:\\Windows",
        "C:\\Windows\\System32",
        "C:\\Program Files",
        "C:\\Program Files (x86)",
        "C:\\Users",
        "C:\\Users\\Public",
    ];
    
    for dir in system_dirs.iter() {
        let path = std::path::Path::new(dir);
        if path.exists() {
            paths.push(dir.to_string());
        }
    }
    
    Ok(paths)
} 