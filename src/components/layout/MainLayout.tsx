import { type ReactNode } from "react";

interface MainLayoutProps {
  header: ReactNode;
  main: ReactNode;
  sidebar: ReactNode;
  children?: ReactNode;
}

export function MainLayout({ header, main, sidebar, children }: MainLayoutProps) {
  return (
    <div className="h-screen flex flex-col">
      {header}
      <div className="flex flex-1 overflow-hidden">
        <section className="flex-1 flex flex-col overflow-hidden">
          {main}
        </section>
        {sidebar}
      </div>
      {children}
    </div>
  );
}
