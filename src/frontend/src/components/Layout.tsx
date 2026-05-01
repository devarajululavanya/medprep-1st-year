import { MobileSidebar, Sidebar } from "@/components/Sidebar";

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export function Layout({ children, title, subtitle, actions }: LayoutProps) {
  return (
    <div className="min-h-screen bg-background flex">
      {/* Desktop sidebar */}
      <Sidebar />

      {/* Main content area */}
      <div className="flex-1 flex flex-col lg:ml-64 min-h-screen">
        {/* Top header */}
        <header className="sticky top-0 z-20 bg-card border-b border-border shadow-subtle h-16 flex items-center px-4 lg:px-6 gap-4">
          <MobileSidebar />
          <div className="flex-1 min-w-0">
            {title && (
              <div className="flex items-baseline gap-2 min-w-0">
                <h1 className="text-lg font-display font-semibold text-foreground truncate">
                  {title}
                </h1>
                {subtitle && (
                  <span className="text-sm text-muted-foreground hidden sm:block truncate">
                    {subtitle}
                  </span>
                )}
              </div>
            )}
          </div>
          {actions && (
            <div className="flex items-center gap-2 flex-shrink-0">
              {actions}
            </div>
          )}
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 lg:p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
