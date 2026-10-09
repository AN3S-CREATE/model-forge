import { Moon, Sun, Monitor, Bell, Shield, Info } from 'lucide-react';
import { useTheme } from '@/hooks/use-theme';
import { BRAND } from '@/config/branding';

export default function Settings() {
  const { theme, setTheme } = useTheme();
  const isDark = theme === 'dark';
  const isLight = theme === 'light';

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Configure your workspace preferences
        </p>
      </div>

      {/* Appearance */}
      <section className="rounded-xl border border-border bg-card p-5">
        <div className="flex items-center gap-3 mb-4">
          <Monitor className="h-5 w-5 text-primary" />
          <h2 className="font-semibold text-foreground">Appearance</h2>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <button
            onClick={() => setTheme('light')}
            className={cn(
              'flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all duration-150',
              isLight
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-muted-foreground/30',
            )}
          >
            <Sun className="h-5 w-5 text-foreground" />
            <span className="text-xs font-medium text-foreground">Light</span>
          </button>
          <button
            onClick={() => setTheme('dark')}
            className={cn(
              'flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all duration-150',
              isDark
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-muted-foreground/30',
            )}
          >
            <Moon className="h-5 w-5 text-foreground" />
            <span className="text-xs font-medium text-foreground">Dark</span>
          </button>
          <button
            onClick={() => setTheme('system')}
            className={cn(
              'flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all duration-150',
              !isDark && !isLight
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-muted-foreground/30',
            )}
          >
            <Monitor className="h-5 w-5 text-foreground" />
            <span className="text-xs font-medium text-foreground">System</span>
          </button>
        </div>
      </section>

      {/* Workspace Info */}
      <section className="rounded-xl border border-border bg-card p-5">
        <div className="flex items-center gap-3 mb-4">
          <Info className="h-5 w-5 text-primary" />
          <h2 className="font-semibold text-foreground">Workspace</h2>
        </div>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between py-2 border-b border-border">
            <span className="text-muted-foreground">Platform</span>
            <span className="text-foreground font-medium">{BRAND.fullName}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-border">
            <span className="text-muted-foreground">Projects</span>
            <span className="text-foreground font-medium tabular-nums">5 active</span>
          </div>
          <div className="flex justify-between py-2 border-b border-border">
            <span className="text-muted-foreground">AI Agents</span>
            <span className="text-foreground font-medium tabular-nums">2 configured</span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-muted-foreground">Automations</span>
            <span className="text-foreground font-medium tabular-nums">2 active</span>
          </div>
        </div>
      </section>

      {/* Notifications */}
      <section className="rounded-xl border border-border bg-card p-5">
        <div className="flex items-center gap-3 mb-4">
          <Bell className="h-5 w-5 text-primary" />
          <h2 className="font-semibold text-foreground">Notifications</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          Training job status changes are automatically logged to the Activity Feed.
          The Daily Model Digest runs every morning at 9:00 AM (Africa/Johannesburg).
        </p>
      </section>

      {/* Security */}
      <section className="rounded-xl border border-border bg-card p-5">
        <div className="flex items-center gap-3 mb-4">
          <Shield className="h-5 w-5 text-primary" />
          <h2 className="font-semibold text-foreground">Security</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          Your workspace is private. Only invited members can access projects and data.
          Manage sharing settings from the Taskade workspace settings.
        </p>
      </section>
    </div>
  );
}

function cn(...classes: (string | boolean | undefined | null)[]) {
  return classes.filter(Boolean).join(' ');
}
