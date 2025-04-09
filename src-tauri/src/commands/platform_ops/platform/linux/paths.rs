use dirs;
use std::path::PathBuf;

/// Get common paths on Linux systems.
/// This includes user directories and system directories.
pub async fn get_common_paths() -> Result<Vec<String>, String> {
    let mut paths = Vec::new();
    
    // Get current user's home directory
    let home = dirs::home_dir()
        .ok_or_else(|| "Could not determine home directory".to_string())?;
    
    // Add Home directory first
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
    
    // Add common Linux system directories
    let system_dirs = [
        "/etc",
        "/usr",
        "/usr/local",
        "/var",
        "/opt",
        "/bin",
        "/sbin",
        "/lib",
        "/lib64",
        "/boot",
        "/dev",
        "/proc",
        "/sys",
        "/tmp",
        "/run",
        "/mnt",
        "/media"
    ];
    
    for dir in system_dirs.iter() {
        let path = PathBuf::from(dir);
        if path.exists() {
            paths.push(path.to_string_lossy().to_string());
        }
    }
    
    Ok(paths)
} 