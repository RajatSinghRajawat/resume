const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080'

console.log("🔗 API_BASE configured as:", API_BASE)

export class AnalyzeError extends Error {
  constructor(message, { retryable = false, code = null, status = 0 } = {}) {
    super(message)
    this.name = 'AnalyzeError'
    this.retryable = retryable
    this.code = code
    this.status = status
  }
}

/**
 * Validate analysis response from server
 */
function validateAnalysis(analysis) {
  if (!analysis || typeof analysis !== 'object') {
    throw new AnalyzeError('Server returned invalid analysis data.', {
      retryable: true,
      code: 'INVALID_ANALYSIS',
    })
  }

  if (typeof analysis.atsScore !== 'number' || !Number.isFinite(analysis.atsScore)) {
    throw new AnalyzeError('ATS score missing or invalid from server response.', {
      retryable: true,
      code: 'INVALID_ANALYSIS',
    })
  }

  return analysis
}

/**
 * Sends resume for analysis
 */
export async function analyzeResume(file, jobDescription = "") {
  if (!file) {
    throw new AnalyzeError('Resume file is required.', { code: 'MISSING_FILE' })
  }

  const formData = new FormData()
  formData.append('resume', file)

  if (jobDescription?.trim()) {
    formData.append('jobDescription', jobDescription.trim())
  }

  let response
  try {
    response = await fetch(`${API_BASE}/api/resume/analyze`, {
      method: 'POST',
      body: formData,
      // timeout: 60 seconds
      signal: AbortSignal.timeout(60000),
    })
  } catch (err) {
    if (err.name === 'TimeoutError') {
      throw new AnalyzeError('Request timed out. Please try again.', {
        retryable: true,
        code: 'TIMEOUT'
      })
    }
    throw new AnalyzeError(
      'Cannot reach the server. Please check your internet and backend server.',
      { retryable: true, code: 'NETWORK' }
    )
  }

  let data
  try {
    data = await response.json()
  } catch {
    throw new AnalyzeError('Invalid JSON response from server.', { retryable: true })
  }

  if (!response.ok || !data.success) {
    throw new AnalyzeError(
      data.message || 'Failed to analyze resume',
      {
        retryable: Boolean(data.retryable),
        code: data.code ?? null,
        status: response.status,
      }
    )
  }

  return {
    analysis: validateAnalysis(data.analysis),
    extractedText: data.extractedText || "",
  }
}

/**
 * Generate Cover Letter
 */
export async function generateCoverLetter(resumeText, jobDescription) {
  if (!resumeText?.trim()) {
    throw new AnalyzeError('Resume text is required for cover letter.', { code: 'MISSING_RESUME_TEXT' })
  }
  if (!jobDescription?.trim()) {
    throw new AnalyzeError('Job description is required for cover letter.', { code: 'MISSING_JOB_DESC' })
  }

  let response
  try {
    response = await fetch(`${API_BASE}/api/resume/cover-letter`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ resumeText: resumeText.trim(), jobDescription: jobDescription.trim() }),
      signal: AbortSignal.timeout(45000), // 45 seconds
    })
  } catch (err) {
    if (err.name === 'TimeoutError') {
      throw new AnalyzeError('Cover letter generation timed out.', { retryable: true, code: 'TIMEOUT' })
    }
    throw new AnalyzeError('Cannot reach server for cover letter.', { retryable: true, code: 'NETWORK' })
  }

  let data
  try {
    data = await response.json()
  } catch {
    throw new AnalyzeError('Invalid cover letter response from server.', { retryable: true })
  }

  if (!response.ok || !data.success) {
    throw new AnalyzeError(data.message || 'Failed to generate cover letter', {
      retryable: Boolean(data.retryable),
      code: data.code ?? null,
      status: response.status,
    })
  }

  return data.coverLetter
}

/**
 * Generate Interview Preparation
 */
export async function generateInterviewPrep(resumeText, jobDescription) {
  if (!resumeText?.trim()) {
    throw new AnalyzeError('Resume text is required for interview prep.', { code: 'MISSING_RESUME_TEXT' })
  }
  if (!jobDescription?.trim()) {
    throw new AnalyzeError('Job description is required for interview prep.', { code: 'MISSING_JOB_DESC' })
  }

  let response
  try {
    response = await fetch(`${API_BASE}/api/resume/interview-prep`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ resumeText: resumeText.trim(), jobDescription: jobDescription.trim() }),
      signal: AbortSignal.timeout(60000),
    })
  } catch (err) {
    if (err.name === 'TimeoutError') {
      throw new AnalyzeError('Interview prep generation timed out.', { retryable: true, code: 'TIMEOUT' })
    }
    throw new AnalyzeError('Cannot reach server for interview prep.', { retryable: true, code: 'NETWORK' })
  }

  let data
  try {
    data = await response.json()
  } catch {
    throw new AnalyzeError('Invalid interview prep response from server.', { retryable: true })
  }

  if (!response.ok || !data.success) {
    throw new AnalyzeError(data.message || 'Failed to generate interview prep', {
      retryable: Boolean(data.retryable),
      code: data.code ?? null,
      status: response.status,
    })
  }

  return data.interviewQuestions
}