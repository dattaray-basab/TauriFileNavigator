use dirs;
use std::path::PathBuf;

pub async fn get_available_drives() -> Result<Vec<String>, String> {
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

pub async fn get_common_paths() -> Result<Vec<String>, String> {
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