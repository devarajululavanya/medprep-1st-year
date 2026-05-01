import { Badge } from "@/components/ui/badge";
import { useDueFlashcards } from "@/hooks/useBackend";
import { cn } from "@/lib/utils";
import { Link, useRouterState } from "@tanstack/react-router";
import {
  BookOpen,
  Brain,
  ChevronRight,
  FlaskConical,
  LayoutDashboard,
  Menu,
  Stethoscope,
  TrendingUp,
  X,
} from "lucide-react";
import { useState } from "react";

const NAV_ITEMS = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/" },
  { label: "Subjects", icon: BookOpen, href: "/subjects" },
  { label: "Flashcards", icon: Brain, href: "/flashcards", badge: true },
  { label: "ECE Cases", icon: Stethoscope, href: "/cases" },
  { label: "Progress", icon: TrendingUp, href: "/progress" },
];

const SUBJECT_QUICK = [
  { label: "Anatomy", subjectId: "1", icon: "🦴" },
  { label: "Physiology", subjectId: "2", icon: "🫁" },
  { label: "Biochemistry", subjectId: "3", icon: FlaskConical },
];

function NavLink({
  href,
  icon: Icon,
  label,
  badge,
  dueCount,
  onClick,
}: {
  href: string;
  icon: React.ElementType;
  label: string;
  badge?: boolean;
  dueCount?: number;
  onClick?: () => void;
}) {
  const state = useRouterState();
  const pathname = state.location.pathname;
  const isActive = href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <Link
      to={href}
      onClick={onClick}
      data-ocid={`nav.${label.toLowerCase().replace(/\s/g, "_")}.link`}
      className={cn(
        "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-smooth",
        isActive
          ? "bg-primary text-primary-foreground shadow-subtle"
          : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
      )}
    >
      <Icon className="w-4 h-4 flex-shrink-0" />
      <span className="flex-1 truncate">{label}</span>
      {badge && dueCount != null && dueCount > 0 && (
        <Badge
          className="bg-secondary text-secondary-foreground text-xs px-1.5 py-0"
          data-ocid="nav.flashcards.due_badge"
        >
          {dueCount}
        </Badge>
      )}
    </Link>
  );
}

interface SidebarContentProps {
  onClose?: () => void;
}

export function SidebarContent({ onClose }: SidebarContentProps) {
  const { data: dueFlashcards } = useDueFlashcards();
  const dueCount = dueFlashcards?.length ?? 0;
  const state = useRouterState();
  const pathname = state.location.pathname;

  return (
    <div className="flex flex-col h-full bg-sidebar">
      {/* Logo */}
      <div className="flex items-center justify-between px-4 h-16 border-b border-sidebar-border flex-shrink-0">
        <Link
          to="/"
          className="flex items-center gap-2.5"
          data-ocid="nav.logo.link"
        >
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-subtle">
            <span className="text-primary-foreground text-base">🩺</span>
          </div>
          <span className="font-display font-bold text-sidebar-foreground text-lg tracking-tight">
            MediLearn
          </span>
        </Link>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-md text-sidebar-foreground/60 hover:text-sidebar-foreground lg:hidden"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Main Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.href}
            href={item.href}
            icon={item.icon}
            label={item.label}
            badge={item.badge}
            dueCount={dueCount}
            onClick={onClose}
          />
        ))}

        {/* Quick Subject Links */}
        <div className="pt-4 pb-1">
          <p className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            Subjects
          </p>
          {SUBJECT_QUICK.map((s) => {
            const href = `/subjects/${s.subjectId}`;
            const isActive = pathname === href;
            return (
              <Link
                key={s.subjectId}
                to="/subjects/$subjectId"
                params={{ subjectId: s.subjectId }}
                onClick={onClose}
                data-ocid={`nav.${s.label.toLowerCase()}.link`}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-smooth",
                  isActive
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                )}
              >
                {typeof s.icon === "string" ? (
                  <span className="text-sm w-4 text-center">{s.icon}</span>
                ) : (
                  <s.icon className="w-4 h-4 flex-shrink-0" />
                )}
                <span>{s.label}</span>
                <ChevronRight className="w-3 h-3 ml-auto opacity-40" />
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-sidebar-border flex-shrink-0">
        <p className="text-xs text-muted-foreground text-center">
          © {new Date().getFullYear()}. Built with love using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            caffeine.ai
          </a>
        </p>
      </div>
    </div>
  );
}

export function Sidebar() {
  return (
    <aside className="hidden lg:flex flex-col w-64 h-screen fixed left-0 top-0 border-r border-sidebar-border z-30">
      <SidebarContent />
    </aside>
  );
}

export function MobileSidebar() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        data-ocid="nav.mobile_menu.toggle"
        className="lg:hidden p-2 rounded-lg text-foreground hover:bg-muted transition-smooth"
        aria-label="Open navigation menu"
      >
        <Menu className="w-5 h-5" />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-foreground/20 backdrop-blur-sm"
            onClick={() => setOpen(false)}
            onKeyDown={(e) => e.key === "Escape" && setOpen(false)}
            role="button"
            tabIndex={-1}
            aria-label="Close menu"
          />
          <div className="absolute left-0 top-0 h-full w-72 shadow-elevated">
            <SidebarContent onClose={() => setOpen(false)} />
          </div>
        </div>
      )}
    </>
  );
}
