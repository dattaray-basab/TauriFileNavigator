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