interface HeaderProps {
  title: string;
  chatId?: number | null;
}

export function Header({ title, chatId }: HeaderProps) {
  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-800 dark:text-white">
          {title}
        </h1>
        {chatId && (
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Chat #{chatId}
          </span>
        )}
      </div>
    </header>
  );
}
