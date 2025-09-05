interface HeaderProps {
  title: string;
}

export function Header({ title }: HeaderProps) {
  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
      <h1 className="text-xl font-semibold text-gray-800 dark:text-white">
        {title}
      </h1>
    </header>
  );
}
