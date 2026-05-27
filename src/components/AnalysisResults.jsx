import { useState } from 'react'
import { generateCoverLetter, generateInterviewPrep } from '../api/resumeApi'

const EMPTY = {
  atsScore: null,
  strengths: [],
  weaknesses: [],
  improvements: [],
  missingKeywords: [],
  summary: '',
}

export default function AnalysisResults({ analysis: analysisProp, fileName = '', extractedText = '', initialJd = '' }) {
  const analysis = {
    ...EMPTY,
    ...(analysisProp && typeof analysisProp === 'object' ? analysisProp : {}),
  }

  // Active Tab State: 'dashboard', 'skills', 'optimizer', 'coverletter', 'interview'
  const [activeTab, setActiveTab] = useState('dashboard')

  // Job Description state (can be initialized from initialJd, or pasted on-demand)
  const [jdText, setJdText] = useState(initialJd || '')
  const [editingJd, setEditingJd] = useState(!initialJd)

  // Cover Letter states
  const [coverLetter, setCoverLetter] = useState('')
  const [clLoading, setClLoading] = useState(false)
  const [clError, setClError] = useState('')
  const [clCopied, setClCopied] = useState(false)

  // Interview Coach states
  const [questions, setQuestions] = useState([])
  const [intLoading, setIntLoading] = useState(false)
  const [intError, setIntError] = useState('')
  const [expandedQuestion, setExpandedQuestion] = useState(null)

  const atsScore =
    typeof analysis.atsScore === 'number' && Number.isFinite(analysis.atsScore)
      ? Math.min(100, Math.max(0, Math.round(analysis.atsScore)))
      : null

  // Score Dynamic color
  const getScoreColorClass = (score) => {
    if (score >= 80) return 'results__score--high'
    if (score >= 60) return 'results__score--medium'
    return 'results__score--low'
  }

  // Handle Cover Letter Generation
  const handleCreateCoverLetter = async () => {
    if (!extractedText) {
      setClError('Resume text is empty. Please re-upload your resume.')
      return
    }
    if (!jdText.trim()) {
      setClError('Job description is required to generate a tailored cover letter.')
      return
    }

    setClLoading(true)
    setClError('')
    setClCopied(false)

    try {
      const text = await generateCoverLetter(extractedText, jdText.trim())
      setCoverLetter(text)
    } catch (err) {
      setClError(err.message || 'Failed to generate cover letter. Please try again.')
    } finally {
      setClLoading(false)
    }
  }

  // Handle Interview Prep Generation
  const handleCreateInterviewPrep = async () => {
    if (!extractedText) {
      setIntError('Resume text is empty. Please re-upload your resume.')
      return
    }
    if (!jdText.trim()) {
      setIntError('Job description is required to generate targeted interview questions.')
      return
    }

    setIntLoading(true)
    setIntError('')
    setExpandedQuestion(null)

    try {
      const data = await generateInterviewPrep(extractedText, jdText.trim())
      setQuestions(data)
    } catch (err) {
      setIntError(err.message || 'Failed to generate interview questions. Please try again.')
    } finally {
      setIntLoading(false)
    }
  }

  const handleCopyCoverLetter = () => {
    if (!coverLetter) return
    navigator.clipboard.writeText(coverLetter)
    setClCopied(true)
    setTimeout(() => setClCopied(false), 2000)
  }

  const handlePrintCoverLetter = () => {
    const printWindow = window.open('', '_blank')
    printWindow.document.write(`
      <html>
        <head>
          <title>Cover Letter</title>
          <style>
            body { font-family: 'Plus Jakarta Sans', Arial, sans-serif; line-height: 1.6; padding: 40px; color: #1e293b; max-width: 800px; margin: 0 auto; }
            h1, h2, h3 { color: #0f172a; }
            pre { white-space: pre-wrap; font-family: inherit; font-size: 15px; }
          </style>
        </head>
        <body>
          <pre>${coverLetter}</pre>
        </body>
      </html>
    `)
    printWindow.document.close()
    printWindow.print()
  }

  return (
    <section className="results" id="results">
      {/* Premium Glassmorphic Header */}
      <div className="results__header">
        <div className="results__header-left">
          <span className="results__eyebrow">Interactive Career Suite</span>
          <h2>{fileName || 'Your Resume Analysis'}</h2>
          <p className="results__filename-sub">
            {initialJd ? '🎯 Mode: Tailored Job Description Matching' : '⚡ Mode: General ATS Analysis'}
          </p>
        </div>

        {/* Dynamic Interactive Gauge */}
        <div className={`results__score-container ${getScoreColorClass(atsScore)}`}>
          <div className="results__score-ring">
            <svg viewBox="0 0 100 100">
              <circle className="score-ring__bg" cx="50" cy="50" r="42" />
              <circle
                className="score-ring__fill"
                cx="50"
                cy="50"
                r="42"
                style={{
                  strokeDasharray: 263.89,
                  strokeDashoffset: 263.89 - (263.89 * (atsScore || 0)) / 100,
                }}
              />
            </svg>
            <div className="results__score-text">
              <span className="results__score-value">{atsScore !== null ? atsScore : '—'}</span>
              <span className="results__score-label">ATS SCORE</span>
            </div>
          </div>
        </div>
      </div>

      {/* Modern Horizontal Navigation Tabs */}
      <div className="results__tabs" role="tablist">
        <button
          className={`results__tab-btn ${activeTab === 'dashboard' ? 'results__tab-btn--active' : ''}`}
          onClick={() => setActiveTab('dashboard')}
          role="tab"
          aria-selected={activeTab === 'dashboard'}
        >
          📊 Dashboard
        </button>
        <button
          className={`results__tab-btn ${activeTab === 'skills' ? 'results__tab-btn--active' : ''}`}
          onClick={() => setActiveTab('skills')}
          role="tab"
          aria-selected={activeTab === 'skills'}
        >
          ⚡ Skills Analyzer
        </button>
        <button
          className={`results__tab-btn ${activeTab === 'optimizer' ? 'results__tab-btn--active' : ''}`}
          onClick={() => setActiveTab('optimizer')}
          role="tab"
          aria-selected={activeTab === 'optimizer'}
        >
          🚀 AI Optimizer (XYZ)
        </button>
        <button
          className={`results__tab-btn ${activeTab === 'coverletter' ? 'results__tab-btn--active' : ''}`}
          onClick={() => setActiveTab('coverletter')}
          role="tab"
          aria-selected={activeTab === 'coverletter'}
        >
          ✉ Cover Letter
        </button>
        <button
          className={`results__tab-btn ${activeTab === 'interview' ? 'results__tab-btn--active' : ''}`}
          onClick={() => setActiveTab('interview')}
          role="tab"
          aria-selected={activeTab === 'interview'}
        >
          🎓 Interview Prep
        </button>
      </div>

      {/* Tab Panels */}
      <div className="results__content-box">
        {/* TAB 1: DASHBOARD OVERVIEW */}
        {activeTab === 'dashboard' && (
          <div className="results__pane fade-in">
            {analysis.summary && (
              <div className="results__summary-card">
                <h3>Executive Summary</h3>
                <p>{analysis.summary}</p>
              </div>
            )}

            <div className="results__overview-grid">
              <div className="results__stat-card">
                <span className="results__stat-icon">✦</span>
                <div className="results__stat-info">
                  <h4>Strengths Detected</h4>
                  <p>{analysis.strengths?.length || 0} key competitive advantages</p>
                </div>
              </div>

              <div className="results__stat-card">
                <span className="results__stat-icon results__stat-icon--warning">!</span>
                <div className="results__stat-info">
                  <h4>Critical Gaps</h4>
                  <p>{analysis.weaknesses?.length || 0} areas of vulnerabilities</p>
                </div>
              </div>

              <div className="results__stat-card">
                <span className="results__stat-icon results__stat-icon--info">→</span>
                <div className="results__stat-info">
                  <h4>Actionable Suggestions</h4>
                  <p>{analysis.improvements?.length || 0} fixes to double your views</p>
                </div>
              </div>
            </div>

            <div className="results__bullet-grid">
              <div className="results__bullet-card results__bullet-card--success">
                <h4>✦ Key Strengths</h4>
                <ul>
                  {analysis.strengths?.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </div>

              <div className="results__bullet-card results__bullet-card--danger">
                <h4>! Focus Areas & Weaknesses</h4>
                <ul>
                  {analysis.weaknesses?.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: SKILLS ANALYZER */}
        {activeTab === 'skills' && (
          <div className="results__pane fade-in">
            <div className="results__skills-header">
              <h3>Technical Skills & Keyword Coverage</h3>
              <p>
                Applicant Tracking Systems parse your resume for specific terms. Having these terms
                directly in your resume drastically boosts your application rate.
              </p>
            </div>

            {initialJd && (
              <div className="results__jd-banner">
                <span className="results__jd-banner-icon">🎯</span>
                <div>
                  <h4>Tailored Job Match Active</h4>
                  <p>AI is matching keywords based on the target Job Description pasted during upload.</p>
                </div>
              </div>
            )}

            <div className="results__keywords-section">
              <h4>⚠️ Missing Crucial Keywords</h4>
              {analysis.missingKeywords?.length > 0 ? (
                <div className="results__keyword-tags">
                  {analysis.missingKeywords.map((kw, idx) => (
                    <button
                      key={idx}
                      className="results__keyword-tag"
                      onClick={() => {
                        navigator.clipboard.writeText(kw)
                        alert(`Copied "${kw}" to clipboard!`)
                      }}
                      title="Click to copy keyword"
                    >
                      + {kw}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="results__empty-state">
                  <p>🎉 Excellent! No major missing keywords identified for this search profile.</p>
                </div>
              )}
            </div>

            <div className="results__bullet-card results__bullet-card--info">
              <h4>⚡ Recommended Skills to Highlight</h4>
              <ul>
                {analysis.improvements
                  ?.filter(
                    (imp) =>
                      imp.toLowerCase().includes('skill') ||
                      imp.toLowerCase().includes('technology') ||
                      imp.toLowerCase().includes('keyword') ||
                      imp.toLowerCase().includes('add')
                  )
                  .map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                {(!analysis.improvements?.length) && <li>No specific skill recommendations found.</li>}
              </ul>
            </div>
          </div>
        )}

        {/* TAB 3: RESUME OPTIMIZER (XYZ FORMULA) */}
        {activeTab === 'optimizer' && (
          <div className="results__pane fade-in">
            <div className="results__optimizer-header">
              <h3>AI-Powered Resume Optimizer (Google XYZ Formula)</h3>
              <p>
                Recruiters and top tier companies (Google, Apple, Meta) prefer accomplishments formatted using the **XYZ Formula**: 
                <strong> "Accomplished [X], as measured by [Y], by doing [Z]"</strong>.
              </p>
            </div>

            {/* Google XYZ Formula Explainer */}
            <div className="results__xyz-explainer">
              <div className="xyz-explainer__formula">
                <span className="xyz-letter">X</span> Accomplished (Action Verb & Goal)
                <span className="xyz-operator">+</span>
                <span className="xyz-letter">Y</span> Measured By (Quantified Metrics & Performance)
                <span className="xyz-operator">+</span>
                <span className="xyz-letter">Z</span> By Doing (Specific Technologies/Actions)
              </div>
              <div className="xyz-explainer__examples">
                <div className="xyz-example">
                  <span className="xyz-example__label xyz-example__label--red">Before (Weak)</span>
                  <p>"Worked on React dashboard and improved site load time."</p>
                </div>
                <div className="xyz-example">
                  <span className="xyz-example__label xyz-example__label--green">After (XYZ Formula)</span>
                  <p>"Optimized site performance by **40% (Y)** by implementing React code-splitting and image lazy loading **(Z)**, resulting in a **15% increase in user retention (X)**."</p>
                </div>
              </div>
            </div>

            {/* Practical suggestions from AI report */}
            <div className="results__bullet-card results__bullet-card--accent">
              <h4>🚀 Actionable Section Optimization Tips</h4>
              <p className="results__helper-text">
                Apply these specific changes to rewrite your experience bullets and maximize resume impact:
              </p>
              <ul>
                {analysis.improvements?.map((item, idx) => (
                  <li key={idx} className="results__opt-item">
                    <span className="results__opt-checkbox">☐</span>
                    <div>{item}</div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* TAB 4: COVER LETTER BUILDER */}
        {activeTab === 'coverletter' && (
          <div className="results__pane fade-in">
            <div className="results__cl-header">
              <h3>Tailored AI Cover Letter Builder</h3>
              <p>
                Craft an engaging, high-impact cover letter connecting your resume highlights to the job requirements.
              </p>
            </div>

            {/* JD Input panel if not provided or editing */}
            {editingJd ? (
              <div className="results__jd-paster">
                <h4>Paste Target Job Description (Required)</h4>
                <textarea
                  className="results__jd-textarea"
                  placeholder="Paste the Job Description (JD) here to generate a tailored Cover Letter..."
                  value={jdText}
                  onChange={(e) => setJdText(e.target.value)}
                  rows={6}
                />
                <div className="results__jd-actions">
                  {initialJd && (
                    <button
                      type="button"
                      className="results__btn-secondary"
                      onClick={() => {
                        setJdText(initialJd)
                        setEditingJd(false)
                      }}
                    >
                      Reset to Uploaded JD
                    </button>
                  )}
                  <button
                    type="button"
                    className="results__btn-primary"
                    disabled={!jdText.trim()}
                    onClick={() => setEditingJd(false)}
                  >
                    Lock Job Description
                  </button>
                </div>
              </div>
            ) : (
              <div className="results__jd-active-card">
                <div className="results__jd-card-info">
                  <span>🎯 Active Job Description Loaded ({jdText.length} characters)</span>
                  <button className="results__jd-edit-btn" onClick={() => setEditingJd(true)}>
                    ✏ Edit JD
                  </button>
                </div>
              </div>
            )}

            {/* Letter generation triggers */}
            {!coverLetter && !clLoading && (
              <div className="results__cl-trigger-zone">
                <button
                  type="button"
                  className="results__btn-large"
                  disabled={editingJd || !jdText.trim()}
                  onClick={handleCreateCoverLetter}
                >
                  ✨ Generate Tailored Cover Letter (using Gemini)
                </button>
                {(!jdText.trim()) && (
                  <p className="results__warning-text">⚠️ Please paste and lock a Job Description above to unlock cover letter generation.</p>
                )}
              </div>
            )}

            {clLoading && (
              <div className="results__cl-loading">
                <div className="upload__spinner" />
                <p>Gemini is tailoring your cover letter based on your achievements…</p>
                <span>This usually takes 8–15 seconds</span>
              </div>
            )}

            {clError && (
              <div className="results__error-banner">
                <p>⚠️ Error: {clError}</p>
                <button type="button" className="results__btn-secondary" onClick={handleCreateCoverLetter}>
                  Retry Generation
                </button>
              </div>
            )}

            {/* Generated Cover Letter Preview */}
            {coverLetter && !clLoading && (
              <div className="results__cl-preview-container fade-in">
                <div className="results__cl-actions-bar">
                  <button type="button" className="results__btn-action" onClick={handleCopyCoverLetter}>
                    {clCopied ? '✓ Copied!' : '📋 Copy to Clipboard'}
                  </button>
                  <button type="button" className="results__btn-action" onClick={handlePrintCoverLetter}>
                    🖨 Print / Save as PDF
                  </button>
                  <button type="button" className="results__btn-action results__btn-action--danger" onClick={() => setCoverLetter('')}>
                    🔄 Regenerate / New
                  </button>
                </div>
                <div className="results__cl-paper">
                  <pre className="results__cl-content">{coverLetter}</pre>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 5: INTERVIEW COACH */}
        {activeTab === 'interview' && (
          <div className="results__pane fade-in">
            <div className="results__int-header">
              <h3>AI Mock Interview Preparation Coach</h3>
              <p>
                Prepare for technical and behavioral questions generated directly from your experience
                and the target job description. Focuses on the highly-coveted **STAR Method**.
              </p>
            </div>

            {/* JD Input panel if not provided or editing */}
            {editingJd ? (
              <div className="results__jd-paster">
                <h4>Paste Target Job Description (Required)</h4>
                <textarea
                  className="results__jd-textarea"
                  placeholder="Paste the Job Description (JD) here to generate customized interview preparation questions..."
                  value={jdText}
                  onChange={(e) => setJdText(e.target.value)}
                  rows={6}
                />
                <div className="results__jd-actions">
                  {initialJd && (
                    <button
                      type="button"
                      className="results__btn-secondary"
                      onClick={() => {
                        setJdText(initialJd)
                        setEditingJd(false)
                      }}
                    >
                      Reset to Uploaded JD
                    </button>
                  )}
                  <button
                    type="button"
                    className="results__btn-primary"
                    disabled={!jdText.trim()}
                    onClick={() => setEditingJd(false)}
                  >
                    Lock Job Description
                  </button>
                </div>
              </div>
            ) : (
              <div className="results__jd-active-card">
                <div className="results__jd-card-info">
                  <span>🎯 Active Job Description Loaded ({jdText.length} characters)</span>
                  <button className="results__jd-edit-btn" onClick={() => setEditingJd(true)}>
                    ✏ Edit JD
                  </button>
                </div>
              </div>
            )}

            {/* Prep generation triggers */}
            {questions.length === 0 && !intLoading && (
              <div className="results__cl-trigger-zone">
                <button
                  type="button"
                  className="results__btn-large"
                  disabled={editingJd || !jdText.trim()}
                  onClick={handleCreateInterviewPrep}
                >
                  🚀 Generate Custom STAR Interview Questions
                </button>
                {(!jdText.trim()) && (
                  <p className="results__warning-text">⚠️ Please paste and lock a Job Description above to unlock interview prep.</p>
                )}
              </div>
            )}

            {intLoading && (
              <div className="results__cl-loading">
                <div className="upload__spinner" />
                <p>Gemini is acting as your mock interviewer and generating specialized STAR questions…</p>
                <span>Creating technical & behavioral scenarios (10–18 seconds)</span>
              </div>
            )}

            {intError && (
              <div className="results__error-banner">
                <p>⚠️ Error: {intError}</p>
                <button type="button" className="results__btn-secondary" onClick={handleCreateInterviewPrep}>
                  Retry Generation
                </button>
              </div>
            )}

            {/* Generated Mock Interview Accordion */}
            {questions.length > 0 && !intLoading && (
              <div className="results__questions-container fade-in">
                <div className="results__int-actions-bar">
                  <p>💡 Click on any question to view the customized ideal response structure.</p>
                  <button type="button" className="results__btn-action results__btn-action--danger" onClick={() => setQuestions([])}>
                    🔄 Regenerate Questions
                  </button>
                </div>

                <div className="results__questions-accordion">
                  {questions.map((q) => (
                    <div
                      key={q.id}
                      className={`results__question-card ${
                        expandedQuestion === q.id ? 'results__question-card--expanded' : ''
                      }`}
                    >
                      <button
                        type="button"
                        className="results__question-trigger"
                        onClick={() => setExpandedQuestion(expandedQuestion === q.id ? null : q.id)}
                      >
                        <div className="results__question-trigger-left">
                          <span className={`results__question-type results__question-type--${q.type?.toLowerCase()}`}>
                            {q.type}
                          </span>
                          <h4>{q.question}</h4>
                        </div>
                        <span className="results__question-arrow">
                          {expandedQuestion === q.id ? '▲' : '▼'}
                        </span>
                      </button>

                      {expandedQuestion === q.id && (
                        <div className="results__question-body fade-in">
                          <div className="results__answer-badge">💡 Custom STAR Strategy:</div>
                          <p className="results__answer-text">{q.answer}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  )
}
