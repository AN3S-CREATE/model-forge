import { lazy, Suspense, useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useTheme } from '@/hooks/use-theme';
import {
  LayoutDashboard,
  Upload,
  Cpu,
  Database,
  Settings,
  Menu,
  X,
  Sun,
  Moon,
} from 'lucide-react';
import { BRAND, LOGOS } from '@/config/branding';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/upload', icon: Upload, label: 'Data Upload' },
  { to: '/training', icon: Cpu, label: 'Training' },
  { to: '/models', icon: Database, label: 'Models' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

function NavLinks({ onClick }: { onClick?: () => void }) {
  const location = useLocation();

  return (
    <>
      {navItems.map((item) => {
        const isActive = item.end
          ? location.pathname === item.to
          : location.pathname.startsWith(item.to);

        return (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            onClick={onClick}
            className={cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-150',
              isActive
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted',
            )}
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </NavLink>
        );
      })}
    </>
  );
}

export function Layout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar - desktop */}
      <aside className="hidden md:flex md:flex-col md:w-56 lg:w-60 border-r border-border bg-card shrink-0">
        <div className="flex items-center gap-2.5 px-4 h-14 border-b border-border">
          <div className="h-7 w-7 rounded-md bg-background flex items-center justify-center shrink-0 overflow-hidden">
            <img src={LOGOS.icon} alt={BRAND.name} className="h-6 w-6 object-contain dark:hidden" />
            <img src={LOGOS.forDark} alt={BRAND.name} className="h-6 w-6 object-contain hidden dark:block" />
          </div>
          <span className="font-semibold text-sm tracking-tight">{BRAND.name}</span>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <NavLinks />
        </nav>
        <div className="px-3 py-3 border-t border-border">
          <button
            onClick={() => setTheme(isDark ? 'light' : 'dark')}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors duration-150"
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            {isDark ? 'Light Mode' : 'Dark Mode'}
          </button>
        </div>
      </aside>

      {/* Mobile header */}
      <div className="md:hidden fixed top-0 inset-x-0 z-30 h-14 border-b border-border bg-card/80 backdrop-blur-sm flex items-center justify-between px-4">
        <div className="flex items-center gap-2.5">
          <div className="h-7 w-7 rounded-md bg-background flex items-center justify-center overflow-hidden">
            <img src={LOGOS.icon} alt={BRAND.name} className="h-6 w-6 object-contain dark:hidden" />
            <img src={LOGOS.forDark} alt={BRAND.name} className="h-6 w-6 object-contain hidden dark:block" />
          </div>
          <span className="font-semibold text-sm tracking-tight">{BRAND.name}</span>
        </div>
        <button
          onClick={() => setMobileOpen(true)}
          className="min-h-11 min-w-11 flex items-center justify-center rounded-lg hover:bg-muted"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-40">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute top-0 left-0 bottom-0 w-64 bg-card border-r border-border flex flex-col">
            <div className="flex items-center justify-between px-4 h-14 border-b border-border">
              <div className="flex items-center gap-2.5">
                <div className="h-6 w-6 rounded bg-background flex items-center justify-center overflow-hidden">
                  <img src={LOGOS.icon} alt={BRAND.name} className="h-5 w-5 object-contain dark:hidden" />
                  <img src={LOGOS.forDark} alt={BRAND.name} className="h-5 w-5 object-contain hidden dark:block" />
                </div>
                <span className="font-semibold text-sm">{BRAND.name}</span>
              </div>
              <button
                onClick={() => setMobileOpen(false)}
                className="min-h-11 min-w-11 flex items-center justify-center rounded-lg hover:bg-muted"
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
              <NavLinks onClick={() => setMobileOpen(false)} />
            </nav>
            <div className="px-3 py-3 border-t border-border">
              <button
                onClick={() => {
                  setTheme(isDark ? 'light' : 'dark');
                  setMobileOpen(false);
                }}
                className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors duration-150"
              >
                {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                {isDark ? 'Light Mode' : 'Dark Mode'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main */}
      <main className="flex-1 flex flex-col min-w-0">
        <div className="md:hidden h-14 shrink-0" />
        <div className="flex-1 p-4 md:p-6 lg:p-8">
          <Suspense fallback={null}>
            <Outlet />
          </Suspense>
        </div>
      </main>
    </div>
  );
}
