import { useTheme } from '@/hooks/use-theme';
import { LOGOS } from '@/config/branding';
import { cn } from '@/lib/utils';

type ThemeLogoProps = {
  className?: string;
};

/**
 * Renders the appropriate logo for the current theme:
 * - Dark theme → light logo (forDark)
 * - Light theme → dark logo (forLight)
 */
export function ThemeLogo({ className }: ThemeLogoProps) {
  const { theme } = useTheme();
  const resolved = theme === 'dark' ? LOGOS.forDark : LOGOS.forLight;

  return (
    <img
      src={resolved}
      alt="Neurologix"
      className={cn('object-contain', className)}
    />
  );
}
