use crate::search::regex::build_regex;

#[test]
fn test_case_sensitive_exact_match() {
    let regex = build_regex("Hello", false, true, false).unwrap();
    assert!(regex.is_match("Hello"));
    assert!(!regex.is_match("hello"));
    assert!(!regex.is_match("HELLO"));
}

#[test]
fn test_case_insensitive_match() {
    let regex = build_regex("Hello", false, false, false).unwrap();
    assert!(regex.is_match("Hello"));
    assert!(regex.is_match("hello"));
    assert!(regex.is_match("HELLO"));
}

#[test]
fn test_whole_word_match() {
    let regex = build_regex("hello", false, true, true).unwrap();
    assert!(regex.is_match("hello"));
    assert!(regex.is_match(" hello "));
    assert!(regex.is_match("hello!"));
    assert!(!regex.is_match("helloworld"));
    assert!(!regex.is_match("sayhello"));
}

#[test]
fn test_whole_word_case_insensitive() {
    let regex = build_regex("hello", false, false, true).unwrap();
    assert!(regex.is_match("Hello"));
    assert!(regex.is_match(" HELLO "));
    assert!(regex.is_match("hello!"));
    assert!(!regex.is_match("helloworld"));
    assert!(!regex.is_match("sayhello"));
}

#[test]
fn test_regex_pattern() {
    let regex = build_regex(r"\d{3}-\d{2}-\d{4}", true, true, false).unwrap();
    assert!(regex.is_match("123-45-6789"));
    assert!(!regex.is_match("12-45-6789"));
    assert!(!regex.is_match("123-4-6789"));
}

#[test]
fn test_special_characters() {
    let regex = build_regex("hello.world", false, true, false).unwrap();
    assert!(regex.is_match("hello.world"));
    assert!(!regex.is_match("helloworld"));
}

#[test]
fn test_empty_string() {
    let result = build_regex("", false, false, false);
    assert!(result.is_ok());
    let regex = result.unwrap();
    assert!(regex.is_match("any text"));
    assert!(regex.is_match(""));
}

#[test]
fn test_invalid_regex() {
    let result = build_regex("[", true, true, false);
    assert!(result.is_err());
}

#[test]
fn test_unicode_characters() {
    let regex = build_regex("café", false, true, false).unwrap();
    assert!(regex.is_match("café"));
    assert!(!regex.is_match("cafe"));
}

#[test]
fn test_multiple_words() {
    let result = build_regex("hello world", false, true, true);
    assert!(result.is_ok());
    let regex = result.unwrap();
    assert!(regex.is_match("hello world"));
    assert!(regex.is_match("hello world!"));
    assert!(regex.is_match("hello world! extra"));
    assert!(!regex.is_match("helloworld"));
    assert!(!regex.is_match("hello worldliness"));
}

#[test]
fn test_case_sensitivity_constraints() {
    // Test case sensitive search
    let case_sensitive = build_regex("Hello", false, true, false).unwrap();
    assert!(case_sensitive.is_match("Hello")); // Exact match
    assert!(!case_sensitive.is_match("hello")); // Different case
    assert!(!case_sensitive.is_match("HELLO")); // Different case
    assert!(!case_sensitive.is_match("hElLo")); // Mixed case

    // Test case insensitive search
    let case_insensitive = build_regex("Hello", false, false, false).unwrap();
    assert!(case_insensitive.is_match("Hello")); // Exact match
    assert!(case_insensitive.is_match("hello")); // Lowercase
    assert!(case_insensitive.is_match("HELLO")); // Uppercase
    assert!(case_insensitive.is_match("hElLo")); // Mixed case

    // Test case sensitivity with special characters
    let special_case_sensitive = build_regex("Hello.World", false, true, false).unwrap();
    assert!(special_case_sensitive.is_match("Hello.World")); // Exact match
    assert!(!special_case_sensitive.is_match("hello.world")); // Different case
    assert!(!special_case_sensitive.is_match("HELLO.WORLD")); // Different case

    // Test case sensitivity with numbers
    let number_case_sensitive = build_regex("Hello123", false, true, false).unwrap();
    assert!(number_case_sensitive.is_match("Hello123")); // Exact match
    assert!(!number_case_sensitive.is_match("hello123")); // Different case
    assert!(!number_case_sensitive.is_match("HELLO123")); // Different case
}

#[test]
fn test_whole_word_in_isolation() {
    // Test single word with word boundaries
    let single_word = build_regex("hello", false, false, true).unwrap();
    assert!(single_word.is_match("hello")); // Exact match
    assert!(single_word.is_match(" hello ")); // With spaces
    assert!(single_word.is_match("hello!")); // With punctuation
    assert!(single_word.is_match("hello.")); // With period
    assert!(single_word.is_match("hello,")); // With comma
    assert!(single_word.is_match("(hello)")); // With parentheses
    assert!(!single_word.is_match("helloworld")); // Part of another word
    assert!(!single_word.is_match("sayhello")); // Part of another word
    assert!(!single_word.is_match("hello123")); // Part of another word
    assert!(!single_word.is_match("hello_world")); // Part of another word

    // Test word with numbers
    let word_with_numbers = build_regex("hello123", false, false, true).unwrap();
    assert!(word_with_numbers.is_match("hello123")); // Exact match
    assert!(word_with_numbers.is_match(" hello123 ")); // With spaces
    assert!(word_with_numbers.is_match("hello123!")); // With punctuation
    assert!(!word_with_numbers.is_match("hello1234")); // Part of another word
    assert!(!word_with_numbers.is_match("hello123world")); // Part of another word

    // Test word with special characters
    let word_with_special = build_regex("hello-world", false, false, true).unwrap();
    assert!(word_with_special.is_match("hello-world")); // Exact match
    assert!(word_with_special.is_match(" hello-world ")); // With spaces
    assert!(word_with_special.is_match("hello-world!")); // With punctuation
    assert!(!word_with_special.is_match("hello-world123")); // Part of another word
    assert!(!word_with_special.is_match("hello-worldworld")); // Part of another word

    // Test word with apostrophe
    let word_with_apostrophe = build_regex("don't", false, false, true).unwrap();
    assert!(word_with_apostrophe.is_match("don't")); // Exact match
    assert!(word_with_apostrophe.is_match(" don't ")); // With spaces
    assert!(word_with_apostrophe.is_match("don't!")); // With punctuation
    assert!(!word_with_apostrophe.is_match("don't123")); // Part of another word
    assert!(!word_with_apostrophe.is_match("don'tworld")); // Part of another word
}

#[test]
fn test_combined_constraints() {
    // Case sensitive + whole word
    let case_and_word = build_regex("Hello", false, true, true).unwrap();
    assert!(case_and_word.is_match("Hello")); // Exact match
    assert!(case_and_word.is_match("Hello!")); // With punctuation
    assert!(case_and_word.is_match(" Hello ")); // With spaces
    assert!(!case_and_word.is_match("hello")); // Wrong case
    assert!(!case_and_word.is_match("HelloWorld")); // Part of word
    assert!(!case_and_word.is_match("WorldHello")); // Part of word

    // Case insensitive + whole word + special chars
    let case_insensitive_special = build_regex("Hello-World", false, false, true).unwrap();
    assert!(case_insensitive_special.is_match("Hello-World")); // Exact match
    assert!(case_insensitive_special.is_match("hello-world")); // Different case
    assert!(case_insensitive_special.is_match("HELLO-WORLD")); // All caps
    assert!(case_insensitive_special.is_match("Hello-World!")); // With punctuation
    assert!(!case_insensitive_special.is_match("Hello-WorldWide")); // Part of word
    assert!(!case_insensitive_special.is_match("MyHello-World")); // Part of word

    // Regex + case sensitive + whole word
    let regex_case_word = build_regex(r"H\w+o", true, true, true).unwrap();
    assert!(regex_case_word.is_match("Hello")); // Matches pattern
    assert!(regex_case_word.is_match("Hello")); // Matches pattern
    assert!(regex_case_word.is_match("Howdo")); // Matches pattern
    assert!(!regex_case_word.is_match("hello")); // Wrong case
    assert!(!regex_case_word.is_match("HelloWorld")); // Part of word
    assert!(!regex_case_word.is_match("hello123")); // Wrong case and part of word

    // Case sensitive + whole word + numbers
    let case_word_numbers = build_regex("Test123", false, true, true).unwrap();
    assert!(case_word_numbers.is_match("Test123")); // Exact match
    assert!(case_word_numbers.is_match("Test123!")); // With punctuation
    assert!(!case_word_numbers.is_match("test123")); // Wrong case
    assert!(!case_word_numbers.is_match("Test123More")); // Part of word
    assert!(!case_word_numbers.is_match("Test1234")); // Different number

    // Case insensitive + whole word + unicode
    let case_word_unicode = build_regex("Café", false, false, true).unwrap();
    assert!(case_word_unicode.is_match("Café")); // Exact match
    assert!(case_word_unicode.is_match("café")); // Different case
    assert!(case_word_unicode.is_match("CAFÉ")); // All caps
    assert!(case_word_unicode.is_match("Café!")); // With punctuation
    assert!(!case_word_unicode.is_match("CaféLatte")); // Part of word
    assert!(!case_word_unicode.is_match("MyCafé")); // Part of word

    // Regex + case insensitive + whole word
    let regex_nocase_word = build_regex(r"\d+[A-Z]test", true, false, true).unwrap();
    assert!(regex_nocase_word.is_match("123Atest")); // Matches pattern
    assert!(regex_nocase_word.is_match("42Btest")); // Matches pattern
    assert!(regex_nocase_word.is_match("999atest")); // Matches pattern (case insensitive)
    assert!(!regex_nocase_word.is_match("123Atests")); // Part of word
    assert!(!regex_nocase_word.is_match("My42Btest")); // Part of word
}
