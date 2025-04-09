use dirs;

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
    
    Ok(paths)
} 