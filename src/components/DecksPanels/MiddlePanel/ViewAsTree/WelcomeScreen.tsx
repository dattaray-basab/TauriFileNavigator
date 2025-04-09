import { useTheme } from "@/components/common";
import { Search, Folder, Star, FileText } from "lucide-react";

export function WelcomeScreen() {
  const { theme } = useTheme();

  return (
    <div
      className={`flex flex-col items-center justify-center h-full p-8 ${theme.bg.hi}`}>
      <h1 className={`text-2xl font-bold mb-8 ${theme.fg.hi}`}>
        Welcome to File Explorer
      </h1>

      <div className='max-w-2xl w-full space-y-6'>
        {/* Search Feature */}
        <div
          className={`p-6 rounded-lg ${theme.bg.lo} hover:${theme.bg.med} transition-colors`}>
          <div className='flex items-center mb-3'>
            <Search className={`w-6 h-6 mr-3 ${theme.fg.hi}`} />
            <h2 className={`text-lg font-semibold ${theme.fg.hi}`}>
              Quick Search
            </h2>
          </div>
          <p className={`${theme.fg.med}`}>
            Use the search panel on the left to quickly find files and their
            contents. The search is fast and supports regex patterns.
          </p>
        </div>

        {/* File Navigation */}
        <div
          className={`p-6 rounded-lg ${theme.bg.lo} hover:${theme.bg.med} transition-colors`}>
          <div className='flex items-center mb-3'>
            <Folder className={`w-6 h-6 mr-3 ${theme.fg.hi}`} />
            <h2 className={`text-lg font-semibold ${theme.fg.hi}`}>
              File Navigation
            </h2>
          </div>
          <p className={`${theme.fg.med}`}>
            Browse through your files and folders in the tree view. Click on any
            file to view its contents in the right panel.
          </p>
        </div>

        {/* Favorites */}
        <div
          className={`p-6 rounded-lg ${theme.bg.lo} hover:${theme.bg.med} transition-colors`}>
          <div className='flex items-center mb-3'>
            <Star className={`w-6 h-6 mr-3 ${theme.fg.hi}`} />
            <h2 className={`text-lg font-semibold ${theme.fg.hi}`}>
              Favorites
            </h2>
          </div>
          <p className={`${theme.fg.med}`}>
            Add frequently accessed files and folders to your favorites for
            quick access. Right-click items to add them to favorites.
          </p>
        </div>

        {/* File Preview */}
        <div
          className={`p-6 rounded-lg ${theme.bg.lo} hover:${theme.bg.med} transition-colors`}>
          <div className='flex items-center mb-3'>
            <FileText className={`w-6 h-6 mr-3 ${theme.fg.hi}`} />
            <h2 className={`text-lg font-semibold ${theme.fg.hi}`}>
              File Preview
            </h2>
          </div>
          <p className={`${theme.fg.med}`}>
            Preview file contents with syntax highlighting in the right panel.
            Search results will be highlighted for easy reference.
          </p>
        </div>
      </div>
    </div>
  );
}
