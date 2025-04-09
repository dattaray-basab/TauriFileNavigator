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

use regex::Regex;

pub fn build_regex(
    query: &str,
    is_regex: bool,
    is_case_sensitive: bool,
    is_whole_word: bool,
) -> Result<Regex, String> {
    let regex_pattern = if is_regex {
        query.to_string()
    } else {
        regex::escape(query)
    };

    let regex_pattern = if is_whole_word {
        format!(r"\b{}\b", regex_pattern)
    } else {
        regex_pattern
    };

    let regex = if is_case_sensitive {
        Regex::new(&regex_pattern)
    } else {
        Regex::new(&format!("(?i){}", regex_pattern))
    };

    regex.map_err(|e| format!("Invalid search pattern: {}", e))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_basic_search() {
        let regex = build_regex("test", false, true, false).unwrap();
        assert!(regex.is_match("test"));
        assert!(!regex.is_match("TEST"));
    }

    #[test]
    fn test_case_insensitive() {
        let regex = build_regex("test", false, false, false).unwrap();
        assert!(regex.is_match("test"));
        assert!(regex.is_match("TEST"));
    }

    #[test]
    fn test_whole_word() {
        let regex = build_regex("test", false, true, true).unwrap();
        assert!(regex.is_match("test"));
        assert!(regex.is_match("a test b"));
        assert!(!regex.is_match("testing"));
        assert!(!regex.is_match("atest"));
    }

    #[test]
    fn test_special_chars() {
        let regex = build_regex("test.ing", false, true, false).unwrap();
        assert!(regex.is_match("test.ing"));
        assert!(!regex.is_match("testing"));
    }
}
