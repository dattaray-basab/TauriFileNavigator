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