import { useRef, useState } from 'react'
import { analyzeResume, AnalyzeError } from './api/resumeApi'
import Header from './components/Header'
import UploadZone from './components/UploadZone'
import AnalysisResults from './components/AnalysisResults'

const FEATURES = [
  {
    title: 'ATS Score',
    desc: 'Know how well your resume passes applicant tracking systems.',
    icon: '🎯',
  },
  {
    title: 'Skill Gap Analysis',
    desc: 'Discover missing skills recruiters look for in your target role.',
    icon: '⚡',
  },
  {
    title: 'Actionable Tips',
    desc: 'Get clear, practical suggestions to improve every section.',
    icon: '✨',
  },
  {
    title: 'Role Matching',
    desc: 'See which job roles best fit your current profile.',
    icon: '🚀',
  },
]

function App() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [errorRetryable, setErrorRetryable] = useState(false)
  const [result, setResult] = useState(null)
  const [fileName, setFileName] = useState('')
  const lastFileRef = useRef(null)

  const runAnalysis = async (file) => {
    setError('')
    setErrorRetryable(false)
    setResult(null)
    setFileName(file.name)
    lastFileRef.current = file
    setLoading(true)

    try {
      const analysis = await analyzeResume(file)
      setResult(analysis)
      setTimeout(() => {
        document.getElementById('results')?.scrollIntoView({ behavior: 'smooth' })
      }, 100)
    } catch (err) {
      const retryable = err instanceof AnalyzeError ? err.retryable : true
      setErrorRetryable(retryable)
      setError(
        err instanceof AnalyzeError
          ? err.message
          : 'Something went wrong. Is the backend running on port 5000?'
      )
    } finally {
      setLoading(false)
    }
  }

  const handleAnalyze = async (file, validationError) => {
    if (validationError) {
      setError(validationError)
      setErrorRetryable(false)
      return
    }
    await runAnalysis(file)
  }

  const handleRetry = () => {
    if (lastFileRef.current && !loading) {
      runAnalysis(lastFileRef.current)
    }
  }

  return (
    <div className="app">
      <div className="app__glow app__glow--1" />
      <div className="app__glow app__glow--2" />

      <Header />

      <main>
        <section className="hero">
          <span className="hero__badge">Powered by Gemini AI</span>
          <h1>
            Turn your resume into an
            <span> interview magnet</span>
          </h1>
          <p>
            Upload your CV and get instant ATS scoring, skill analysis, and personalized
            improvement tips — all in seconds.
          </p>
        </section>

        <UploadZone
          onAnalyze={handleAnalyze}
          loading={loading}
          error={error}
          errorRetryable={errorRetryable}
          onRetry={handleRetry}
        />

        {result && <AnalysisResults analysis={result} fileName={fileName} />}

        <section className="features" id="features">
          <h2>Everything you need to stand out</h2>
          <div className="features__grid">
            {FEATURES.map((f) => (
              <article key={f.title} className="feature-card">
                <span className="feature-card__icon">{f.icon}</span>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </article>
            ))}
          </div>
        </section>
      </main>

      <footer className="footer">
        <p>ResumeAI · Built with React + Gemini · Backend on Express</p>
      </footer>
    </div>
  )
}

export default App
