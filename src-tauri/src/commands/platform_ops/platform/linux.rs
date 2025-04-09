use dirs;
use std::path::PathBuf;

/// Get a list of available drives on Linux systems.
/// This returns a list of mounted filesystems from /proc/mounts.
pub async fn get_available_drives() -> Result<Vec<String>, String> {
    let mut drives = Vec::new();
    
    // Read /proc/mounts to get mounted filesystems
    if let Ok(content) = std::fs::read_to_string("/proc/mounts") {
        for line in content.lines() {
            if let Some(fields) = line.split_whitespace().nth(1) {
                // Only include filesystem mounts (skip special filesystems)
                if !fields.starts_with("/proc") && 
                   !fields.starts_with("/sys") && 
                   !fields.starts_with("/dev") {
                    drives.push(fields.to_string());
                }
            }
        }
    }
    
    // Add root filesystem if not already included
    if !drives.contains(&"/".to_string()) {
        drives.push("/".to_string());
    }
    
    Ok(drives)
}

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