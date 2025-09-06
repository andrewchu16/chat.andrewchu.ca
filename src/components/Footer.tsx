export function Footer() {
  return (
    <div className="px-4 py-1.5 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900">
      <div className="flex items-center justify-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
        <a
          href="https://x.com/andrewxchu"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-gray-700 dark:hover:text-gray-300 transition-colors duration-200"
        >
          X
        </a>
        <span className="text-gray-300 dark:text-gray-600">•</span>
        <a
          href="https://github.com/andrewchu16/chat.andrewchu.ca"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-gray-700 dark:hover:text-gray-300 transition-colors duration-200"
        >
          GitHub
        </a>
        <span className="text-gray-300 dark:text-gray-600">•</span>
        <a
          href="https://andrewchu.ca"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-gray-700 dark:hover:text-gray-300 transition-colors duration-200"
        >
          more andrew
        </a>
      </div>
    </div>
  );
}
