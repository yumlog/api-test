import { type ReactNode } from "react";

interface SidebarProps {
  children: ReactNode;
}

export function Sidebar({ children }: SidebarProps) {
  return (
    <aside className="w-96 border-l bg-muted/30 p-6">{children}</aside>
  );
}
