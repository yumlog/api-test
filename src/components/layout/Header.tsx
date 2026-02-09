interface HeaderProps {
  title: string;
}

export function Header({ title }: HeaderProps) {
  return (
    <header className="px-6 py-4 border-b">
      <h1 className="text-2xl font-bold">{title}</h1>
    </header>
  );
}
