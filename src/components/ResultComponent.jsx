import { useEffect, useState } from 'react'
import { CheckCircle2, XCircle, Fingerprint, TrendingUp, ShieldCheck, Database, Loader2, AlertCircle, Droplets, Milk, Beef, Calendar, User, Dna, Wheat, Tag } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { cn } from '../utils/cn'

function SkeletonLoader() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-[var(--bg-surface)]" />
        <div className="space-y-2 flex-1">
          <div className="h-4 bg-[var(--bg-surface)] rounded w-2/3" />
          <div className="h-3 bg-[var(--bg-surface)] rounded w-1/3" />
        </div>
      </div>
      <div className="h-2 bg-[var(--bg-surface)] rounded-full" />
    </div>
  )
}

function InfoRow({ label, value, icon: Icon, delay = 0 }) {
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), delay)
    return () => clearTimeout(timer)
  }, [delay])

  if (!value) return null

  return (
    <div className={cn(
      "flex items-center gap-3 p-3 rounded-xl bg-[var(--bg-secondary)]/50 border border-[var(--border-color)]/30 transition-all duration-500",
      visible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-4"
    )}>
      {Icon && <Icon className="w-4 h-4 text-[var(--accent)] shrink-0" />}
      <div className="flex-1 min-w-0">
        <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider font-mono">{label}</p>
        <p className="text-sm font-medium text-[var(--text-primary)] truncate">{value}</p>
      </div>
    </div>
  )
}

function ParentCard({ label, data, delay }) {
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), delay)
    return () => clearTimeout(timer)
  }, [delay])

  if (!data) return null

  return (
    <div className={cn(
      "p-4 rounded-xl bg-[var(--bg-secondary)]/50 border border-[var(--border-color)]/30 transition-all duration-500",
      visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
    )}>
      <div className="flex items-center gap-2 mb-3">
        <Dna className="w-4 h-4 text-[var(--accent)]" />
        <span className="text-xs font-semibold text-[var(--text-primary)]">{label}</span>
      </div>
      <div className="space-y-2">
        {data.nni && <InfoRow label="NNI" value={data.nni} icon={Tag} />}
        {data.num && <InfoRow label="Num" value={data.num} icon={Tag} />}
        {data.nom && <InfoRow label="Nom" value={data.nom} icon={User} />}
        {data.dtenai && <InfoRow label="Date" value={data.dtenai} icon={Calendar} />}
        {data.race && <InfoRow label="Race" value={data.race} icon={Beef} />}
      </div>
    </div>
  )
}

function LactationCard({ lactation, index, delay }) {
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), delay)
    return () => clearTimeout(timer)
  }, [delay])

  return (
    <div className={cn(
      "p-4 rounded-xl bg-[var(--bg-secondary)]/50 border border-[var(--border-color)]/30 transition-all duration-500",
      visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
    )}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Droplets className="w-4 h-4 text-[var(--accent)]" />
          <span className="text-xs font-semibold text-[var(--text-primary)]">
            Lactation #{lactation.numlact || index + 1}
          </span>
        </div>
        <span className="text-[10px] text-[var(--text-muted)] font-mono">{lactation.dtevel}</span>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="p-2 rounded-lg bg-[var(--bg-primary)]/50">
          <p className="text-[10px] text-[var(--text-muted)]">Milk (kg)</p>
          <p className="text-sm font-mono font-semibold text-[var(--text-primary)]">{lactation.kg_lait}</p>
        </div>
        <div className="p-2 rounded-lg bg-[var(--bg-primary)]/50">
          <p className="text-[10px] text-[var(--text-muted)]">Fat %</p>
          <p className="text-sm font-mono font-semibold text-[var(--text-primary)]">{lactation.p_mg}%</p>
        </div>
        <div className="p-2 rounded-lg bg-[var(--bg-primary)]/50">
          <p className="text-[10px] text-[var(--text-muted)]">Fat (kg)</p>
          <p className="text-sm font-mono font-semibold text-[var(--text-primary)]">{lactation.kg_mg}</p>
        </div>
        <div className="p-2 rounded-lg bg-[var(--bg-primary)]/50">
          <p className="text-[10px] text-[var(--text-muted)]">Protein %</p>
          <p className="text-sm font-mono font-semibold text-[var(--text-primary)]">{lactation.p_prot}%</p>
        </div>
      </div>
      <div className="mt-2 flex items-center gap-2 text-[10px] text-[var(--text-muted)]">
        <Wheat className="w-3 h-3" />
        <span>Prot: {lactation.kg_prot}kg • Farmer: {lactation.cin_eleveur}</span>
      </div>
    </div>
  )
}

function DatabasePanel({ data, isLoading, error, t }) {
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    if (data || error) setTimeout(() => setVisible(true), 100)
  }, [data, error])

  if (isLoading) {
    return (
      <div className="glass-panel p-6 mt-4">
        <div className="flex items-center gap-3 mb-4">
          <Database className="w-5 h-5 text-[var(--accent)] animate-pulse" />
          <span className="text-sm font-semibold text-[var(--text-primary)]">{t('database.loading')}</span>
        </div>
        <SkeletonLoader />
      </div>
    )
  }

  if (error) {
    return (
      <div className={cn("glass-panel p-6 mt-4 border-[var(--error)]/20", visible && "animate-fade-in-up")}>
        <div className="flex items-center gap-2 text-[var(--error)]">
          <AlertCircle className="w-4 h-4" />
          <span className="text-sm">{t('database.error')}</span>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="glass-panel p-6 mt-4 border border-[var(--warning)]/20 animate-fade-in-up">
        <div className="flex items-center gap-2 text-[var(--warning)]">
          <AlertCircle className="w-4 h-4" />
          <span className="text-sm">{t('database.noData')}</span>
        </div>
      </div>
    )
  }

  const id = data

  return (
    <div className={cn("glass-panel p-6 mt-4", visible && "animate-fade-in-up")}>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-[var(--accent)]/10 flex items-center justify-center border border-[var(--accent)]/20">
          <Database className="w-5 h-5 text-[var(--accent)]" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-[var(--text-primary)]">{t('database.title')}</h3>
          <p className="text-xs text-[var(--text-muted)] font-mono">{id.nni}</p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Identification */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Fingerprint className="w-4 h-4 text-[var(--accent)]" />
            <span className="text-xs font-semibold text-[var(--text-primary)] uppercase tracking-wider">{t('database.identification')}</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <InfoRow label={t('database.nni')} value={id.nni} icon={Tag} delay={100} />
            <InfoRow label={t('database.race')} value={id.race} icon={Beef} delay={150} />
            <InfoRow label={t('database.birthDate')} value={id.dtenai} icon={Calendar} delay={200} />
            <InfoRow label={t('database.sex')} value={id.sexe} icon={User} delay={250} />
            <InfoRow label={t('database.type')} value={id.type} icon={Tag} delay={300} />
          </div>
        </div>

        {/* Parents */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {id.mere && <ParentCard label={t('database.mother')} data={id.mere} delay={350} />}
          {id.pere && <ParentCard label={t('database.father')} data={id.pere} delay={400} />}
          {id.gpp && <ParentCard label={t('database.gpp')} data={id.gpp} delay={450} />}
          {id.gmp && <ParentCard label={t('database.gmp')} data={id.gmp} delay={500} />}
          {id.gpm && <ParentCard label={t('database.gpm')} data={id.gpm} delay={550} />}
          {id.gmm && <ParentCard label={t('database.gmm')} data={id.gmm} delay={600} />}
        </div>

        {/* Lactations */}
        {id.lactations && id.lactations.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Milk className="w-4 h-4 text-[var(--accent)]" />
              <span className="text-xs font-semibold text-[var(--text-primary)] uppercase tracking-wider">{t('database.lactations')}</span>
            </div>
            <div className="space-y-3">
              {id.lactations.map((lact, i) => (
                <LactationCard key={i} lactation={lact} index={i} delay={650 + i * 100} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function ResultComponent({ result, isLoading, error, className }) {
  const { t, i18n } = useTranslation()
  const [visible, setVisible] = useState(false)
  const isRTL = i18n.language === 'ar'

  useEffect(() => {
    if (result || error) {
      setVisible(true)
    }
  }, [result, error])

  const parsed = result?.parsed
  const dbData = result?.dbData

  if (isLoading && !parsed) {
    return (
      <div className={cn("glass-panel p-6 animate-fade-in-up", className)}>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-[var(--accent)]/10 flex items-center justify-center border border-[var(--accent)]/20">
            <Fingerprint className="w-5 h-5 text-[var(--accent)] animate-pulse" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-[var(--text-primary)]">{t('result.analyzing')}</h3>
            <p className="text-xs text-[var(--text-muted)]">{t('result.processing')}</p>
          </div>
        </div>
        <SkeletonLoader />
      </div>
    )
  }

  if (error) {
    return (
      <div className={cn(
        "glass-panel p-6 animate-fade-in-up border-[var(--error)]/30",
        className
      )}>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-[var(--error)]/10 flex items-center justify-center border border-[var(--error)]/20">
            <XCircle className="w-5 h-5 text-[var(--error)]" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-[var(--text-primary)]">{t('result.analysisFailed')}</h3>
            <p className="text-xs text-[var(--text-muted)]">{t('result.tryAgain')}</p>
          </div>
        </div>
        <div className="p-3 rounded-lg bg-[var(--error)]/5 border border-[var(--error)]/10">
          <p className="text-xs text-[var(--error)]/80 leading-relaxed">{error}</p>
        </div>
      </div>
    )
  }

  if (!parsed) return null

  const isFound = parsed.isFound

  return (
      <div className={cn(
        "glass-panel p-6 animate-fade-in-up",
        visible && "opacity-100",
        className
      )}>
        {/* Header */}
        <div className={cn("flex items-start justify-between mb-6", isRTL && "flex-row-reverse")}>
          <div className={cn("flex items-center gap-3", isRTL && "flex-row-reverse")}>
            <div className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center border",
              isFound 
                ? "bg-[var(--accent)]/10 border-[var(--accent)]/20" 
                : "bg-[var(--warning)]/10 border-[var(--warning)]/20"
            )}>
              {isFound ? (
                <CheckCircle2 className="w-5 h-5 text-[var(--accent)]" />
              ) : (
                <XCircle className="w-5 h-5 text-[var(--warning)]" />
              )}
            </div>
            <div>
              <div className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
                <h3 className="text-sm font-semibold text-[var(--text-primary)]">
                  {isFound ? t('result.found') : t('result.notFound')}
                </h3>
                {/* Only show confidence pill if found */}
                {isFound && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full border text-[var(--accent)] bg-[var(--accent)]/10 border-[var(--accent)]/20">
                    {parsed.confidence.toFixed(1)}%
                  </span>
                )}
              </div>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">{parsed.statusText}</p>
            </div>
          </div>
          <ShieldCheck className="w-5 h-5 text-[var(--text-muted)]/30" />
        </div>

        {/* Main Result */}
        <div className="mb-2 p-4 rounded-xl bg-[var(--bg-secondary)]/50 border border-[var(--border-color)]/30">
          <div className={cn("flex items-center justify-between mb-3", isRTL && "flex-row-reverse")}>
            <div className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
              <Database className="w-4 h-4 text-[var(--accent)]/60" />
              <span className="text-xs text-[var(--text-muted)] font-mono uppercase tracking-wider">{t('result.cowId')}</span>
            </div>
            {isFound && <TrendingUp className="w-4 h-4 text-[var(--accent)]/60" />}
          </div>
          
          <p className="text-2xl font-bold text-[var(--text-primary)] font-mono tracking-tight">
            {isFound ? (parsed.fullNni || parsed.cowId) : "INCONNU"}
          </p>
          
          {/* Only show progress bar and score text if found */}
          {isFound && (
            <div className="mt-3">
              <div className={cn("flex items-center justify-between mb-1.5", isRTL && "flex-row-reverse")}>
                <span className="text-xs text-[var(--text-muted)]">{t('result.confidence')}</span>
                <span className="text-xs font-mono text-[var(--accent)]">{parsed.confidenceText}</span>
              </div>
              <div className="h-2.5 bg-[var(--bg-secondary)] rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[var(--accent-dim)] via-[var(--accent)] to-[var(--accent)] rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${Math.min(parsed.confidence, 100)}%`, boxShadow: '0 0 10px var(--accent-glow)' }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Database Panel */}
        {isFound ? (
          <DatabasePanel data={dbData} isLoading={isLoading} error={null} t={t} />
        ) : (
          /* Render a clean "No Data" message directly if not found */
          <div className="glass-panel p-6 mt-4 border border-[var(--warning)]/20 animate-fade-in-up">
            <div className="flex items-center gap-2 text-[var(--warning)]">
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm">{t('database.noData')}</span>
            </div>
          </div>
        )}
      </div>
    )
  }