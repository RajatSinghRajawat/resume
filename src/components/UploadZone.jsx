const ACCEPTED = {
  'application/pdf': '.pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
}

export default function UploadZone({
  onAnalyze,
  loading,
  error,
  errorRetryable,
  onRetry,
}) {
  const handleFile = (file) => {
    if (!file) return
    if (!ACCEPTED[file.type]) {
      onAnalyze(null, 'Please upload a PDF or DOCX file.')
      return
    }
    onAnalyze(file)
  }

  const onDrop = (e) => {
    e.preventDefault()
    e.currentTarget.classList.remove('upload--drag')
    handleFile(e.dataTransfer.files[0])
  }

  const onDragOver = (e) => {
    e.preventDefault()
    e.currentTarget.classList.add('upload--drag')
  }

  const onDragLeave = (e) => {
    e.currentTarget.classList.remove('upload--drag')
  }

  return (
    <section className="upload" id="upload">
      <div
        className="upload__dropzone"
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
      >
        <div className="upload__icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M12 16V4m0 0L8 8m4-4 4 4" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M4 17v2a2 2 0 002 2h12a2 2 0 002-2v-2" strokeLinecap="round" />
          </svg>
        </div>

        <h2>Drop your resume here</h2>
        <p>PDF or DOCX · Max recommended 5MB</p>

        <label className="upload__btn">
          {loading ? 'Analyzing…' : 'Choose File'}
          <input
            type="file"
            accept=".pdf,.docx"
            disabled={loading}
            hidden
            onChange={(e) => handleFile(e.target.files?.[0])}
          />
        </label>
      </div>

      {error && (
        <div className="upload__error" role="alert">
          <p className="upload__error-title">
            {errorRetryable ? 'AI is temporarily busy' : 'Something went wrong'}
          </p>
          <p className="upload__error-text">{error}</p>
          {errorRetryable && onRetry && (
            <button
              type="button"
              className="upload__retry"
              onClick={onRetry}
              disabled={loading}
            >
              Try again
            </button>
          )}
        </div>
      )}

      {loading && (
        <div className="upload__loading">
          <div className="upload__spinner" />
          <p>AI is reading your resume…</p>
          <span>Trying multiple models if needed — usually 15–30 seconds</span>
        </div>
      )}
    </section>
  )
}
