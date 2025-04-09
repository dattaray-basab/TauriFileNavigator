import React from "react";
import { useTheme } from "@/components/common";
import { useAtom } from "jotai";
import { searchState } from "../common/stateMgt/searchState";

export const SearchOptions: React.FC = () => {
  const { theme } = useTheme();
  const [searchRegex, setSearchRegex] = useAtom(searchState.regex);
  const [searchCaseSensitive, setSearchCaseSensitive] = useAtom(
    searchState.caseSensitive
  );
  const [searchWholeWord, setSearchWholeWord] = useAtom(searchState.wholeWord);

  // Handle checkbox changes with mutual exclusivity
  const handleRegexChange = (checked: boolean) => {
    setSearchRegex(checked);
    if (checked) {
      // When enabling regex, disable other options
      setSearchCaseSensitive(false);
      setSearchWholeWord(false);
    }
  };

  const handleCaseSensitiveChange = (checked: boolean) => {
    setSearchCaseSensitive(checked);
    if (checked || searchWholeWord) {
      // When enabling case-sensitive or whole-word, disable regex
      setSearchRegex(false);
    }
  };

  const handleWholeWordChange = (checked: boolean) => {
    setSearchWholeWord(checked);
    if (checked || searchCaseSensitive) {
      // When enabling whole-word or case-sensitive, disable regex
      setSearchRegex(false);
    }
  };

  return (
    <div className='flex items-center space-x-4 px-2 py-1'>
      {/* Regex */}
      <label
        className={`flex items-center space-x-2 transition-all duration-150 
      ${
        searchCaseSensitive || searchWholeWord
          ? "text-gray-400 opacity-60 cursor-not-allowed"
          : "cursor-pointer hover:font-semibold hover:text-blue-600"
      }`}>
        <input
          type='checkbox'
          checked={searchRegex}
          onChange={(e) => handleRegexChange(e.target.checked)}
          disabled={searchCaseSensitive || searchWholeWord}
          className='accent-blue-500'
        />
        <span
          className={`text-xs transition-colors duration-150 ${theme.fg.med}`}>
          Regex
        </span>
      </label>

      {/* Case Sensitive */}
      <label
        className={`flex items-center space-x-2 transition-all duration-150 
      ${
        searchRegex
          ? "text-gray-400 opacity-60 cursor-not-allowed"
          : "cursor-pointer hover:font-semibold hover:text-blue-600"
      }`}>
        <input
          type='checkbox'
          checked={searchCaseSensitive}
          onChange={(e) => handleCaseSensitiveChange(e.target.checked)}
          disabled={searchRegex}
          className='accent-blue-500'
        />
        <span
          className={`text-xs transition-colors duration-150 ${theme.fg.med}`}>
          Case Sensitive
        </span>
      </label>

      {/* Whole Word */}
      <label
        className={`flex items-center space-x-2 transition-all duration-150 
      ${
        searchRegex
          ? "text-gray-400 opacity-60 cursor-not-allowed"
          : "cursor-pointer hover:font-semibold hover:text-blue-600"
      }`}>
        <input
          type='checkbox'
          checked={searchWholeWord}
          onChange={(e) => handleWholeWordChange(e.target.checked)}
          disabled={searchRegex}
          className='accent-blue-500'
        />
        <span
          className={`text-xs transition-colors duration-150 ${theme.fg.med}`}>
          Whole Word
        </span>
      </label>
    </div>
  );
};
