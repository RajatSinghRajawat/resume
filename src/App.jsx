import { useRef, useState } from 'react'
import { analyzeResume, AnalyzeError } from './api/resumeApi'
import Header from './components/Header'
import UploadZone from './components/UploadZone'
import AnalysisResults from './components/AnalysisResults'

const FEATURES = [
  {
    title: 'ATS Matching',
    desc: 'Compare your CV against specific job descriptions to find alignment.',
    icon: '🎯',
  },
  {
    title: 'XYZ Bullet Optimizer',
    desc: 'Rewrite bullet points using Google\'s formula (Action + Metric + Tech).',
    icon: '⚡',
  },
  {
    title: 'AI Cover Letter',
    desc: 'Craft structured, tailored cover letters customized for the target job.',
    icon: '✨',
  },
  {
    title: 'Mock Interview Prep',
    desc: 'Get highly personalized interview questions based on your background.',
    icon: '🚀',
  },
]

function App() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [errorRetryable, setErrorRetryable] = useState(false)
  const [result, setResult] = useState(null)
  const [extractedText, setExtractedText] = useState('')
  const [fileName, setFileName] = useState('')
  
  // Track JD used for matching so we can pass it down to results
  const [targetJd, setTargetJd] = useState('')

  const lastFileRef = useRef(null)
  const lastJdRef = useRef('')

  const runAnalysis = async (file, jobDescription = "") => {
    setError('')
    setErrorRetryable(false)
    setResult(null)
    setExtractedText('')
    setFileName(file.name)
    setTargetJd(jobDescription)

    lastFileRef.current = file
    lastJdRef.current = jobDescription
    setLoading(true)

    try {
      // API returns both the JSON analysis AND the raw extracted text
      const response = await analyzeResume(file, jobDescription)
      
      setResult(response.analysis)
      setExtractedText(response.extractedText)

      setTimeout(() => {
        document.getElementById('results')?.scrollIntoView({ behavior: 'smooth' })
      }, 100)
    } catch (err) {
      const retryable = err instanceof AnalyzeError ? err.retryable : true
      setErrorRetryable(retryable)
      setError(
        err instanceof AnalyzeError
          ? err.message
          : 'Something went wrong. Please check if your backend server is running.'
      )
    } finally {
      setLoading(false)
    }
  }

  const handleAnalyze = async (file, validationError, jobDescription = "") => {
    if (validationError) {
      setError(validationError)
      setErrorRetryable(false)
      return
    }
    await runAnalysis(file, jobDescription)
  }

  const handleRetry = () => {
    if (lastFileRef.current && !loading) {
      runAnalysis(lastFileRef.current, lastJdRef.current)
    }
  }

  return (
    <div className="app">
      {/* Dynamic Cosmic Background Glow Elements */}
      <div className="app__glow app__glow--1" />
      <div className="app__glow app__glow--2" />

      <Header />

      <main>
        {/* Hero Section */}
        <section className="hero">
          <span className="hero__badge">Powered by Gemini AI 2.5</span>
          <h1>
            Transform your resume into a
            <span> job magnet</span>
          </h1>
          <p>
            Upload your CV and optional target Job Description. Get instant ATS compatibility score,
            detailed skill gap reports, AI cover letters, and STAR-method interview practice.
          </p>
        </section>

        {/* File Drop & JD Pasteur zone */}
        <UploadZone
          onAnalyze={handleAnalyze}
          loading={loading}
          error={error}
          errorRetryable={errorRetryable}
          onRetry={handleRetry}
        />

        {/* Detailed Career Suite Dashboard results */}
        {result && (
          <AnalysisResults
            analysis={result}
            fileName={fileName}
            extractedText={extractedText}
            initialJd={targetJd}
          />
        )}

        {/* Feature Cards Grid */}
        <section className="features" id="features">
          <h2>Your Complete AI Career Co-Pilot</h2>
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
        <p>ResumeAI Career Suite · Built with React & Express · Deploy-Ready CI/CD Dockerization</p>
      </footer>
    </div>
  )
}

export default App
