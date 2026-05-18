const API_BASE = import.meta.env.VITE_API_URL || ''

export class AnalyzeError extends Error {
  constructor(message, { retryable = false, code = null, status = 0 } = {}) {
    super(message)
    this.name = 'AnalyzeError'
    this.retryable = retryable
    this.code = code
    this.status = status
  }
}

function validateAnalysis(analysis) {
  if (!analysis || typeof analysis !== 'object') {
    throw new AnalyzeError('Server returned invalid analysis data.', {
      retryable: true,
      code: 'INVALID_ANALYSIS',
    })
  }

  if (
    typeof analysis.atsScore !== 'number' ||
    !Number.isFinite(analysis.atsScore)
  ) {
    throw new AnalyzeError('ATS score missing from server response.', {
      retryable: true,
      code: 'INVALID_ANALYSIS',
    })
  }

  return analysis
}

export async function analyzeResume(file) {
  const formData = new FormData()
  formData.append('resume', file)

  let response
  try {
    response = await fetch(`${API_BASE}/api/resume/analyze`, {
      method: 'POST',
      body: formData,
    })
  } catch {
    throw new AnalyzeError(
      'Cannot reach the server. Start the backend on port 5000, then try again.',
      { retryable: true, code: 'NETWORK' }
    )
  }

  let data = {}
  try {
    data = await response.json()
  } catch {
    throw new AnalyzeError('Invalid response from server.', { retryable: true })
  }

  if (!response.ok || !data.success) {
    throw new AnalyzeError(data.message || 'Failed to analyze resume', {
      retryable: Boolean(data.retryable),
      code: data.code ?? null,
      status: response.status,
    })
  }

  return validateAnalysis(data.analysis)
}
