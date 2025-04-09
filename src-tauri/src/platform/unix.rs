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

use std::env;
use std::path::Path;

/// Check if a file is hidden on Unix systems.
/// On Unix, hidden files start with a dot.
#[allow(dead_code)]
pub fn is_hidden(path: &str) -> bool {
    Path::new(path)
        .file_name()
        .and_then(|name| name.to_str())
        .map(|name| name.starts_with('.'))
        .unwrap_or(false)
}

/// Get the system drive on Unix systems.
/// On Unix, this is always "/".
#[allow(dead_code)]
pub fn get_system_drive() -> String {
    "/".to_string()
}

/// Get the user's home directory on Unix systems.
#[allow(dead_code)]
pub fn get_user_home() -> String {
    env::var("HOME").unwrap_or_else(|_| "/home/default".to_string())
}

/// Get common paths on Unix systems.
#[allow(dead_code)]
pub fn get_common_paths() -> Result<Vec<String>, String> {
    let mut paths = Vec::new();

    // System paths
    paths.push("/".to_string());

    // User paths
    if let Ok(home) = env::var("HOME") {
        paths.push(home.clone());
        paths.push(format!("{}/Desktop", home));
        paths.push(format!("{}/Documents", home));
        paths.push(format!("{}/Downloads", home));
        paths.push(format!("{}/Pictures", home));
        paths.push(format!("{}/Music", home));
        paths.push(format!("{}/Videos", home));
    }

    // Common Unix paths
    paths.push("/usr".to_string());
    paths.push("/usr/local".to_string());
    paths.push("/etc".to_string());
    paths.push("/var".to_string());
    paths.push("/opt".to_string());

    Ok(paths)
}

/// Get drive information on Unix systems.
#[allow(dead_code)]
pub fn get_drive_info() -> Result<(String, String, Vec<String>), String> {
    Ok(("/".to_string(), "/".to_string(), vec!["/".to_string()]))
}
