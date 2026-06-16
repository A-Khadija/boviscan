import { ScanLine, Activity, Moon, Sun, Globe } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { cn } from '../utils/cn'
import { useTheme } from '../context/ThemeContext'

export default function Navbar({ className }) {
  const { t, i18n } = useTranslation()
  const { theme, toggleTheme } = useTheme()

  const currentLang = i18n.language || 'fr'
  const isRTL = currentLang === 'ar'

  const toggleLanguage = () => {
    const newLang = currentLang === 'fr' ? 'ar' : 'fr'
    i18n.changeLanguage(newLang)
  }

  return (
    <nav className={cn(
      "fixed top-0 left-0 right-0 z-50 backdrop-blur-xl border-b",
      "bg-[var(--bg-primary)]/80 border-[var(--border-color)]/50",
      className
    )}>
      <div className="w-full px-2 sm:px-4 lg:px-8">
        <div className={cn(
          "flex items-center justify-between h-14 sm:h-16 gap-2 sm:gap-4",
          isRTL && "flex-row-reverse"
        )}>
          {/* Logo - Left/Right based on RTL */}
          <div className={cn("flex items-center gap-1.5 sm:gap-2.5 flex-shrink-0 min-w-0")}>
            <div className="relative flex-shrink-0">
              <div className="w-8 sm:w-9 h-8 sm:h-9 rounded-lg bg-[var(--accent)]/10 flex items-center justify-center border border-[var(--accent)]/20 transition-all hover:bg-[var(--accent)]/15">
                <ScanLine className="w-4 sm:w-5 h-4 sm:h-5 text-[var(--accent)]" />
              </div>
              <div className="absolute -top-0.5 -right-0.5 w-2 sm:w-2.5 h-2 sm:h-2.5 bg-[var(--accent)] rounded-full animate-pulse" />
            </div>
            <div className={cn("flex flex-col min-w-0", isRTL ? "items-end" : "items-start")}>
              <span className="text-sm sm:text-base lg:text-lg font-bold tracking-tight text-[var(--text-primary)] whitespace-nowrap">
                Bovi<span className="text-[var(--accent)]">Scan</span>
              </span>
              <span className="text-[7px] sm:text-[9px] lg:text-[10px] text-[var(--text-muted)] font-mono tracking-widest uppercase line-clamp-1">
                {t('app.subtitle')}
              </span>
            </div>
          </div>

          {/* Center: API Status - Hidden on mobile, flexible on desktop */}
          <div className={cn(
            "hidden lg:flex items-center gap-2 px-2.5 py-1 rounded-lg",
            "bg-[var(--bg-surface)]/50 border border-[var(--border-color)]/30",
            "flex-shrink-0"
          )}>
            <Activity className="w-3 h-3 text-[var(--text-muted)] flex-shrink-0" />
            <span className="text-[10px] text-[var(--text-muted)] font-mono tracking-wider whitespace-nowrap">
              {t('nav.logoPlaceholder')}
            </span>
          </div>

          {/* Right: Controls - Right/Left based on RTL */}
          <div className={cn("flex items-center gap-1 sm:gap-1.5 flex-shrink-0")}>
            {/* Status indicator - Dot only on mobile, with label on tablet+ */}
            <div className={cn(
              "flex items-center px-1.5 sm:px-2.5 py-1 rounded-lg", 
              "bg-[var(--bg-surface)]/50 border border-[var(--border-color)]/30",
              isRTL && "flex-row-reverse"
            )}>
              <div className="w-1.5 sm:w-2 h-1.5 sm:h-2 rounded-full bg-[var(--accent)] animate-pulse flex-shrink-0" />
              <span className="text-[10px] sm:text-xs text-[var(--text-secondary)] font-medium hidden sm:inline whitespace-nowrap ml-1.5 sm:ml-2">
                {t('nav.apiConnected')}
              </span>
            </div>

            {/* Language Switcher - Icon only on mobile, with label on tablet+ */}
            <button
              onClick={toggleLanguage}
              className={cn(
                "flex items-center gap-0.5 sm:gap-1.5 px-1.5 sm:px-2.5 py-1 rounded-lg",
                "bg-[var(--bg-surface)] border border-[var(--border-color)]",
                "text-[var(--text-secondary)] hover:text-[var(--text-primary)]",
                "hover:border-[var(--border-light)] transition-all text-[10px] sm:text-xs font-medium",
                "flex-shrink-0",
                isRTL && "flex-row-reverse"
              )}
              title={t('nav.language')}
            >
              <Globe className="w-3.5 sm:w-4 h-3.5 sm:h-4 flex-shrink-0" />
              <span className="font-mono hidden sm:inline">{currentLang === 'fr' ? 'FR' : 'AR'}</span>
              <span className="font-mono inline sm:hidden">{currentLang === 'fr' ? 'FR' : 'AR'}</span>
            </button>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className={cn(
                "w-7 sm:w-8 h-7 sm:h-8 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-color)]",
                "flex items-center justify-center text-[var(--text-secondary)]",
                "hover:text-[var(--text-primary)] hover:border-[var(--border-light)]",
                "transition-all flex-shrink-0"
              )}
              title={t('nav.theme')}
            >
              {theme === 'dark' ? (
                <Sun className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
              ) : (
                <Moon className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
              )}
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}
