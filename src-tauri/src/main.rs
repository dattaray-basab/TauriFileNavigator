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
// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod models;
mod commands;
mod search;
// mod filesys;
mod notifications;
mod platforms;

use std::env;

#[tokio::main]
async fn main() {
    // Set default CKS_ROOT_DIR if not set
    if env::var("CKS_ROOT_DIR").is_err() {
        if let Some(home) = dirs::home_dir() {
            env::set_var("CKS_ROOT_DIR", home.to_string_lossy().to_string());
        }
    }

    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            commands::tree::get_tree_data,
            search::search_ops::search_folder,
            search::search_ops::cancel_search,
            commands::filesystem_ops::create_filesystem_item,
            commands::filesystem_ops::delete_file,
            commands::filesystem_ops::delete_folder,
            commands::filesystem_ops::read_file_content,
            notifications::watch_ops::watch_filesys,
            platforms::get_default_paths,
            platforms::mix::get_os_type,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
