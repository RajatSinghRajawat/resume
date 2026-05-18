import { useId } from 'react'

const EMPTY = {
  atsScore: null,
  strengths: [],
  weaknesses: [],
  improvements: [],
  missingKeywords: [],
  summary: '',
}

function safeSvgId(reactId) {
  return reactId.replace(/:/g, '')
}

function ScoreRing({ score, gradientId }) {
  const radius = 54
  const circumference = 2 * Math.PI * radius

  const pct =
    typeof score === 'number' && Number.isFinite(score)
      ? Math.min(100, Math.max(0, score))
      : null

  const offset =
    pct === null ? circumference : circumference - (pct / 100) * circumference

  const grade =
    pct === null
      ? null
      : pct >= 85
        ? 'Excellent'
        : pct >= 70
          ? 'Good'
          : pct >= 55
            ? 'Fair'
            : 'Needs work'

  const ariaLabel =
    pct !== null
      ? `ATS score ${Math.round(pct)} out of 100. ${grade}.`
      : 'ATS score unavailable.'

  return (
    <div className="score-ring" role="img" aria-label={ariaLabel}>
      <svg viewBox="0 0 120 120" aria-hidden="true">
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6366f1" />
            <stop offset="100%" stopColor="#22d3ee" />
          </linearGradient>
        </defs>
        <circle className="score-ring__track" cx="60" cy="60" r={radius} />
        <circle
          className="score-ring__progress"
          cx="60"
          cy="60"
          r={radius}
          stroke={`url(#${gradientId})`}
          style={{
            strokeDasharray: circumference,
            strokeDashoffset: offset,
          }}
        />
      </svg>
      <div className="score-ring__content">
        <span className="score-ring__value">{pct !== null ? Math.round(pct) : '—'}</span>
        <span className="score-ring__label">ATS score</span>
        {grade && <span className="score-ring__grade">{grade}</span>}
      </div>
    </div>
  )
}

function SectionCard({ title, icon, items, variant = 'default' }) {
  if (!items?.length) return null

  return (
    <article className={`section-card section-card--${variant}`}>
      <div className="section-card__head">
        <span className="section-card__icon" aria-hidden="true">
          {icon}
        </span>
        <h3>{title}</h3>
      </div>
      <ul>
        {items.map((item, i) => (
          <li key={`${title}-${i}`}>{item}</li>
        ))}
      </ul>
    </article>
  )
}

function SummaryCard({ summary }) {
  if (!summary?.trim()) return null

  return (
    <article className="summary-card">
      <div className="summary-card__head">
        <span className="summary-card__icon" aria-hidden="true">
          ◈
        </span>
        <h3>Professional summary</h3>
      </div>
      <p>{summary.trim()}</p>
    </article>
  )
}

function formatMetaLine(data) {
  const parts = []
  if (data.strengths?.length) parts.push(`${data.strengths.length} strengths`)
  if (data.missingKeywords?.length) parts.push(`${data.missingKeywords.length} keywords`)
  if (data.improvements?.length) parts.push(`${data.improvements.length} improvements`)
  if (data.weaknesses?.length) parts.push(`${data.weaknesses.length} focus areas`)
  return parts.length ? parts.join(' · ') : null
}

export default function AnalysisResults({ analysis: analysisProp, fileName = '' }) {
  const analysis = {
    ...EMPTY,
    ...(analysisProp && typeof analysisProp === 'object' ? analysisProp : {}),
  }

  const gradientReactId = useId()
  const gradientId = safeSvgId(gradientReactId)
  const metaLine = formatMetaLine(analysis)
  const titleId = 'analysis-results-title'
  const displayName = fileName?.trim() || 'Your resume'

  const atsScore =
    typeof analysis.atsScore === 'number' && Number.isFinite(analysis.atsScore)
      ? Math.min(100, Math.max(0, Math.round(analysis.atsScore)))
      : null

  return (
    <section className="results" id="results" role="region" aria-labelledby={titleId}>
      <div className="results__header">
        <div>
          <p className="results__eyebrow">Analysis complete</p>
          <h2 id={titleId}>{displayName}</h2>
          {metaLine && <p className="results__summary">{metaLine}</p>}
        </div>
        <ScoreRing score={atsScore} gradientId={gradientId} />
      </div>

      <SummaryCard summary={analysis.summary} />

      <div className="results__grid">
        <SectionCard title="Strengths" icon="✦" items={analysis.strengths} variant="success" />
        <SectionCard title="Weaknesses" icon="!" items={analysis.weaknesses} variant="warning" />
        <SectionCard
          title="Missing keywords"
          icon="+"
          items={analysis.missingKeywords}
          variant="info"
        />
        <SectionCard
          title="Improvements"
          icon="→"
          items={analysis.improvements}
          variant="accent"
        />
      </div>
    </section>
  )
}
